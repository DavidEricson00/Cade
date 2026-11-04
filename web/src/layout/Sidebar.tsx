import { Link, useLocation, useNavigate } from 'react-router';
import { LogIn, LogOut } from 'lucide-react';
import { Logo } from '../components/brand/Logo';
import { signOut, useSession } from '../auth/session';
import { isNavActive, mainNav } from './nav';
import styles from './Sidebar.module.css';

/** Navegação lateral fixa (desktop, ≥ 1024px). */
export function Sidebar() {
  const session = useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/entrar', { replace: true });
  }

  return (
    <aside className={styles.sidebar}>
      <Link to="/itens" className={styles.brand} aria-label="Cadê? — ir para os itens">
        <Logo />
      </Link>

      <nav aria-label="Principal" className={styles.nav}>
        <ul>
          {mainNav(Boolean(session)).map((item) => {
            const active = isNavActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={styles.link}
                  data-active={active || undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.to === '/itens/novo' && (
                    <kbd className={styles.kbd} aria-label="atalho N">N</kbd>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        {session ? (
          <>
            <Link
              to="/conta"
              className={styles.user}
              aria-current={pathname === '/conta' ? 'page' : undefined}
            >
              <span className="rotulo-mono texto-suave">Conectado como</span>
              <span className={styles.email}>{session.email}</span>
            </Link>
            <button type="button" className={styles.signOut} onClick={handleSignOut}>
              <LogOut size={20} strokeWidth={1.75} aria-hidden="true" />
              Sair
            </button>
          </>
        ) : (
          <Link to="/entrar" state={{ from: pathname }} className={styles.signIn}>
            <LogIn size={20} strokeWidth={1.75} aria-hidden="true" />
            Entrar
          </Link>
        )}
      </div>
    </aside>
  );
}

