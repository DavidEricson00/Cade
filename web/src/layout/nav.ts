import type { LucideIcon } from 'lucide-react';
import { FileText, LogIn, Plus, ScrollText, Tags, UserRound } from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Destaque do botão "Novo" na tab bar. */
  primary?: boolean;
  /** Rota exata para marcar como ativo (sem filhos). */
  end?: boolean;
  /** Rotas que não ativam este item mesmo sendo filhas. */
  exclude?: string[];
  /** Outras rotas que também ativam este item. */
  alsoActive?: string[];
};

export const NAV = {
  items: { to: '/itens', label: 'Itens', icon: Tags, exclude: ['/itens/novo'] },
  create: { to: '/itens/novo', label: 'Novo', icon: Plus, primary: true, end: true },
  reports: { to: '/relatorios', label: 'Relatórios', icon: FileText },
  logs: { to: '/registros', label: 'Registros', icon: ScrollText },
  account: { to: '/conta', label: 'Conta', icon: UserRound, alsoActive: ['/registros'] },
  login: { to: '/entrar', label: 'Entrar', icon: LogIn },
} satisfies Record<string, NavItem>;

function matches(pathname: string, to: string, end = false): boolean {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function isNavActive(item: NavItem, pathname: string): boolean {
  if (item.exclude?.some((path) => matches(pathname, path, true))) return false;
  if (matches(pathname, item.to, item.end)) return true;
  return item.alsoActive?.some((path) => matches(pathname, path)) ?? false;
}

/** Sidebar (desktop) e menu do tablet. */
export function mainNav(authenticated: boolean): NavItem[] {
  return authenticated
    ? [NAV.items, NAV.create, NAV.reports, NAV.logs]
    : [NAV.items, NAV.reports];
}

/** Tab bar (mobile). Registros fica dentro de Conta. */
export function tabNav(authenticated: boolean): NavItem[] {
  return authenticated
    ? [NAV.items, NAV.create, NAV.reports, NAV.account]
    : [NAV.items, NAV.reports, NAV.login];
}
