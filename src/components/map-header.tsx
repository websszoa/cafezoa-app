import { useState, type ReactNode } from "react";
import { MapPinned, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";

// 지도 위 상단 헤더. (cafezoa.com /map 페이지의 모바일 상단 바와 같은 디자인)
// 왼쪽 버튼: 검색을 지우고 전체 카페 보기 / 가운데: 카페 이름·지역 검색 / 오른쪽: children (예: 개수 버튼)
export function MapHeader({
  onSearch,
  children,
}: {
  onSearch: (query: string) => void;
  children?: ReactNode;
}) {
  const [value, setValue] = useState("");

  const reset = () => {
    setValue("");
    onSearch("");
  };

  return (
    <header className="absolute top-2 right-2 left-2 z-20 flex items-center gap-3 p-3">
      <Button
        variant="sprout"
        size="icon"
        aria-label="전체 카페 보기"
        onClick={reset}
        className="size-11 shrink-0 bg-leaf p-0 text-bark shadow-none hover:bg-leaf-dark"
      >
        <MapPinned className="size-5" />
      </Button>

      <div role="search" className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-500"
        />
        <input
          type="search"
          enterKeyHint="search"
          aria-label="카페 검색"
          placeholder="카페 이름, 지역으로 검색"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // 한글 조합 중에 누른 엔터는 무시한다. (조합 완료 엔터로 두 번 검색되는 것 방지)
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              onSearch(value);
              event.currentTarget.blur(); // 모바일 키보드 닫기
            }
          }}
          className="w-full rounded-full border-2 border-bark bg-white py-2.5 pr-10 pl-10 text-sm text-bark shadow-[3px_3px_0_var(--color-bark)] outline-none placeholder:text-stone-400 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={reset}
            className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-stone-500 hover:text-bark"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {children}
    </header>
  );
}
