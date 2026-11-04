import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { login } from '../../api/auth';
import { ApiError } from '../../api/client';
import { startChallenge } from '../../auth/challenge';
import { dismissSessionExpired, useSessionExpired } from '../../auth/session';
import { Button } from '../../components/ui/Button';
import { InputField, PasswordField } from '../../components/ui/Field';
import { InlineNotice } from '../../components/ui/Toast';
import { usePageTitle } from '../../layout/page-title';
import styles from './AuthPages.module.css';

type LoginLocationState = {
  from?: string;
  email?: string;
  notice?: string;
} | null;

export function LoginPage() {
  usePageTitle('Entrar');

  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LoginLocationState) ?? null;
  const sessionExpired = useSessionExpired();

  const [email, setEmail] = useState(state?.email ?? '');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dismissSessionExpired();
    setFormError(null);

    const trimmedEmail = email.trim();
    const nextErrors: { email?: string; password?: string } = {};

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Use um e-mail como nome@dominio.com.';
    }
    if (!password) {
      nextErrors.password = 'Digite sua senha.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const result = await login({ email: trimmedEmail, password });
      startChallenge({
        challengeToken: result.challengeToken,
        email: trimmedEmail,
        expiresIn: result.expiresIn,
      });
      navigate('/entrar/codigo', {
        replace: true,
        state: { from: state?.from },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 || error.status === 401) {
          setFormError('E-mail ou senha incorretos.');
        } else if (error.status === 503) {
          setFormError(
            'Não conseguimos enviar o código agora. Tente de novo em instantes.',
          );
        } else if (!error.isNetworkError) {
          setFormError('Algo saiu do lugar. Tente novamente em instantes.');
        }
      } else {
        setFormError('Algo saiu do lugar. Tente novamente em instantes.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1>Entre para cuidar dos achados</h1>
        <p className="texto-suave">
          Enviaremos um código de 6 dígitos para confirmar seu acesso ao balcão.
        </p>
      </div>

      {sessionExpired && (
        <InlineNotice tone="warning">
          <strong>Sua sessão acabou.</strong> Entre de novo para continuar.
        </InlineNotice>
      )}

      {!sessionExpired && state?.notice && (
        <InlineNotice tone="warning">{state.notice}</InlineNotice>
      )}

      {formError && <InlineNotice tone="error">{formError}</InlineNotice>}

      <form noValidate onSubmit={handleSubmit} className={styles.form}>
        <InputField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nome@instituicao.edu.br"
          value={email}
          error={fieldErrors.email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <PasswordField
          label="Senha"
          name="password"
          autoComplete="current-password"
          value={password}
          error={fieldErrors.password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingLabel="Enviando código…"
        >
          Continuar
        </Button>
      </form>

      <div className={styles.footerLinks}>
        <p className="texto-pequeno">
          Ainda não tem acesso? <Link to="/cadastro">Criar conta</Link>
        </p>
        <p className="texto-pequeno">
          <Link to="/itens" className={styles.ghostLink}>
            Ver itens sem entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

