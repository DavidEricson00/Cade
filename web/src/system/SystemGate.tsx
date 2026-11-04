import type { ReactNode } from 'react';
import { WifiOff } from 'lucide-react';
import { setSystemMode, useSystem } from './system';
import { ClosedSign, DrawerIllustration, StatusScreen } from './StatusScreen';
import styles from './SystemGate.module.css';

/**
 * Mostra telas cheias quando a API indica que o sistema não pode atender
 * (403 fim de semana, 503 banco) e a faixa de "sem internet".
 */
export function SystemGate({ children }: { children: ReactNode }) {
  const { mode, offline } = useSystem();

  if (mode === 'weekend') {
    return (
      <StatusScreen
        title="O balcão fecha no fim de semana"
        description="O sistema volta a atender na segunda-feira."
        illustration={<ClosedSign />}
      />
    );
  }

  if (mode === 'unavailable') {
    return (
      <StatusScreen
        title="Estamos arrumando as gavetas"
        description="Não conseguimos acessar os dados agora. Tente de novo em instantes."
        illustration={<DrawerIllustration />}
        action={
          <button
            type="button"
            onClick={() => {
              setSystemMode('ok');
              window.location.reload();
            }}
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  return (
    <>
      <div role="status" aria-live="polite" className={styles.liveRegion}>
        {offline && (
          <div className={styles.offline}>
            <WifiOff size={16} strokeWidth={1.75} aria-hidden="true" />
            Você está sem internet.
          </div>
        )}
      </div>
      {children}
    </>
  );
}

