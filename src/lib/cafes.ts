const DATA_BASE_URL = "https://websszoa.github.io/cafezoa.com/data";
const IMAGE_BASE_URL = "https://websszoa.github.io/cafezoa.com/public/";
export const CAFE_DATA_URL = `${DATA_BASE_URL}/cafe-basic.json`;
export const CAFE_RATINGS_URL = `${DATA_BASE_URL}/cafe-ratings.json`;
export const CAFE_DETAILS_URL = `${DATA_BASE_URL}/cafe-details.json`;

export interface Cafe {
  name: string;
  slug: string;
  summary: string;
  description: string;
  type: string[];
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

/** 카페 사진 (media.gallery). alt는 사진 설명 */
export type CafePhoto = { src: string; alt: string };

/** cafe-details.json 의 카페 상세 정보. 카페마다 항목이 조금씩 달라서 모두 선택값 */
export interface CafeDetail {
  type?: string[];
  view?: string[];
  services?: string[];
  purpose?: string[];
  features?: string[];
  floors?: string[];
  parking?: string[];
  pet?: string[];
  restroom?: string[];
  children?: string[];
  study?: string[];
  smoking?: string[];
  seating?: string[];
  business?: { closed_days?: string; hours?: Record<string, string> };
  price?: Record<string, number | null>;
  media?: {
    phone?: string | null;
    website?: string | null;
    instagram?: string | null;
    cover?: string;
    gallery?: CafePhoto[];
  };
}

/** 플랫폼별 최신 평점 */
export interface LatestRating {
  rating: number;
  count: number;
  /** "YYYY-MM" */
  month: string;
}

/** 지도에 표시할 카페 (평점·상세 정보 포함) */
export interface MapCafe extends Cafe {
  naverRating: number | null;
  ratings: { naver: LatestRating | null; google: LatestRating | null };
  detail: CafeDetail | null;
}

type Platform = "naver" | "google";
/** { [slug]: { ["YYYY-MM" | "YYYY-MM-DD"]: { naver?: [평점, 리뷰수], google?: [...] } } } */
type CafeRatings = Record<string, Record<string, Partial<Record<Platform, [number, number]>>>>;

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`데이터를 불러오지 못했습니다. (${res.status} ${url})`);
  return res.json() as Promise<T>;
}

/** 실패해도 지도는 보여야 하는 보조 데이터(평점·상세): 실패 시 빈 객체 */
function fetchOptionalJson<T extends object>(url: string, signal?: AbortSignal): Promise<T> {
  return fetchJson<T>(url, signal).catch((e: Error) => {
    if (e.name === "AbortError") throw e;
    console.warn(e);
    return {} as T;
  });
}

/** cafezoa.com lib/ratings.ts 의 getLatestRating 과 같은 규칙: 가장 최근 날짜의 평점 */
function getLatestRating(ratings: CafeRatings, slug: string, platform: Platform): LatestRating | null {
  const byDate = ratings[slug];
  if (!byDate) return null;
  const date = Object.keys(byDate)
    .sort()
    .reverse()
    .find((key) => byDate[key]?.[platform]);
  const value = date ? byDate[date][platform] : undefined;
  if (!date || !value) return null;
  return { rating: value[0], count: value[1], month: date.slice(0, 7) };
}

export async function fetchCafes(signal?: AbortSignal): Promise<MapCafe[]> {
  const [cafes, ratings, details] = await Promise.all([
    fetchJson<Cafe[]>(CAFE_DATA_URL, signal),
    fetchOptionalJson<CafeRatings>(CAFE_RATINGS_URL, signal),
    fetchOptionalJson<Record<string, CafeDetail>>(CAFE_DETAILS_URL, signal),
  ]);

  return cafes
    .filter((cafe) => Number.isFinite(cafe.location?.latitude) && Number.isFinite(cafe.location?.longitude))
    .map((cafe) => {
      const naver = getLatestRating(ratings, cafe.slug, "naver");
      return {
        ...cafe,
        naverRating: naver?.rating ?? null,
        ratings: { naver, google: getLatestRating(ratings, cafe.slug, "google") },
        detail: details[cafe.slug] ?? null,
      };
    });
}

/** "/cafe/x-01.webp" → "https://.../public/cafe/x-01.webp" (cafezoa.com getImageUrl 과 동일) */
export function getImageUrl(path: string) {
  return `${IMAGE_BASE_URL}${path.replace(/^\//, "")}`;
}

/** 카페 사진 목록. gallery가 없으면 cover, 그것도 없으면 빈 배열 */
export function getCafePhotos(cafe: MapCafe): CafePhoto[] {
  const media = cafe.detail?.media;
  if (media?.gallery?.length) return media.gallery;
  if (media?.cover) return [{ src: media.cover, alt: "" }];
  return [];
}

/** 두 좌표 사이 거리(km). 하버사인 공식 */
export function distanceBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 거리 표시: 1km 미만은 m, 그 이상은 소수 첫째 자리 km */
export function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

/** 검색어 비교용: 공백 제거 + 소문자 (cafezoa.com 과 동일) */
function normalize(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

/** 카페 이름·주소로 검색 (cafezoa.com 지도 검색과 같은 규칙) */
export function searchCafes<T extends Cafe>(cafes: T[], query: string): T[] {
  const keyword = normalize(query);
  if (!keyword) return cafes;
  return cafes.filter(
    (cafe) =>
      normalize(cafe.name).includes(keyword) || normalize(cafe.location.address).includes(keyword),
  );
}
