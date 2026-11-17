import { LocateFixed } from "lucide-react";

import { useLocation } from "@/lib/location-context";
import { Button } from "@/components/ui/button";

// 모바일 화면(지도 영역) 왼쪽 하단에 떠 있는 내 위치 버튼. (cafezoa.com page-float.tsx 의 왼쪽 버튼과 같은 디자인)
// 저장된 위치가 없으면 안내 팝업을 열고, 있으면 위치를 새로 확인한다.
export function LocationButton() {
  const { checkLocation, status } = useLocation();

  return (
    <Button
      variant="seed"
      size="icon"
      aria-label="내 위치 확인하기"
      onClick={checkLocation}
      disabled={status === "loading"}
      className="absolute bottom-5 left-4 z-40 size-10 bg-leaf p-0 text-bark hover:bg-leaf-dark"
    >
      <LocateFixed className="size-5" />
    </Button>
  );
}
