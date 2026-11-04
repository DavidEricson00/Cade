import { useEffect, useId, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { resendTwoFactor, verifyTwoFactor } from '../../api/auth';
import { ApiError } from '../../api/client';
import {
  clearChallenge,
  renewChallenge,
  useChallenge,
} from '../../auth/challenge';
import { signIn } from '../../auth/session';
import { Button } from '../../components/ui/Button';
import { InlineNotice, showToast } from '../../components/ui/Toast';
import { maskEmail } from '../../lib/format';
import { usePageTitle } from '../../layout/page-title';
import styles from './AuthPages.module.css';

const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;
const INITIAL_COOLDOWN_SECONDS = 60;

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatShortCooldown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function TwoFactorPage() {
  usePageTitle('Código de verificação');

  const challenge = useChallenge();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/itens';
  const inputId = useId();
  const codeInputRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [resendsUsed, setResendsUsed] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(
    () => Date.now() + INITIAL_COOLDOWN_SECONDS * 1000,
  );
  const [now, setNow] = useState(() => Date.now());
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendLimitReached, setResendLimitReached] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  if (!challenge) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{ notice: 'Por segurança, entre de novo.', from }}
      />
    );
  }

  const expiresAt = challenge.issuedAt + challenge.expiresIn * 1000;
  const secondsToExpire = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const secondsToResend = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const isExpired = secondsToExpire === 0;
  const isLockedByAttempts = attemptsLeft <= 0;
  const canStillResend = !resendLimitReached && resendsUsed < MAX_RESENDS;
  const inputsDisabled = verifying || isExpired || isLockedByAttempts;

  async function submitCode(sixDigits: string) {
    if (!challenge || verifying || sixDigits.length !== 6) return;
    setVerifying(true);
    setErrorMessage(null);

    try {
      const result = await verifyTwoFactor(challenge.challengeToken, sixDigits);
      signIn(result.token, challenge.email);
      clearChallenge();
      showToast('Acesso liberado.', 'success');
      navigate(from, { replace: true });
    } catch (error) {
      setCode('');
      setShakeKey((prev) => prev + 1);

      if (error instanceof ApiError) {
        if (error.status === 429) {
          setAttemptsLeft(0);
          setErrorMessage(
            canStillResend
              ? 'Muitas tentativas. Peça um novo código.'
              : 'Muitas tentativas. Volte ao login para começar de novo.',
          );
        } else if (error.status === 401) {
          if (secondsToExpire === 0) {
            setErrorMessage('O código expirou. Peça um novo código.');
          } else {
            const nextAttempts = Math.max(0, attemptsLeft - 1);
            setAttemptsLeft(nextAttempts);
            if (nextAttempts === 0) {
              setErrorMessage(
                canStillResend
                  ? 'Tentativas esgotadas. Peça um novo código.'
                  : 'Tentativas esgotadas. Volte ao login para começar de novo.',
              );
            } else {
              setErrorMessage(
                `Código incorreto. ${
                  nextAttempts === 1
                    ? 'Resta 1 tentativa.'
                    : `Restam ${nextAttempts} tentativas.`
                }`,
              );
            }
          }
        } else if (error.status === 400) {
          setErrorMessage('Digite os 6 números enviados por e-mail.');
        } else if (!error.isNetworkError) {
          setErrorMessage('Não conseguimos validar o código agora. Tente novamente.');
        }
      } else {
        setErrorMessage('Não conseguimos validar o código agora. Tente novamente.');
      }

      requestAnimationFrame(() => codeInputRef.current?.focus());
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!challenge || resending || !canStillResend || secondsToResend > 0) return;
    setResending(true);
    setErrorMessage(null);

    try {
      const result = await resendTwoFactor(challenge.challengeToken);
      renewChallenge(result.challengeToken, result.expiresIn);
      setResendsUsed((prev) => prev + 1);
      setAttemptsLeft(MAX_ATTEMPTS);
      setCooldownUntil(Date.now() + (result.retryAfter || INITIAL_COOLDOWN_SECONDS) * 1000);
      setCode('');
      showToast('Enviamos um novo código.', 'success');
      requestAnimationFrame(() => codeInputRef.current?.focus());
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          if (error.retryAfter) {
            setCooldownUntil(Date.now() + error.retryAfter * 1000);
            setErrorMessage('Aguarde antes de pedir um novo código.');
          } else {
            setResendLimitReached(true);
            setErrorMessage('Limite de reenvios atingido. Entre de novo.');
          }
        } else if (error.status === 401) {
          clearChallenge();
          navigate('/entrar', {
            replace: true,
            state: {
              email: challenge.email,
              notice: 'Sua verificação expirou. Entre de novo.',
              from,
            },
          });
          return;
        } else if (error.status === 503) {
          setErrorMessage(
            'Não conseguimos enviar o código agora. Tente de novo em instantes.',
          );
        } else if (!error.isNetworkError) {
          setErrorMessage('Não foi possível reenviar o código.');
        }
      } else {
        setErrorMessage('Não foi possível reenviar o código.');
      }
    } finally {
      setResending(false);
    }
  }

  function handleCodeChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6) {
      void submitCode(digits);
    }
  }

  const activeSlot = Math.min(code.length, 5);

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1>Digite o código que enviamos</h1>
        <p className="texto-suave">
          Enviamos um código de 6 dígitos para{' '}
          <strong className="mono">{maskEmail(challenge.email)}</strong>.
        </p>
      </div>

      {/* Contador de validade */}
      <div className={styles.timerRow} aria-live="polite">
        {isExpired ? (
          <span className={styles.expiredBadge}>O código expirou</span>
        ) : (
          <span className="rotulo-mono texto-suave">
            Código expira em {formatClock(secondsToExpire)}
          </span>
        )}
        <span className="rotulo-mono texto-suave">
          Reenvio {resendsUsed} de {MAX_RESENDS}
        </span>
      </div>

      {errorMessage && <InlineNotice tone="error">{errorMessage}</InlineNotice>}

      {/* 6 caixas espelhando um único input oculto */}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submitCode(code);
        }}
        className={styles.form}
      >
        <label htmlFor={inputId} className="sr-only">
          Código de 6 dígitos
        </label>

        <div
          key={shakeKey}
          className={`${styles.otpWrap} ${shakeKey > 0 ? styles.shake : ''}`}
          onClick={() => codeInputRef.current?.focus()}
        >
          <input
            ref={codeInputRef}
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            disabled={inputsDisabled}
            value={code}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onChange={(event) => handleCodeChange(event.target.value)}
            className={styles.otpHiddenInput}
            aria-label="Código de verificação de 6 dígitos"
          />

          <div className={styles.otpBoxes} aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => {
              const char = code[index] ?? '';
              const isFocusedBox =
                inputFocused && !inputsDisabled && index === activeSlot;

              return (
                <div
                  key={index}
                  data-focused={isFocusedBox || undefined}
                  data-filled={Boolean(char) || undefined}
                  data-disabled={inputsDisabled || undefined}
                  className={styles.otpBox}
                >
                  {char}
                </div>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={inputsDisabled || code.length !== 6}
          loading={verifying}
          loadingLabel="Verificando…"
        >
          Confirmar código
        </Button>
      </form>

      {/* Reenvio e retorno */}
      <div className={styles.resendArea}>
        {canStillResend ? (
          <Button
            variant={isExpired || isLockedByAttempts ? 'primary' : 'secondary'}
            fullWidth
            disabled={secondsToResend > 0 || resending}
            loading={resending}
            loadingLabel="Reenviando…"
            onClick={handleResend}
          >
            {secondsToResend > 0
              ? `Reenviar em ${formatShortCooldown(secondsToResend)}`
              : 'Reenviar código'}
          </Button>
        ) : (
          <InlineNotice tone="warning">
            Limite de reenvios atingido.{' '}
            <Link
              to="/entrar"
              state={{ email: challenge.email, from }}
              onClick={() => clearChallenge()}
            >
              Entre de novo
            </Link>
            .
          </InlineNotice>
        )}

        <p className="texto-pequeno">
          Digitou o e-mail errado?{' '}
          <Link
            to="/entrar"
            state={{ email: challenge.email, from }}
            onClick={() => clearChallenge()}
          >
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
