import { useEffect, useRef, useState } from "react";

import { useLocation } from "@/lib/location-context";
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
}

export function NaverMap({ className, cafes = [], onSelectCafe }: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(MISSING_KEY_ERROR);
  const { location } = useLocation();
  // 마커를 다시 만들지 않고도 최신 콜백을 쓰기 위해 ref에 담아 둔다.
  const onSelectRef = useRef(onSelectCafe);
  useEffect(() => {
    onSelectRef.current = onSelectCafe;
  }, [onSelectCafe]);
  // 지도에 반영한 마지막 위치 확인 시각. 위치를 새로 확인했을 때만 지도를 옮기기 위해 쓴다.
  const lastSavedAtRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!CLIENT_ID) return;

    let instance: naver.maps.Map | undefined;
    let cancelled = false;

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

    const { width, height } = CAFE_MARKER_SIZE;
    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(cafes[0].location.latitude, cafes[0].location.longitude),
      new naver.maps.LatLng(cafes[0].location.latitude, cafes[0].location.longitude),
    );

    const markers = cafes.map((cafe) => {
      const position = new naver.maps.LatLng(cafe.location.latitude, cafe.location.longitude);
      bounds.extend(position);

      const marker = new naver.maps.Marker({
        map,
        position,
        title: cafe.name,
        icon: {
          content: cafeMarkerHtml(cafe),
          size: new naver.maps.Size(width, height),
          anchor: new naver.maps.Point(width / 2, height), // 하단 중앙이 좌표에 오도록
        },
      });

      naver.maps.Event.addListener(marker, "click", () => {
        map.panTo(position);
        onSelectRef.current?.(cafe);
      });

      return marker;
    });

    // 모든 카페가 보이도록 화면 맞추기
    // 한 곳뿐이면 fitBounds가 최대로 확대하므로 적당한 줌으로 이동
    if (cafes.length === 1) {
      map.morph(bounds.getCenter(), 16);
    } else {
      // top: 상단 헤더 높이만큼 여백
      map.fitBounds(bounds, { top: 100, right: 40, bottom: 80, left: 40 });
    }

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [map, cafes]);

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
    if (lastSavedAtRef.current !== undefined && lastSavedAtRef.current !== location.savedAt) {
      map.morph(position, 15);
    }
    lastSavedAtRef.current = location.savedAt;

    return () => marker.setMap(null);
  }, [map, location]);

  // 지도가 준비됐을 때 저장된 위치가 없으면, 이후 처음 켠 위치로는 이동하도록 표시
  useEffect(() => {
    if (map && !location && lastSavedAtRef.current === undefined) lastSavedAtRef.current = null;
  }, [map, location]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}
