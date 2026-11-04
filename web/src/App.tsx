import { useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { setApiHandlers } from './api/client';
import { expireSession } from './auth/session';
import { ToastViewport } from './components/ui/Toast';
import { AppRoutes } from './routes';
import { SystemGate } from './system/SystemGate';
import { setOffline, setSystemMode } from './system/system';

export function App() {
  useEffect(() => {
    setApiHandlers({
      onUnauthorized: () => expireSession(),
      onWeekend: () => setSystemMode('weekend'),
      onUnavailable: () => setSystemMode('unavailable'),
      onNetworkError: () => setOffline(true),
      onReachable: () => {
        if (navigator.onLine) setOffline(false);
      },
    });

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <BrowserRouter>
      <SystemGate>
        <AppRoutes />
        <ToastViewport />
      </SystemGate>
    </BrowserRouter>
  );
}

