/// <reference types="vite/client" />
/// <reference types="navermaps" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: string;
  readonly NEXT_PUBLIC_NAVER_MAP_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** 네이버 지도 SDK가 인증 실패 시 호출하는 전역 콜백 */
  navermap_authFailure?: () => void;
}
