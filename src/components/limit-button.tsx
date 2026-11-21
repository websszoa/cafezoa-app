import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VIEW_LIMITS, type ViewLimit } from "@/lib/cafes";
import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS, MENU_SEPARATOR_CLASS } from "@/lib/menu-styles";
import { cn } from "@/lib/utils";

// 상단 헤더 오른쪽의 "지도에 보여줄 카페 수" 버튼. (헤더 왼쪽 연두 버튼과 같은 디자인)
// 누르면 10개 / 20개 / 30개 보기 중에서 고른다.
export function LimitButton({
  limit,
  onChange,
}: {
  limit: ViewLimit;
  onChange: (limit: ViewLimit) => void;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="sprout"
          size="icon"
          aria-label={`지도에 보여줄 카페 수 (지금 ${limit}개)`}
          className="size-11 shrink-0 bg-leaf p-0 text-base font-extrabold text-bark shadow-none hover:bg-leaf-dark"
        >
          {limit}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" sideOffset={8} className={MENU_CONTENT_CLASS}>
        {VIEW_LIMITS.map((value, index) => {
          const selected = value === limit;
          return (
            <div key={value}>
              {index > 0 && <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />}
              <DropdownMenuItem
                onSelect={() => onChange(value)}
                aria-current={selected}
                className={cn(MENU_ITEM_CLASS, "justify-between", selected && "text-autumn")}
              >
                {value}개 보기
                {selected && <Check />}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
