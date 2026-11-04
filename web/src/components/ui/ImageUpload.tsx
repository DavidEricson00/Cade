import { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, Camera, ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from './Button';
import styles from './ImageUpload.module.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export type ImageUploadProps = {
  /** Arquivo selecionado pelo usuário (ainda não salvo). */
  file: File | null;
  onChange: (file: File | null) => void;
  /** URL da foto já salva no servidor (modo edição). */
  existingUrl?: string;
  /** Mensagem de erro vinda do servidor ou validação externa. */
  error?: string;
  /** Em envio: exibe a barra de progresso em urucum e desabilita ações. */
  uploading?: boolean;
  label?: string;
};

function formatMegabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return 'Formato não aceito. Use JPEG, PNG, WebP ou GIF.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Esse arquivo tem ${formatMegabytes(file.size)} MB. O limite é 5 MB.`;
  }
  return null;
}

/** Upload de imagem com validação, preview e suporte a câmera/arrastar (seção 9.6). */
export function ImageUpload({
  file,
  onChange,
  existingUrl,
  error: externalError,
  uploading = false,
  label = 'Foto do objeto (opcional)',
}: ImageUploadProps) {
  const id = useId();
  const cameraId = `${id}-camera`;
  const errorId = `${id}-error`;
  const ruleId = `${id}-rule`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const activeError = localError ?? externalError ?? null;
  const displayUrl = previewUrl ?? existingUrl ?? null;
  const isNewFile = Boolean(file);

  function handleFileCandidate(candidate: File | undefined) {
    if (!candidate) return;
    const validationError = validateImageFile(candidate);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    onChange(candidate);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        disabled={uploading}
        className="sr-only"
        aria-describedby={[activeError ? errorId : '', ruleId].filter(Boolean).join(' ')}
        onChange={(event) => {
          handleFileCandidate(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      <input
        ref={cameraInputRef}
        id={cameraId}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={uploading}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          handleFileCandidate(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {displayUrl ? (
        <div className={styles.previewCard} data-error={Boolean(activeError) || undefined}>
          <div className={styles.previewFrame}>
            <img src={displayUrl} alt="Pré-visualização da foto do item" className={styles.previewImg} />
            {uploading && <div className={styles.progressBar} aria-hidden="true" />}
          </div>

          <div className={styles.previewFooter}>
            <span className="rotulo-mono texto-suave">
              {file ? `${file.name} (${formatMegabytes(file.size)} MB)` : 'Foto atual'}
            </span>
            <div className={styles.previewActions}>
              <Button
                variant="secondary"
                disabled={uploading}
                icon={<RefreshCw size={16} strokeWidth={1.75} />}
                onClick={openFilePicker}
              >
                {isNewFile ? 'Trocar' : 'Trocar foto'}
              </Button>
              {isNewFile && (
                <Button
                  variant="ghost"
                  disabled={uploading}
                  icon={<Trash2 size={16} strokeWidth={1.75} />}
                  onClick={() => {
                    setLocalError(null);
                    onChange(null);
                  }}
                >
                  Remover
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={styles.dropzone}
          data-dragging={dragging || undefined}
          data-error={Boolean(activeError) || undefined}
          onDragOver={(event) => {
            event.preventDefault();
            if (!uploading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (uploading) return;
            handleFileCandidate(event.dataTransfer.files?.[0]);
          }}
        >
          <button
            type="button"
            disabled={uploading}
            className={styles.dropTrigger}
            onClick={openFilePicker}
          >
            <ImagePlus size={28} strokeWidth={1.75} aria-hidden="true" />
            <span className={styles.mobilePrompt}>Toque para escolher uma foto</span>
            <span className={styles.desktopPrompt}>
              Arraste uma foto ou clique para escolher
            </span>
          </button>

          <button
            type="button"
            disabled={uploading}
            className={styles.cameraButton}
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>Usar câmera</span>
          </button>

          {uploading && <div className={styles.progressBar} aria-hidden="true" />}
        </div>
      )}

      <p id={ruleId} className="rotulo-mono texto-suave">
        JPEG, PNG, WebP ou GIF · máx. 5 MB
      </p>

      {activeError && (
        <p id={errorId} role="alert" className={styles.errorText}>
          <AlertCircle size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
}

