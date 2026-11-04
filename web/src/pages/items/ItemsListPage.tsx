import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { listItems } from '../../api/items';
import type { Item } from '../../api/types';
import { useSession } from '../../auth/session';
import {
  ItemCard,
  ItemCardSkeleton,
  ItemGrid,
} from '../../components/items/ItemCard';
import { Button, ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SelectField } from '../../components/ui/Field';
import { FilterChips, SearchBar } from '../../components/ui/FilterBar';
import { Modal } from '../../components/ui/Modal';
import { daysAgo } from '../../lib/date';
import { normalize } from '../../lib/format';
import { PageHeader } from '../../layout/PageHeader';
import { usePageTitle } from '../../layout/page-title';
import styles from './ItemsPages.module.css';

type PeriodFilter = 'todos' | '7d' | '30d' | 'antigos';
type SortOrder = 'recentes' | 'antigos' | 'nome';

const PERIOD_CHIPS: readonly { value: PeriodFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'antigos', label: 'Mais antigos' },
];

const INITIAL_LIMIT = 60;
const PAGE_STEP = 24;

function matchesPeriod(date: string, period: PeriodFilter): boolean {
  if (period === 'todos') return true;
  const diff = daysAgo(date);
  if (diff === null) return true;
  if (period === '7d') return diff >= 0 && diff <= 7;
  if (period === '30d') return diff >= 0 && diff <= 30;
  return diff > 30;
}

export function ItemsListPage() {
  usePageTitle('Achados no balcão');

  const session = useSession();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT);
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = searchParams.get('q') ?? '';
  const periodParam = searchParams.get('periodo') as PeriodFilter | null;
  const period: PeriodFilter =
    periodParam && PERIOD_CHIPS.some((c) => c.value === periodParam)
      ? periodParam
      : 'todos';
  const locationFilter = searchParams.get('local') ?? '';
  const sortParam = searchParams.get('ordem') as SortOrder | null;
  const sort: SortOrder =
    sortParam === 'antigos' || sortParam === 'nome' ? sortParam : 'recentes';

  function updateParam(key: string, value: string, defaultValue = '') {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
    setVisibleCount(INITIAL_LIMIT);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true });
    setVisibleCount(INITIAL_LIMIT);
  }

  const fetchItems = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(false);
    try {
      const data = await listItems(signal);
      setItems(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchItems(controller.signal);
    return () => controller.abort();
  }, [fetchItems]);

  const distinctLocations = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      const loc = item.location.trim();
      if (loc) set.add(loc);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalize(query);

    return items
      .filter((item) => {
        if (locationFilter && item.location !== locationFilter) return false;
        if (!matchesPeriod(item.date, period)) return false;
        if (!normalizedQuery) return true;

        const haystack = normalize(
          `${item.name} ${item.description} ${item.location}`,
        );
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sort === 'nome') {
          return a.name.localeCompare(b.name, 'pt-BR');
        }
        if (sort === 'antigos') {
          return a.date.localeCompare(b.date);
        }
        return b.date.localeCompare(a.date);
      });
  }, [items, query, locationFilter, period, sort]);

  const hasActiveFilters =
    Boolean(query) ||
    period !== 'todos' ||
    Boolean(locationFilter) ||
    sort !== 'recentes';

  const visibleItems = filteredItems.slice(0, visibleCount);
  const countLabel = loading
    ? 'Consultando o balcão…'
    : `${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'itens'}`;

  return (
    <div className={styles.listPage}>
      <PageHeader
        title="Achados no balcão"
        meta={<span aria-live="polite">{countLabel}</span>}
        actions={
          session ? (
            <div className={styles.desktopCreateBtn}>
              <ButtonLink
                to="/itens/novo"
                icon={<Plus size={18} strokeWidth={1.75} />}
              >
                Registrar item
              </ButtonLink>
            </div>
          ) : undefined
        }
      />

      {/* Barra de busca e filtros */}
      {items.length > 0 && (
        <section aria-label="Busca e filtros" className={styles.toolbar}>
          <div className={styles.searchRow}>
            <SearchBar
              value={query}
              onChange={(val) => updateParam('q', val)}
            />
            <div className={styles.mobileSheetTrigger}>
              <Button
                variant="secondary"
                icon={<SlidersHorizontal size={18} strokeWidth={1.75} />}
                onClick={() => setSheetOpen(true)}
              >
                Filtrar
              </Button>
            </div>
          </div>

          <div className={styles.filtersBar}>
            <FilterChips
              label="Período em que foi achado"
              options={PERIOD_CHIPS}
              value={period}
              onChange={(val) => updateParam('periodo', val, 'todos')}
            />

            <div className={styles.desktopSelects}>
              <SelectField
                label="Local"
                value={locationFilter}
                onChange={(event) => updateParam('local', event.target.value)}
              >
                <option value="">Todos os locais</option>
                {distinctLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Ordenar por"
                value={sort}
                onChange={(event) =>
                  updateParam('ordem', event.target.value, 'recentes')
                }
              >
                <option value="recentes">Mais recentes</option>
                <option value="antigos">Mais antigos</option>
                <option value="nome">Nome (A–Z)</option>
              </SelectField>
            </div>
          </div>
        </section>
      )}

      {/* Bottom sheet de filtros no mobile */}
      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtrar e ordenar"
        footer={
          <>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  clearFilters();
                  setSheetOpen(false);
                }}
              >
                Limpar filtros
              </Button>
            )}
            <Button onClick={() => setSheetOpen(false)}>Ver resultados</Button>
          </>
        }
      >
        <div className={styles.sheetStack}>
          <SelectField
            label="Local onde foi achado"
            value={locationFilter}
            onChange={(event) => updateParam('local', event.target.value)}
          >
            <option value="">Todos os locais</option>
            {distinctLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Ordenar por"
            value={sort}
            onChange={(event) =>
              updateParam('ordem', event.target.value, 'recentes')
            }
          >
            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="nome">Nome (A–Z)</option>
          </SelectField>
        </div>
      </Modal>

      {/* Conteúdo */}
      {loading ? (
        <ItemGrid>
          {Array.from({ length: 6 }, (_, index) => (
            <ItemCardSkeleton key={index} />
          ))}
        </ItemGrid>
      ) : error ? (
        <EmptyState
          illustration="counter"
          title="Algo saiu do lugar"
          description="Já estamos de olho. Tente novamente."
          action={
            <Button variant="secondary" onClick={() => void fetchItems()}>
              Tentar novamente
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          illustration="counter"
          title="O balcão está vazio"
          description="Ainda não há objetos registrados."
          action={
            session ? (
              <ButtonLink
                to="/itens/novo"
                icon={<Plus size={18} strokeWidth={1.75} />}
              >
                Registrar item
              </ButtonLink>
            ) : undefined
          }
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          illustration="search"
          title="Nada com esse nome"
          description="Tente outra palavra ou limpe os filtros."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <>
          <ItemGrid>
            {visibleItems.map((item, index) => (
              <ItemCard key={item.id} item={item} showTape={index === 0} />
            ))}
          </ItemGrid>

          {filteredItems.length > visibleCount && (
            <div className={styles.loadMoreRow}>
              <Button
                variant="secondary"
                onClick={() => setVisibleCount((prev) => prev + PAGE_STEP)}
              >
                Mostrar mais ({filteredItems.length - visibleCount} restantes)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
