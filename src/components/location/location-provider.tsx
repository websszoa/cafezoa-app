import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { DialogLocation } from "@/components/dialog/dialog-location";
import {
  LocationContext,
  type LocationStatus,
  type UserLocation,
} from "@/lib/location-context";

// cafezoa.com components/location/location-provider.tsx 기반.
// (앱에는 로그인이 없어서 계정(Supabase) 동기화는 빼고, 기기의 localStorage에만 저장한다)

const STORAGE_KEY = "cafezoa-location";
// 같은 탭에서 저장이 바뀐 것을 알리는 이벤트 (storage 이벤트는 다른 탭에만 온다)
const CHANGE_EVENT = "cafezoa-location-change";

// localStorage 읽기·쓰기. 막혀 있어도 오류 없이 넘어간다.
function readStoredLocation() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredLocation(location: UserLocation) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    // 저장할 수 없어도 이번 화면에서는 아래 이벤트로 반영한다.
  }
  memoryLocation = JSON.stringify(location);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// localStorage를 쓸 수 없는 환경에서도 이번 실행 동안은 위치를 기억한다.
let memoryLocation: string | null = null;

function getSnapshot() {
  return readStoredLocation() ?? memoryLocation;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function parseLocation(value: string | null): UserLocation | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as UserLocation;
    return typeof parsed.latitude === "number" && typeof parsed.longitude === "number"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const location = useMemo(() => parseLocation(stored), [stored]);

  const [status, setStatus] = useState<LocationStatus>("idle");
  const [open, setOpen] = useState(false);

  // 현재 위치를 한 번 요청한다. (계속 추적하지 않는다)
  const requestLocation = useCallback((onSuccess?: () => void) => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        writeStoredLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          savedAt: new Date().toISOString(),
        });
        setStatus("idle");
        onSuccess?.();
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const openDialog = useCallback(() => {
    setStatus("idle");
    setOpen(true);
  }, []);

  // "내 위치 확인하기": 저장된 위치가 있어도 항상 안내 팝업을 먼저 연다.
  const checkLocation = openDialog;

  const value = useMemo(
    () => ({ location, status, checkLocation, openDialog, requestLocation }),
    [location, status, checkLocation, openDialog, requestLocation],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
      <DialogLocation
        open={open}
        onOpenChange={setOpen}
        status={status}
        onConfirm={() =>
          requestLocation(() => {
            setOpen(false);
            toast.success(
              location
                ? "내 위치를 새로 확인했어요."
                : "내 위치를 켰어요. 가까운 카페를 찾아보세요.",
            );
          })
        }
      />
    </LocationContext.Provider>
  );
}
