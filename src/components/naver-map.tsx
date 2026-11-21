import { useEffect, useRef, useState } from "react";

import { useLocation } from "@/lib/location-context";
import { cn } from "@/lib/utils";
import {
  CAFE_MARKER_SIZE,
  cafeMarkerHtml,
  FACE_COUNT,
  MY_LOCATION_MARKER_SIZE,
  myLocationMarkerHtml,
} from "@/lib/marker";
import type { MapCafe } from "@/lib/cafes";

const SCRIPT_ID = "naver-map-sdk";
const DEFAULT_CENTER = { lat: 37.5666, lng: 126.9784 }; // 서울시청

const CLIENT_ID = import.meta.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
const MISSING_KEY_ERROR = CLIENT_ID ? null : "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.";

// 내 위치 마커 얼굴 이미지 (앱 실행마다 하나를 골라 계속 쓴다)
const MY_FACE = Math.floor(Math.random() * FACE_COUNT) + 1;

/** 카페 마커 하나를 만든다. 누르면 그 위치로 이동하고 onClick을 부른다. */
function createCafeMarker(map: naver.maps.Map, cafe: MapCafe, badge: string | undefined, onClick: () => void) {
  const { width, height } = CAFE_MARKER_SIZE;
  const position = new naver.maps.LatLng(cafe.location.latitude, cafe.location.longitude);
  const marker = new naver.maps.Marker({
    map,
    position,
    title: cafe.name,
    icon: {
      content: cafeMarkerHtml(cafe, badge),
      size: new naver.maps.Size(width, height),
      anchor: new naver.maps.Point(width / 2, height), // 하단 중앙이 좌표에 오도록
    },
  });
  naver.maps.Event.addListener(marker, "click", () => {
    map.panTo(position);
    onClick();
  });
  return marker;
}

let sdkPromise: Promise<void> | null = null;

function loadNaverMapSdk(clientId: string) {
  if (window.naver?.maps) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("네이버 지도 SDK를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

interface NaverMapProps {
  className?: string;
  cafes?: MapCafe[];
  /** 카페 마커를 눌렀을 때 */
  onSelectCafe?: (cafe: MapCafe) => void;
  /** 마커 배지 문구. 없으면 네이버 평점 */
  getBadge?: (cafe: MapCafe) => string;
  /** 화면 범위를 맞출 때 카페들과 함께 보이게 할 위치 (예: 내 위치 근처 보기의 내 위치) */
  includeInBounds?: { latitude: number; longitude: number } | null;
  /** cafes에 없더라도 마커를 하나 더 그릴 카페 (예: 전체 목록에서 고른 카페). 화면 범위는 바꾸지 않는다 */
  pinnedCafe?: MapCafe | null;
  /** 이 위치로 지도를 옮긴다 (예: 목록에서 카페 선택). key가 바뀔 때마다 이동 */
  focusTarget?: { latitude: number; longitude: number; key: number } | null;
}

export function NaverMap({
  className,
  cafes = [],
  onSelectCafe,
  getBadge,
  includeInBounds = null,
  focusTarget = null,
  pinnedCafe = null,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(MISSING_KEY_ERROR);
  const { location } = useLocation();
  // 마커를 다시 만들지 않고도 최신 콜백을 쓰기 위해 ref에 담아 둔다.
  const onSelectRef = useRef(onSelectCafe);
  const includeInBoundsRef = useRef(includeInBounds);
  useEffect(() => {
    onSelectRef.current = onSelectCafe;
    includeInBoundsRef.current = includeInBounds;
  }, [onSelectCafe, includeInBounds]);
  // 지도에 반영한 마지막 위치 확인 시각. 위치를 새로 확인했을 때만 지도를 옮기기 위해 쓴다.
  const lastSavedAtRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!CLIENT_ID) return;

    let instance: naver.maps.Map | undefined;
    let cancelled = false;

    // 네이버 지도 인증 실패 콜백 (SDK가 전역 함수로 호출한다).
    // 등록해야 할 도메인을 알 수 있도록 현재 접속 주소를 같이 보여준다.
    window.navermap_authFailure = () => {
      const { protocol, host, origin } = window.location;
      console.error("[naver-map] auth failure", { origin, protocol, host, referrer: document.referrer });
      if (!cancelled) {
        setError(
          `네이버 지도 인증에 실패했어요.\n네이버 클라우드 콘솔 > Maps > Web 서비스 URL에 아래 주소를 등록해 주세요.\n\n${origin && origin !== "null" ? origin : `${protocol}//${host}`}`,
        );
      }
    };

    loadNaverMapSdk(CLIENT_ID)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        instance = new naver.maps.Map(containerRef.current, {
          center: new naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
          zoom: 16,
        });
        setMap(instance);
      })
      .catch((e: Error) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
      instance?.destroy();
      setMap(null);
    };
  }, []);

  // 카페 마커 표시
  useEffect(() => {
    if (!map || cafes.length === 0) return;

    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(cafes[0].location.latitude, cafes[0].location.longitude),
      new naver.maps.LatLng(cafes[0].location.latitude, cafes[0].location.longitude),
    );

    const markers = cafes.map((cafe) => {
      const marker = createCafeMarker(map, cafe, getBadge?.(cafe), () => onSelectRef.current?.(cafe));
      bounds.extend(marker.getPosition());
      return marker;
    });

    if (includeInBounds) {
      bounds.extend(new naver.maps.LatLng(includeInBounds.latitude, includeInBounds.longitude));
    }

    // 모든 카페가 보이도록 화면 맞추기
    // 한 곳뿐이면 fitBounds가 최대로 확대하므로 적당한 줌으로 이동
    if (cafes.length === 1 && !includeInBounds) {
      map.morph(bounds.getCenter(), 16);
    } else {
      // top: 상단 헤더, bottom: 하단 보기 기준 버튼 높이만큼 여백
      map.fitBounds(bounds, { top: 100, right: 40, bottom: 100, left: 40 });
    }

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [map, cafes, getBadge, includeInBounds]);

  // 목록에서 고른 카페가 지금 마커에 없으면 그 카페 마커만 하나 더 그린다. (전체를 다 그리지 않기 위해)
  useEffect(() => {
    if (!map || !pinnedCafe || cafes.some((cafe) => cafe.slug === pinnedCafe.slug)) return;
    const marker = createCafeMarker(map, pinnedCafe, getBadge?.(pinnedCafe), () =>
      onSelectRef.current?.(pinnedCafe),
    );
    return () => marker.setMap(null);
  }, [map, pinnedCafe, cafes, getBadge]);

  // 내 위치가 있으면 내 위치 마커를 표시하고, 위치를 새로 확인했을 때는 지도를 내 위치로 옮긴다.
  useEffect(() => {
    if (!map || !location) return;

    const position = new naver.maps.LatLng(location.latitude, location.longitude);
    const half = MY_LOCATION_MARKER_SIZE / 2;
    const marker = new naver.maps.Marker({
      map,
      position,
      title: "내 위치",
      zIndex: 1000,
      icon: {
        content: myLocationMarkerHtml(MY_FACE),
        size: new naver.maps.Size(MY_LOCATION_MARKER_SIZE, MY_LOCATION_MARKER_SIZE),
        anchor: new naver.maps.Point(half, half),
      },
    });

    // 처음 지도를 열 때(저장된 위치)는 카페 전체 보기 그대로 두고, 이후 새로 확인한 경우에만 이동
    // (내 위치를 범위에 넣어 맞추는 중이면 카페 마커 쪽에서 범위를 맞추므로 이동하지 않는다)
    if (
      !includeInBoundsRef.current &&
      lastSavedAtRef.current !== undefined &&
      lastSavedAtRef.current !== location.savedAt
    ) {
      map.morph(position, 15);
    }
    lastSavedAtRef.current = location.savedAt;

    return () => marker.setMap(null);
  }, [map, location]);

  // 목록 등에서 고른 카페로 지도 이동
  useEffect(() => {
    if (!map || !focusTarget) return;
    map.morph(new naver.maps.LatLng(focusTarget.latitude, focusTarget.longitude), 16);
  }, [map, focusTarget]);

  // 지도가 준비됐을 때 저장된 위치가 없으면, 이후 처음 켠 위치로는 이동하도록 표시
  useEffect(() => {
    if (map && !location && lastSavedAtRef.current === undefined) lastSavedAtRef.current = null;
  }, [map, location]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm whitespace-pre-line break-all text-muted-foreground">
        {error}
      </div>
    );
  }

  // isolate: 네이버 지도 로고·컨트롤의 높은 z-index가 시트·팝업 위로 올라오지 않게 지도 안에 가둔다.
  return <div ref={containerRef} className={cn("isolate", className ?? "h-full w-full")} />;
}
