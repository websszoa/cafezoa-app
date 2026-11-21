import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VIEW_MODES, type ViewMode } from "@/lib/cafes";

// 화면 하단 가운데의 "지금 보는 기준" 버튼. 누르면 기준 선택 팝업을 다시 연다.
// (cafezoa.com 모바일 지도 하단 정렬 버튼과 같은 자리·모양)
export function ViewModeButton({
  mode,
  limit,
  onClick,
}: {
  mode: ViewMode;
  limit: number;
  onClick: () => void;
}) {
  return (
    <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
      <Button
        variant="seed"
        onClick={onClick}
        aria-label="보기 기준 바꾸기"
        className="h-10 bg-white text-bark shadow-[3px_3px_0_var(--color-bark)] hover:bg-cream"
      >
        <span className="rounded-full bg-autumn px-1.5 py-px text-[10px] text-white">
          TOP {limit}
        </span>
        {VIEW_MODES[mode].short}
        <ChevronDown className="size-4" />
      </Button>
    </div>
  );
}
