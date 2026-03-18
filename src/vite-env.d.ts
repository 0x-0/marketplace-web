/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEDUSA_API_URL: string
  readonly VITE_MEDUSA_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
