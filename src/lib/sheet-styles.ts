// 바텀시트(카페 시트·목록 시트) 공통 스타일
// - 모바일 화면 너비(480px) 안에서만, cream 배경, 위쪽 둥근 모서리, 테두리 없음
// - [&>div:first-child]: shadcn drawer 상단 손잡이 → bark색
export const SHEET_CONTENT_CLASS =
  "mx-auto max-w-120 [&>div:first-child]:bg-bark rounded-t-3xl border-0 bg-cream text-bark data-[vaul-drawer-direction=bottom]:max-h-[88dvh] data-[vaul-drawer-direction=bottom]:border-t-0 data-[vaul-drawer-direction=bottom]:rounded-t-3xl";
