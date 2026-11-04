import { Link, Navigate, Route, Routes } from 'react-router';
import { RedirectIfAuthenticated, RequireAuth } from './auth/guards';
import { AppLayout } from './layout/AppLayout';
import { AuthLayout } from './layout/AuthLayout';
import { PageHeader } from './layout/PageHeader';
import { usePageTitle } from './layout/page-title';

function PlaceholderPage({
  title,
  stage,
  description,
}: {
  title: string;
  stage: string;
  description: string;
}) {
  usePageTitle(title);

  return (
    <div>
      <PageHeader title={title} meta={stage} />
      <p className="texto-suave">{description}</p>
    </div>
  );
}

function AuthPlaceholder({
  title,
  stage,
  description,
}: {
  title: string;
  stage: string;
  description: string;
}) {
  usePageTitle(title);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--e-4)' }}>
      <span className="rotulo-mono texto-suave">{stage}</span>
      <h1>{title}</h1>
      <p className="texto-suave">{description}</p>
      <p className="texto-pequeno">
        <Link to="/itens">Ver itens sem entrar</Link>
      </p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/itens" replace />} />

      {/* Rotas de autenticação */}
      <Route element={<AuthLayout />}>
        <Route element={<RedirectIfAuthenticated />}>
          <Route
            path="/entrar"
            element={
              <AuthPlaceholder
                title="Entre para cuidar dos achados"
                stage="Etapa 3 · Autenticação"
                description="Formulário de login com envio para o desafio de dois fatores."
              />
            }
          />
          <Route
            path="/cadastro"
            element={
              <AuthPlaceholder
                title="Crie sua conta no balcão"
                stage="Etapa 3 · Autenticação"
                description="Cadastro de atendente com validação de nome, e-mail e senha."
              />
            }
          />
          <Route
            path="/entrar/codigo"
            element={
              <AuthPlaceholder
                title="Digite o código que enviamos"
                stage="Etapa 3 · Autenticação"
                description="Verificação em dois fatores com 6 caixas, validade, tentativas e reenvio."
              />
            }
          />
        </Route>
      </Route>

      {/* Rotas principais (com sidebar no desktop e tab bar no mobile) */}
      <Route element={<AppLayout />}>
        {/* Públicas */}
        <Route
          path="/itens"
          element={
            <PlaceholderPage
              title="Achados no balcão"
              stage="Etapa 4 · Itens"
              description="Lista de cartões-etiqueta com busca, filtro por período/local e ordenação."
            />
          }
        />
        <Route
          path="/itens/:id"
          element={
            <PlaceholderPage
              title="Detalhe do item"
              stage="Etapa 4 · Itens"
              description="Visualização completa do objeto guardado no balcão."
            />
          }
        />
        <Route
          path="/relatorios"
          element={
            <PlaceholderPage
              title="Relatórios e exportação"
              stage="Etapa 5 · Relatórios"
              description="Download do relatório em PDF e exportação filtrada em CSV."
            />
          }
        />
        <Route
          path="/dev"
          element={
            <PlaceholderPage
              title="Mostruário de componentes"
              stage="Etapa 2 · Componentes"
              description="Catálogo vivo de botões, campos, cartão-etiqueta, carimbo, modais e estados."
            />
          }
        />

        {/* Protegidas */}
        <Route element={<RequireAuth />}>
          <Route
            path="/itens/novo"
            element={
              <PlaceholderPage
                title="Registrar item"
                stage="Etapa 4 · Itens"
                description="Formulário de cadastro de objeto achado com upload de foto."
              />
            }
          />
          <Route
            path="/itens/:id/editar"
            element={
              <PlaceholderPage
                title="Editar item"
                stage="Etapa 4 · Itens"
                description="Atualização parcial dos dados ou substituição da foto do objeto."
              />
            }
          />
          <Route
            path="/registros"
            element={
              <PlaceholderPage
                title="Registros de acesso"
                stage="Etapa 5 · Registros"
                description="Livro de registros de requisições filtrado por data e fuso horário."
              />
            }
          />
          <Route
            path="/conta"
            element={
              <PlaceholderPage
                title="Conta"
                stage="Etapa 3 · Autenticação"
                description="Dados da sessão atual e encerramento de acesso."
              />
            }
          />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Essa página não está no balcão"
              stage="404"
              description="Confira o endereço ou volte para a lista de itens."
            />
          }
        />
      </Route>
    </Routes>
  );
}

