
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference lib="webworker" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
