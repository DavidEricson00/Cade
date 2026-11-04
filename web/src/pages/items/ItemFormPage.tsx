import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '../../api/client';
import { createItem, getItem, listItems, updateItem } from '../../api/items';
import type { ItemFields, ValidationIssue } from '../../api/types';
import { Button, ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { InputField, TextareaField } from '../../components/ui/Field';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { InlineNotice, showToast } from '../../components/ui/Toast';
import { todayISO } from '../../lib/date';
import { PageHeader } from '../../layout/PageHeader';
import { usePageTitle } from '../../layout/page-title';
import styles from './ItemsPages.module.css';

const DEFAULT_LOCATIONS = [
  'Biblioteca Central',
  'Bloco A',
  'Bloco B',
  'Cantina',
  'Ginásio',
  'Laboratório de Informática',
  'Pátio',
  'Portaria',
  'Quadra',
  'Recepção',
];

type FieldErrorMap = Partial<Record<keyof ItemFields, string>>;

export function ItemFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const isEdit = mode === 'edit';
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const datalistId = useId();
  const maxDate = todayISO();

  usePageTitle(isEdit ? 'Editar item' : 'Registrar item');

  const [initialFields, setInitialFields] = useState<ItemFields>({
    name: '',
    description: '',
    location: '',
    date: maxDate,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(maxDate);
  const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>(
    undefined,
  );
  const [file, setFile] = useState<File | null>(null);
  const [knownLocations, setKnownLocations] = useState<string[]>(DEFAULT_LOCATIONS);

  const [loadingItem, setLoadingItem] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [storageWarning, setStorageWarning] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Carrega sugestões de locais já usados e, na edição, os dados do item.
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const allItemsPromise = listItems(controller.signal).catch(() => []);
        if (isEdit) {
          setLoadingItem(true);
          const [current, allItems] = await Promise.all([
            getItem(id, controller.signal),
            allItemsPromise,
          ]);
          const initial: ItemFields = {
            name: current.name,
            description: current.description,
            location: current.location,
            date: current.date,
          };
          setInitialFields(initial);
          setName(current.name);
          setDescription(current.description);
          setLocation(current.location);
          setDate(current.date);
          setExistingImageUrl(current.imageUrl);

          const merged = new Set([
            ...DEFAULT_LOCATIONS,
            ...allItems.map((i) => i.location.trim()).filter(Boolean),
          ]);
          setKnownLocations(
            Array.from(merged).sort((a, b) => a.localeCompare(b, 'pt-BR')),
          );
        } else {
          const allItems = await allItemsPromise;
          const merged = new Set([
            ...DEFAULT_LOCATIONS,
            ...allItems.map((i) => i.location.trim()).filter(Boolean),
          ]);
          setKnownLocations(
            Array.from(merged).sort((a, b) => a.localeCompare(b, 'pt-BR')),
          );
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setFormError('Não conseguimos carregar os dados do item.');
        }
      } finally {
        setLoadingItem(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [isEdit, id]);

  const changedFields = useMemo(() => {
    const diff: Partial<ItemFields> = {};
    if (name.trim() !== initialFields.name) diff.name = name.trim();
    if (description.trim() !== initialFields.description) {
      diff.description = description.trim();
    }
    if (location.trim() !== initialFields.location) {
      diff.location = location.trim();
    }
    if (date !== initialFields.date) diff.date = date;
    return diff;
  }, [name, description, location, date, initialFields]);

  const isDirty = isEdit
    ? Object.keys(changedFields).length > 0 || Boolean(file)
    : Boolean(name.trim() || description.trim() || location.trim() || file);

  // Aviso ao fechar a aba com alterações não salvas (seção 10.6).
  useEffect(() => {
    if (!isDirty || saving) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saving]);

  function validate(): boolean {
    const errors: FieldErrorMap = {};

    if (!name.trim()) {
      errors.name = 'Informe o nome do objeto.';
    }
    if (!description.trim()) {
      errors.description = 'Escreva uma descrição curta para ajudar a identificar.';
    }
    if (!location.trim()) {
      errors.location = 'Informe em que local o objeto foi achado.';
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.date = 'Escolha uma data válida.';
    } else if (date > maxDate) {
      errors.date = 'A data não pode ser no futuro.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function applyServerIssues(issues: unknown, fallbackMessage: string) {
    if (Array.isArray(issues) && issues.length > 0) {
      const mapped: FieldErrorMap = {};
      for (const raw of issues as ValidationIssue[]) {
        const key = raw.path?.[0];
        if (
          key === 'name' ||
          key === 'description' ||
          key === 'location' ||
          key === 'date'
        ) {
          mapped[key] = raw.message || 'Valor inválido.';
        }
      }
      if (Object.keys(mapped).length > 0) {
        setFieldErrors(mapped);
        return;
      }
    }
    setUploadError(fallbackMessage);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setFormError(null);
    setUploadError(undefined);
    setStorageWarning(false);

    if (!validate()) return;
    if (isEdit && !isDirty) return;

    setSaving(true);

    try {
      if (isEdit) {
        const updated = await updateItem(id, changedFields, file);
        showToast('Alterações salvas.', 'success');
        navigate(`/itens/${encodeURIComponent(updated.id)}`, { replace: true });
      } else {
        const created = await createItem(
          {
            name: name.trim(),
            description: description.trim(),
            location: location.trim(),
            date,
          },
          file,
        );
        showToast('Item registrado.', 'success');
        navigate(`/itens/${encodeURIComponent(created.id)}`, {
          replace: true,
          state: { justCreated: true },
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          applyServerIssues(err.data, err.message);
        } else if (err.status === 404) {
          setNotFound(true);
        } else if (err.status === 502 || err.status === 503) {
          setStorageWarning(true);
        } else if (!err.isNetworkError) {
          setFormError('Algo saiu do lugar ao salvar. Tente novamente.');
        }
      } else {
        setFormError('Algo saiu do lugar ao salvar. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loadingItem) {
    return (
      <div className={styles.formPage}>
        <PageHeader title="Editar item" meta="Carregando dados do balcão…" />
        <div className={styles.detailSkeleton} aria-hidden="true" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.formPage}>
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

  return (
    <div className={styles.formPage}>
      <div className={styles.backRow}>
        <Link
          to={isEdit ? `/itens/${encodeURIComponent(id)}` : '/itens'}
          className={styles.backLink}
        >
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>{isEdit ? 'Voltar ao item' : 'Voltar aos achados'}</span>
        </Link>
      </div>

      <PageHeader
        title={isEdit ? 'Editar item' : 'Registrar item'}
        meta={
          isEdit
            ? 'Altere apenas o que precisar atualizar'
            : 'Preencha a etiqueta para guardar o objeto no balcão'
        }
      />

      {storageWarning && (
        <InlineNotice tone="warning">
          Não conseguimos guardar a foto agora. Tente de novo ou remova a foto
          escolhida para salvar sem foto.
        </InlineNotice>
      )}

      {formError && <InlineNotice tone="error">{formError}</InlineNotice>}

      <form noValidate onSubmit={handleSubmit} className={styles.itemForm}>
        <div className={styles.uploadColumn}>
          <ImageUpload
            file={file}
            onChange={(nextFile) => {
              setUploadError(undefined);
              setStorageWarning(false);
              setFile(nextFile);
            }}
            existingUrl={existingImageUrl}
            error={uploadError}
            uploading={saving && Boolean(file)}
          />
        </div>

        <div className={styles.fieldsColumn}>
          <InputField
            label="Nome do objeto"
            name="name"
            placeholder="Ex.: Garrafa térmica azul-marinho"
            hint="Ex.: Garrafa térmica azul-marinho"
            value={name}
            error={fieldErrors.name}
            onChange={(event) => setName(event.target.value)}
          />

          <TextareaField
            label="Descrição"
            name="description"
            placeholder="Cor, marca, chaveiros ou detalhes que ajudem a identificar…"
            hint="Cor, marca, detalhes que ajudem o dono a reconhecer"
            value={description}
            error={fieldErrors.description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className={styles.twoCols}>
            <InputField
              label="Onde foi achado"
              name="location"
              list={datalistId}
              placeholder="Ex.: Biblioteca Central"
              value={location}
              error={fieldErrors.location}
              onChange={(event) => setLocation(event.target.value)}
            />
            <datalist id={datalistId}>
              {knownLocations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>

            <InputField
              label="Data em que foi achado"
              name="date"
              type="date"
              max={maxDate}
              value={date}
              error={fieldErrors.date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className={styles.formActions}>
            <ButtonLink
              to={isEdit ? `/itens/${encodeURIComponent(id)}` : '/itens'}
              variant="ghost"
            >
              Cancelar
            </ButtonLink>

            <Button
              type="submit"
              disabled={isEdit && !isDirty}
              loading={saving}
              loadingLabel="Salvando…"
            >
              {isEdit ? 'Salvar alterações' : 'Registrar item'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

