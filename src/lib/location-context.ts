import { createContext, useContext } from "react";

// 내 위치 좌표. 이 기기의 localStorage에 저장한다.
export type UserLocation = {
  latitude: number;
  longitude: number;
  // 위치를 확인한 시각 (ISO 문자열)
  savedAt: string;
};

export type LocationStatus = "idle" | "loading" | "denied" | "error";

export type LocationContextValue = {
  // 저장된 내 위치. 없으면 null.
  location: UserLocation | null;
  // 위치를 받는 중이거나 실패한 상태 (안내 팝업 문구에 쓴다)
  status: LocationStatus;
  // "내 위치 확인하기": 저장된 위치가 없으면 안내 팝업을 열고, 있으면 위치를 새로 확인한다.
  checkLocation: () => void;
  // 안내 팝업 열기
  openDialog: () => void;
};

export const LocationContext = createContext<LocationContextValue | null>(null);

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation은 LocationProvider 안에서 사용해야 합니다.");
  }
  return context;
}
