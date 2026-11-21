import { LocateFixed, Map } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "@/lib/location-context";
import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS, MENU_SEPARATOR_CLASS } from "@/lib/menu-styles";

// 모바일 화면(지도 영역) 왼쪽 하단 버튼. (cafezoa.com page-float.tsx 의 왼쪽 버튼과 같은 디자인)
// 메뉴: 내 위치 확인하기 / 전체 카페 보기
export function LocationButton({ onShowAll }: { onShowAll: () => void }) {
  const { checkLocation, status } = useLocation();

  return (
    // modal={false}: 메뉴에서 위치 안내 팝업을 열 때 포커스·클릭 잠금이 꼬이지 않게
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="seed"
          size="icon"
          aria-label="내 위치·전체 카페 메뉴"
          className="absolute bottom-5 left-4 z-40 size-10 bg-leaf p-0 text-bark hover:bg-leaf-dark"
        >
          <LocateFixed className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className={MENU_CONTENT_CLASS}>
        {/* 안내 팝업을 먼저 열고, 팝업의 "사용하기"로 위치를 확인한다. */}
        <DropdownMenuItem
          onSelect={checkLocation}
          disabled={status === "loading"}
          className={MENU_ITEM_CLASS}
        >
          <LocateFixed />
          내 위치 확인하기
        </DropdownMenuItem>
        <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />
        <DropdownMenuItem onSelect={onShowAll} className={MENU_ITEM_CLASS}>
          <Map />
          전체 카페 보기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
