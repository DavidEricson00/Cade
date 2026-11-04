import { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import type { Item, RequestLog } from '../api/types';
import { DateStamp } from '../components/items/DateStamp';
import { ItemCard, ItemCardSkeleton, ItemGrid } from '../components/items/ItemCard';
import { LogTable, MethodBadge } from '../components/logs/LogTable';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import {
  InputField,
  PasswordField,
  SelectField,
  TextareaField,
} from '../components/ui/Field';
import { FilterChips, SearchBar } from '../components/ui/FilterBar';
import { ImageUpload } from '../components/ui/ImageUpload';
import { ConfirmDeleteModal, Modal } from '../components/ui/Modal';
import { InlineNotice, showToast } from '../components/ui/Toast';
import { PageHeader } from '../layout/PageHeader';
import { usePageTitle } from '../layout/page-title';
import { setSystemMode } from '../system/system';
import styles from './DevShowcasePage.module.css';

const SAMPLE_PHOTO_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#E9DCC0"/>
      <rect x="150" y="54" width="100" height="196" rx="18" fill="#1F5C4A" stroke="#1F1B16" stroke-width="5"/>
      <rect x="172" y="32" width="56" height="26" rx="6" fill="#FFFDF8" stroke="#1F1B16" stroke-width="5"/>
      <path d="M170 110 H230" stroke="#FFFDF8" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  );

const SAMPLE_ITEMS: Item[] = [
  {
    id: '018f4b2c-9d10-7000-8000-000000a4f29c',
    name: 'Garrafa térmica azul-marinho',
    description: 'Garrafa de inox de 500 ml com adesivo de bicicleta na base.',
    location: 'Quadra',
    date: '2026-11-03',
    imageUrl: SAMPLE_PHOTO_SVG,
  },
  {
    id: '018f4b2c-9d10-7000-8000-00000071b80e',
    name: 'Chaveiro com 3 chaves e um pingente de coruja',
    description: 'Argola prateada com duas chaves comuns e uma tetra.',
    location: 'Bloco B',
    date: '2026-10-30',
  },
  {
    id: '018f4b2c-9d10-7000-8000-000000c91d42',
    name: 'Carteira de couro marrom',
    description: 'Encontrada próxima às mesas de estudo do segundo andar.',
    location: 'Biblioteca Central',
    date: '2026-10-24',
  },
  {
    id: '018f4b2c-9d10-7000-8000-00000038e511',
    name: 'Óculos de grau com armação redonda',
    description: 'Armação tartaruga dentro de estojo rígido bege.',
    location: 'Sala 12',
    date: '2025-12-15',
  },
];

const SAMPLE_LOGS: RequestLog[] = [
  {
    id: 'log-1',
    method: 'POST',
    route: '/items',
    timestamp: '2026-11-03T17:42:10.000Z',
    timezone: 'America/Fortaleza',
  },
  {
    id: 'log-2',
    method: 'GET',
    route: '/items',
    timestamp: '2026-11-03T17:40:04.000Z',
    timezone: 'America/Fortaleza',
  },
  {
    id: 'log-3',
    method: 'PATCH',
    route: '/items/018f4b2c-9d10-7000-8000-000000a4f29c',
    timestamp: '2026-11-03T16:18:51.000Z',
    timezone: 'America/Fortaleza',
  },
  {
    id: 'log-4',
    method: 'DELETE',
    route: '/items/018f4b2c-9d10-7000-8000-00000099a100',
    timestamp: '2026-11-03T14:05:22.000Z',
    timezone: 'America/Fortaleza',
  },
];

const PERIOD_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'antigos', label: 'Mais antigos' },
] as const;

export function DevShowcasePage() {
  usePageTitle('Mostruário');

  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<(typeof PERIOD_OPTIONS)[number]['value']>('todos');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Mostruário de componentes"
        meta="Etapa 2 · revisão visual e interativa de todas as peças"
      />

      {/* 9.1 Botões */}
      <section className={styles.section}>
        <h2>9.1 Botões</h2>
        <div className={styles.row}>
          <Button icon={<Plus size={18} strokeWidth={1.75} />}>Registrar item</Button>
          <Button variant="secondary" icon={<Download size={18} strokeWidth={1.75} />}>
            Baixar PDF
          </Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="danger" icon={<Trash2 size={18} strokeWidth={1.75} />}>
            Excluir item
          </Button>
          <Button loading loadingLabel="Salvando…">
            Registrar item
          </Button>
          <Button disabled>Desabilitado</Button>
        </div>
      </section>

      {/* 9.2 Campos de formulário */}
      <section className={styles.section}>
        <h2>9.2 Campos de formulário</h2>
        <div className={styles.formGrid}>
          <InputField
            label="Nome do objeto"
            placeholder="Ex.: Garrafa térmica azul-marinho"
            hint="Use palavras simples que o dono procuraria."
          />
          <InputField
            label="E-mail institucional"
            defaultValue="atendente@"
            error="Use um e-mail completo, como nome@dominio.com."
          />
          <PasswordField
            label="Senha"
            defaultValue="segredo123"
            hint="Mínimo de 8 caracteres."
          />
          <SelectField label="Onde foi achado" defaultValue="Biblioteca Central">
            <option value="Biblioteca Central">Biblioteca Central</option>
            <option value="Bloco B">Bloco B</option>
            <option value="Cantina">Cantina</option>
            <option value="Quadra">Quadra</option>
          </SelectField>
          <div className={styles.fullSpan}>
            <TextareaField
              label="Descrição"
              defaultValue="Garrafa de inox azul-marinho, 500 ml, com pequeno amassado na tampa."
              hint="Cor, marca e detalhes que ajudem o dono a reconhecer."
            />
          </div>
        </div>
      </section>

      {/* 9.3 e 9.4 Carimbo e Cartão-etiqueta */}
      <section className={styles.section}>
        <h2>9.3 e 9.4 Cartão-etiqueta e carimbo de data</h2>
        <div className={styles.row}>
          <DateStamp date="2026-11-03" />
          <DateStamp date="2026-11-03" flat />
          <DateStamp date="2025-12-15" animate />
        </div>
        <ItemGrid>
          {SAMPLE_ITEMS.map((item, index) => (
            <ItemCard key={item.id} item={item} showTape={index === 0} to="/dev" />
          ))}
        </ItemGrid>
        <h3>Skeleton de carregamento</h3>
        <ItemGrid>
          <ItemCardSkeleton />
          <ItemCardSkeleton />
        </ItemGrid>
      </section>

      {/* 9.5 Busca e filtros */}
      <section className={styles.section}>
        <h2>9.5 Busca e filtros</h2>
        <div className={styles.stack}>
          <SearchBar value={query} onChange={setQuery} />
          <div className={styles.filterRow}>
            <FilterChips
              label="Período"
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
            />
            <span className="rotulo-mono texto-suave">4 itens</span>
          </div>
        </div>
      </section>

      {/* 9.6 Upload de imagem */}
      <section className={styles.section}>
        <h2>9.6 Upload de imagem</h2>
        <div className={styles.uploadDemo}>
          <ImageUpload file={file} onChange={setFile} uploading={uploading} />
          <div className={styles.row}>
            <Button
              variant="secondary"
              onClick={() => setUploading((prev) => !prev)}
            >
              {uploading ? 'Parar envio simulado' : 'Simular barra de envio'}
            </Button>
          </div>
        </div>
      </section>

      {/* 9.7 e 9.8 Modais, Toasts e Avisos */}
      <section className={styles.section}>
        <h2>9.7 e 9.8 Modais, toasts e avisos inline</h2>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setInfoModalOpen(true)}>
            Abrir modal / sheet
          </Button>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Modal de excluir item
          </Button>
          <Button
            variant="secondary"
            onClick={() => showToast('Item registrado no balcão.', 'success')}
          >
            Toast de sucesso
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              showToast('Não conseguimos salvar a foto agora. Tente novamente.', 'error')
            }
          >
            Toast de erro
          </Button>
        </div>

        <div className={styles.stack}>
          <InlineNotice tone="warning">
            Aguarde 42 segundos antes de pedir um novo código. Reenvio 1 de 3.
          </InlineNotice>
          <InlineNotice tone="error">
            Código incorreto. Restam 3 tentativas.
          </InlineNotice>
          <InlineNotice tone="success">
            Conta criada. Agora é só entrar.
          </InlineNotice>
        </div>

        <Modal
          open={infoModalOpen}
          onClose={() => setInfoModalOpen(false)}
          title="Horário do balcão"
          footer={
            <Button variant="secondary" onClick={() => setInfoModalOpen(false)}>
              Entendi
            </Button>
          }
        >
          <p className="texto-suave">
            Os objetos ficam guardados no balcão de segunda a sexta-feira. Pressione Esc
            ou clique fora para fechar.
          </p>
        </Modal>

        <ConfirmDeleteModal
          open={deleteModalOpen}
          itemName="Garrafa térmica azul-marinho"
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={() => {
            setDeleteModalOpen(false);
            showToast('Item excluído.', 'success');
          }}
        />
      </section>

      {/* 9.9 e 9.10 Tabela de logs e badges HTTP */}
      <section className={styles.section}>
        <h2>9.9 e 9.10 Livro de registros e badges HTTP</h2>
        <div className={styles.row}>
          <MethodBadge method="GET" />
          <MethodBadge method="POST" />
          <MethodBadge method="PATCH" />
          <MethodBadge method="DELETE" />
          <MethodBadge method="OPTIONS" />
        </div>
        <LogTable logs={SAMPLE_LOGS} timeZone="America/Fortaleza" />
      </section>

      {/* 11 Estados especiais */}
      <section className={styles.section}>
        <h2>11. Estados especiais</h2>
        <div className={styles.emptyGrid}>
          <EmptyState
            illustration="counter"
            title="O balcão está vazio"
            description="Ainda não há objetos registrados."
            action={<Button>Registrar item</Button>}
          />
          <EmptyState
            illustration="search"
            title="Nada com esse nome"
            description="Tente outra palavra ou limpe os filtros."
            action={<Button variant="secondary">Limpar filtros</Button>}
          />
          <EmptyState
            illustration="missing"
            title="Esse item não está mais no balcão"
            description="Pode ter sido devolvido ou removido."
            action={<Button variant="secondary">Voltar à lista</Button>}
          />
        </div>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setSystemMode('weekend')}>
            Testar tela 403 (fim de semana)
          </Button>
          <Button variant="secondary" onClick={() => setSystemMode('unavailable')}>
            Testar tela 503 (gavetas)
          </Button>
        </div>
      </section>
    </div>
  );
}
