// 네이버 지도 마커 HTML (cafezoa.com page-map-prop.tsx 와 같은 디자인)
// - 카페 마커: 카페 이름 알약 + 네이버 평점 배지
// - 내 위치 마커: 얼굴 이미지 + 주황 펄스

import type { MapCafe } from "@/lib/cafes";

/** 마커 전체 크기 — anchor(하단 중앙) 계산에 사용. cafezoa.com 과 동일 */
export const CAFE_MARKER_SIZE = { width: 260, height: 52 };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 카페 이름 알약과 그 위의 네이버 평점 배지로 이루어진 마커 HTML (cafezoa.com getMarkerContent 와 동일한 디자인) */
export function cafeMarkerHtml({ name, naverRating }: Pick<MapCafe, "name" | "naverRating">) {
  const ratingBadge = naverRating !== null ? `★ ${naverRating.toFixed(2)}` : "";
  const { width, height } = CAFE_MARKER_SIZE;

  return `
    <div style="position:relative;display:flex;justify-content:center;width:${width}px;height:${height}px;pointer-events:none;">
      <span role="button" aria-label="${escapeHtml(name)}" style="position:absolute;top:18px;left:50%;height:34px;min-width:max-content;border:2px solid var(--bark);border-radius:999px;background:var(--leaf);padding:0 14px;color:var(--bark);font-family:var(--font-nanum);font-size:12px;font-weight:800;line-height:30px;text-align:center;white-space:nowrap;transform:translateX(-50%);pointer-events:auto;cursor:pointer;">
        ${escapeHtml(name)}
      </span>
      ${
        ratingBadge
          ? `<span style="position:absolute;top:0;left:50%;z-index:1;border:2px solid var(--bark);border-radius:999px;background:var(--autumn);padding:2px 8px;color:white;font-family:var(--font-nanum);font-size:10px;font-weight:800;line-height:16px;white-space:nowrap;transform:translateX(-50%);">${ratingBadge}</span>`
          : ""
      }
    </div>
  `;
}

// ---------------------------------------------------------------------
// 내 위치 마커
// ---------------------------------------------------------------------

const IMAGE_BASE_URL = "https://websszoa.github.io/cafezoa.com/public/";

// 내 위치 마커에 쓰는 얼굴 이미지 수. (face01.webp ~ face10.webp)
export const FACE_COUNT = 10;

/** 마커 크기 — anchor(가운데) 계산에 사용 */
export const MY_LOCATION_MARKER_SIZE = 40;

// 펄스 애니메이션. 마커 HTML 안에 같이 넣어 지도 라이브러리가 그린 요소에도 바로 적용되게 한다.
// 주황 원 두 개가 1초 간격으로 커지면서 사라져 "두근두근" 퍼지는 느낌을 낸다.
const MY_LOCATION_STYLE = `
  <style>
    @keyframes cafezoa-location-pulse {
      0% { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    .cafezoa-location-pulse {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: rgba(255, 91, 32, 0.35);
      border: 2px solid rgba(255, 91, 32, 0.6);
      animation: cafezoa-location-pulse 2s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
    }
    .cafezoa-location-pulse + .cafezoa-location-pulse {
      animation-delay: 1s;
    }
    @media (prefers-reduced-motion: reduce) {
      .cafezoa-location-pulse { animation: none; opacity: 0.3; transform: scale(1.2); }
    }
  </style>
`;

/** 얼굴 이미지를 연분홍 원에 넣고, 뒤에서 주황 원이 펄스처럼 퍼지는 마커 HTML */
export function myLocationMarkerHtml(face: number) {
  const src = `${IMAGE_BASE_URL}face/face${String(face).padStart(2, "0")}.webp`;
  const size = MY_LOCATION_MARKER_SIZE;
  return `
    ${MY_LOCATION_STYLE}
    <div style="position:relative;width:${size}px;height:${size}px;">
      <span class="cafezoa-location-pulse"></span>
      <span class="cafezoa-location-pulse"></span>
      <img src="${src}" alt="내 위치" width="${size}" height="${size}" style="position:absolute;inset:0;width:${size}px;height:${size}px;border:3px solid var(--autumn);border-radius:999px;background:#ffe4ec;object-fit:cover;" />
    </div>
  `;
}
