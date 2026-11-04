import { useNavigate } from 'react-router';
import { LogOut, ScrollText } from 'lucide-react';
import { signOut, useSession } from '../../auth/session';
import { Button, ButtonLink } from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/date';
import { PageHeader } from '../../layout/PageHeader';
import { usePageTitle } from '../../layout/page-title';
import styles from './AuthPages.module.css';

export function AccountPage() {
  usePageTitle('Conta');

  const session = useSession();
  const navigate = useNavigate();

  if (!session) return null;

  function handleSignOut() {
    signOut();
    showToast('Você saiu da sua conta.', 'info');
    navigate('/entrar', { replace: true });
  }

  return (
    <div className={styles.accountPage}>
      <PageHeader
        title="Conta"
        meta="Dados da sua sessão atual no balcão"
      />

      <section className={styles.accountCard}>
        <span className={styles.accountHole} aria-hidden="true" />

        <div className={styles.accountRow}>
          <span className="rotulo-mono texto-suave">E-mail conectado</span>
          <strong className={styles.accountEmail}>{session.email}</strong>
        </div>

        {session.expiresAt && (
          <div className={styles.accountRow}>
            <span className="rotulo-mono texto-suave">Validade do acesso</span>
            <span className="mono texto-pequeno">
              Sua sessão vale até {formatDateTime(session.expiresAt)}
            </span>
          </div>
        )}

        <div className={styles.accountStub}>
          <ButtonLink
            to="/registros"
            variant="secondary"
            icon={<ScrollText size={18} strokeWidth={1.75} />}
          >
            Registros de acesso
          </ButtonLink>

          <Button
            variant="danger"
            icon={<LogOut size={18} strokeWidth={1.75} />}
            onClick={handleSignOut}
          >
            Sair
          </Button>
        </div>
      </section>
    </div>
  );
}

