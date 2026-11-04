import { Link, useLocation } from 'react-router';
import { Logo } from '../components/brand/Logo';
import { useSession } from '../auth/session';
import { NAV, isNavActive, mainNav } from './nav';
import { useCurrentPageTitle } from './page-title';
import styles from './TopBar.module.css';

/**
 * Barra superior (mobile e tablet, < 1024px).
 * Mobile: título da tela. Tablet: logo + menu horizontal.
 */
export function TopBar() {
  const session = useSession();
  const title = useCurrentPageTitle();
  const { pathname } = useLocation();
  const accountItem = session ? NAV.account : NAV.login;
  const accountActive = isNavActive(accountItem, pathname);

  return (
    <header className={styles.topbar}>
      <div className={styles.mobile}>
        <Link to="/itens" className={styles.mark} aria-label="Cadê? — ir para os itens">
          <Logo size="sm" showIcon={false} />
        </Link>
        <span className={styles.title} aria-hidden="true">
          {title}
        </span>
      </div>

      <div className={styles.tablet}>
        <Link to="/itens" className={styles.mark} aria-label="Cadê? — ir para os itens">
          <Logo size="sm" />
        </Link>
        <nav aria-label="Principal" className={styles.nav}>
          <ul>
            {[...mainNav(Boolean(session)), accountItem].map((item) => {
              const active =
                item === accountItem ? accountActive : isNavActive(item, pathname);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={styles.link}
                    data-active={active || undefined}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

