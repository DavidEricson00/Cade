import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useSession } from '../auth/session';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { TabBar } from './TabBar';
import styles from './AppLayout.module.css';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

/** Estrutura das telas internas: sidebar (desktop), topo (mobile/tablet), tab bar (mobile). */
export function AppLayout() {
  const session = useSession();
  const navigate = useNavigate();

  // Atalho "N" abre novo item (só logado). O atalho "/" da busca fica na tela de itens.
  useEffect(() => {
    if (!session) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        navigate('/itens/novo');
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [session, navigate]);

  return (
    <div className={styles.shell}>
      <a href="#conteudo" className="pular-link">
        Pular para o conteúdo
      </a>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      <div className={styles.column}>
        <TopBar />
        <main id="conteudo" tabIndex={-1} className={styles.main}>
          <Outlet />
        </main>
      </div>
      <TabBar />
    </div>
  );
}

