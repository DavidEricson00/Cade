import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { register } from '../../api/auth';
import { ApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { InputField, PasswordField } from '../../components/ui/Field';
import { InlineNotice, showToast } from '../../components/ui/Toast';
import { usePageTitle } from '../../layout/page-title';
import styles from './AuthPages.module.css';

export function RegisterPage() {
  usePageTitle('Criar conta');

  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<'validation' | 'conflictOrServer' | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const nextErrors: typeof fieldErrors = {};

    if (trimmedName.length < 2) {
      nextErrors.name = 'Digite seu nome com pelo menos 2 letras.';
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Use um e-mail como nome@dominio.com.';
    }
    if (password.length < 8) {
      nextErrors.password = 'A senha precisa ter pelo menos 8 caracteres.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });
      showToast('Conta criada. Agora é só entrar.', 'success');
      navigate('/entrar', {
        replace: true,
        state: { email: trimmedEmail },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          setServerError('validation');
        } else if (!error.isNetworkError) {
          setServerError('conflictOrServer');
        }
      } else {
        setServerError('conflictOrServer');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1>Crie sua conta no balcão</h1>
        <p className="texto-suave">
          Com uma conta você pode registrar objetos achados, atualizar fotos e emitir
          registros.
        </p>
      </div>

      {serverError === 'validation' && (
        <InlineNotice tone="error">
          Confira os dados: nome com pelo menos 2 letras, e-mail válido e senha com 8
          caracteres ou mais.
        </InlineNotice>
      )}

      {serverError === 'conflictOrServer' && (
        <InlineNotice tone="error">
          Não conseguimos criar a conta. Se esse e-mail já tem conta,{' '}
          <Link to="/entrar" state={{ email: email.trim().toLowerCase() }}>
            é só entrar
          </Link>
          .
        </InlineNotice>
      )}

      <form noValidate onSubmit={handleSubmit} className={styles.form}>
        <InputField
          label="Nome"
          name="name"
          autoComplete="name"
          placeholder="Ex.: Mariana Alves"
          value={name}
          error={fieldErrors.name}
          onChange={(event) => setName(event.target.value)}
        />

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
          autoComplete="new-password"
          hint="Mínimo de 8 caracteres."
          value={password}
          error={fieldErrors.password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingLabel="Criando conta…"
        >
          Criar conta
        </Button>
      </form>

      <div className={styles.footerLinks}>
        <p className="texto-pequeno">
          Já tem conta? <Link to="/entrar">Entrar</Link>
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

