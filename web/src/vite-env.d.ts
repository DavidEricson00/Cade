/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base da API. Padrão: "/api" (mesma origem, via proxy). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

