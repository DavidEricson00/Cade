import { Navigate, Outlet, useLocation } from 'react-router';
import { useSession } from './session';

/** Protege rotas internas: sem sessão, vai ao login guardando a rota de origem. */
export function RequireAuth() {
  const session = useSession();
  const location = useLocation();

  if (!session) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}

/** Telas de login/cadastro: quem já está logado vai direto para os itens. */
export function RedirectIfAuthenticated() {
  const session = useSession();
  return session ? <Navigate to="/itens" replace /> : <Outlet />;
}

