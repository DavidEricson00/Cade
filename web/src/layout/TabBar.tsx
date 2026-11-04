import { Link, useLocation } from 'react-router';
import { useSession } from '../auth/session';
import { isNavActive, tabNav } from './nav';
import styles from './TabBar.module.css';

/** Tab bar inferior (mobile, < 640px). */
export function TabBar() {
  const session = useSession();
  const { pathname } = useLocation();

  return (
    <nav aria-label="Principal" className={styles.tabbar}>
      <ul>
        {tabNav(Boolean(session)).map((item) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={item.primary ? styles.primary : styles.tab}
                data-active={active || undefined}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

