import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Maximize2,
  PackageOpen,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ApiError } from '../../api/client';
import { deleteItem, getItem } from '../../api/items';
import type { Item } from '../../api/types';
import { useSession } from '../../auth/session';
import { DateStamp } from '../../components/items/DateStamp';
import { Button, ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDeleteModal, Modal } from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import { formatDayLong } from '../../lib/date';
import { itemCode } from '../../lib/format';
import { usePageTitle } from '../../layout/page-title';
import styles from './ItemsPages.module.css';

export function ItemDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();

  const justCreated = Boolean(
    (location.state as { justCreated?: boolean } | null)?.justCreated,
  );

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  usePageTitle(item?.name ?? 'Detalhe do item');

  const fetchItem = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setNotFound(false);
      setError(false);

      try {
        const found = await getItem(id, signal);
        setItem(found);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchItem(controller.signal);
    return () => controller.abort();
  }, [fetchItem]);

  async function handleConfirmDelete() {
    if (!item || deleting) return;
    setDeleting(true);

    try {
      await deleteItem(item.id);
      setDeleteOpen(false);
      showToast('Item excluído.', 'success');
      navigate('/itens', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setDeleteOpen(false);
        setNotFound(true);
      } else {
        showToast('Não foi possível excluir o item agora.', 'error');
      }
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.detailWrap}>
        <div className={styles.backRow}>
          <Link to="/itens" className={styles.backLink}>
            <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
            <span>Voltar aos achados</span>
          </Link>
        </div>
        <div className={styles.detailSkeleton} aria-hidden="true" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.detailWrap}>
        <EmptyState
          illustration="missing"
          title="Esse item não está mais no balcão"
          description="Pode ter sido devolvido ou removido."
          action={
            <ButtonLink to="/itens" variant="secondary">
              Voltar à lista
            </ButtonLink>
          }
        />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.detailWrap}>
        <EmptyState
          illustration="counter"
          title="Algo saiu do lugar"
          description="Já estamos de olho. Tente novamente."
          action={
            <Button variant="secondary" onClick={() => void fetchItem()}>
              Tentar novamente
            </Button>
          }
        />
      </div>
    );
  }

  const code = itemCode(item.id);

  return (
    <div className={styles.detailWrap}>
      <div className={styles.backRow}>
        <Link to="/itens" className={styles.backLink}>
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>Voltar aos achados</span>
        </Link>
      </div>

      <article className={styles.detailCard}>
        {/* Coluna da foto */}
        <div className={styles.detailMedia}>
          <span className={styles.detailHole} aria-hidden="true" />
          <span className={styles.detailTape} aria-hidden="true" />

          {item.imageUrl ? (
            <button
              type="button"
              className={styles.photoButton}
              onClick={() => setLightboxOpen(true)}
              aria-label="Abrir foto em tamanho maior"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                width={800}
                height={600}
                className={styles.detailImage}
              />
              <span className={styles.zoomHint} aria-hidden="true">
                <Maximize2 size={14} strokeWidth={1.75} />
                <span>Ampliar</span>
              </span>
            </button>
          ) : (
            <div className={styles.detailPlaceholder} aria-hidden="true">
              <PackageOpen size={44} strokeWidth={1.75} />
              <span className="rotulo-mono">Sem foto</span>
            </div>
          )}
        </div>

        {/* Coluna de informações */}
        <div className={styles.detailContent}>
          <div className={styles.detailTopMeta}>
            <DateStamp date={item.date} animate={justCreated} />
            <span className={styles.detailCode} title={`ID: ${item.id}`}>
              {code}
            </span>
          </div>

          <h1 className={styles.detailTitle}>{item.name}</h1>

          <p className={styles.detailDescription}>{item.description}</p>

          <dl className={styles.detailFacts}>
            <div className={styles.factItem}>
              <dt className="rotulo-mono texto-suave">
                <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
                <span>Onde foi achado</span>
              </dt>
              <dd>{item.location}</dd>
            </div>

            <div className={styles.factItem}>
              <dt className="rotulo-mono texto-suave">
                <Calendar size={14} strokeWidth={1.75} aria-hidden="true" />
                <span>Data de entrada</span>
              </dt>
              <dd>Achado em {formatDayLong(item.date)}</dd>
            </div>
          </dl>

          {session && (
            <div className={styles.detailStub}>
              <ButtonLink
                to={`/itens/${encodeURIComponent(item.id)}/editar`}
                variant="secondary"
                icon={<Pencil size={18} strokeWidth={1.75} />}
              >
                Editar
              </ButtonLink>
              <Button
                variant="danger"
                icon={<Trash2 size={18} strokeWidth={1.75} />}
                onClick={() => setDeleteOpen(true)}
              >
                Excluir item
              </Button>
            </div>
          )}
        </div>
      </article>

      {/* Modal de foto ampliada */}
      {item.imageUrl && (
        <Modal
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          title={item.name}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className={styles.lightboxImg}
          />
        </Modal>
      )}

      {/* Confirmação de exclusão */}
      <ConfirmDeleteModal
        open={deleteOpen}
        itemName={item.name}
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}

