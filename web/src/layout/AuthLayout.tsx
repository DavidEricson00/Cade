import { Link, Outlet } from 'react-router';
import { Logo } from '../components/brand/Logo';
import styles from './AuthLayout.module.css';

/**
 * Telas de autenticação (login, cadastro, 2FA).
 * Mobile: coluna única. Desktop: painel kraft decorativo + formulário (440px).
 */
export function AuthLayout() {
  return (
    <div className={styles.shell}>
      <a href="#conteudo" className="pular-link">
        Pular para o conteúdo
      </a>
      <aside className={styles.panel} aria-hidden="true">
        <Logo size="lg" />
        <div className={styles.tags}>
          <div className={`${styles.tag} ${styles.tagA}`}>
            <span className={styles.hole} />
            <span className={styles.tagTitle}>Garrafa térmica azul-marinho</span>
            <span className="rotulo-mono texto-suave">Quadra · 28 out</span>
          </div>
          <div className={`${styles.tag} ${styles.tagB}`}>
            <span className={styles.hole} />
            <span className={styles.tagTitle}>Chaveiro com pingente de coruja</span>
            <span className="rotulo-mono texto-suave">Bloco B · 30 out</span>
          </div>
          <div className={`${styles.tag} ${styles.tagC}`}>
            <span className={styles.hole} />
            <span className={styles.tape} />
            <span className={styles.tagTitle}>Óculos de grau, armação redonda</span>
            <span className="rotulo-mono texto-suave">Sala 12 · 3 nov</span>
          </div>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <Link to="/itens" className={styles.mark} aria-label="Cadê? — ver itens">
            <Logo />
          </Link>
        </header>
        <main id="conteudo" tabIndex={-1} className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

