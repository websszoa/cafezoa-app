/// <reference types="vite/client" />
/// <reference types="navermaps" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: string;
  readonly NEXT_PUBLIC_NAVER_MAP_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
