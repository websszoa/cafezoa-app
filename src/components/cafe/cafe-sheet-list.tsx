import { useMemo, useState } from "react";
import { Coffee, ImageOff, List, Loader2, Navigation, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  distanceBetween,
  formatDistance,
  getCafePhotos,
  getImageUrl,
  type MapCafe,
} from "@/lib/cafes";
import { useLocation } from "@/lib/location-context";
import { SHEET_CONTENT_CLASS } from "@/lib/sheet-styles";
import { cn } from "@/lib/utils";

type ListSort = "naver" | "google" | "nearby";

const SORT_TABS: { key: ListSort; label: string }[] = [
  { key: "naver", label: "네이버 평점 순" },
  { key: "google", label: "구글 평점 순" },
  { key: "nearby", label: "가까운 순" },
];

type ListCafe = MapCafe & { distance: number | null };

// "전체 카페 보기" 목록 시트. (카페 시트와 같은 바텀시트, 목록 디자인은 cafezoa.com 지도 왼쪽 목록과 같다)
export function CafeListSheet({
  cafes,
  open,
  onOpenChange,
  selectedSlug,
  onSelectCafe,
}: {
  cafes: MapCafe[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 지금 카페 시트로 보고 있는 카페 (목록에서 강조) */
  selectedSlug?: string | null;
  onSelectCafe: (cafe: MapCafe) => void;
}) {
  const { location, status, requestLocation } = useLocation();
  const [sort, setSort] = useState<ListSort>("naver");
  // "가까운 순"을 눌러 위치를 받는 중인지
  const [waitingLocation, setWaitingLocation] = useState(false);
  const locating = waitingLocation && status === "loading";

  // 위치가 없으면 가까운 순으로 정렬할 수 없으므로 네이버 평점 순으로 보여준다.
  const activeSort: ListSort = sort === "nearby" && !location ? "naver" : sort;

  const sortedCafes = useMemo<ListCafe[]>(() => {
    const list = cafes.map((cafe) => ({
      ...cafe,
      distance: location
        ? distanceBetween(location.latitude, location.longitude, cafe.location.latitude, cafe.location.longitude)
        : null,
    }));
    // 값이 큰 순(거리는 가까운 순). 값이 없는 카페는 맨 뒤로.
    const value = (cafe: ListCafe) =>
      activeSort === "nearby"
        ? cafe.distance === null
          ? null
          : -cafe.distance
        : (cafe.ratings[activeSort]?.rating ?? null);
    return list.sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      if (av === null) return bv === null ? 0 : 1;
      if (bv === null) return -1;
      return bv - av;
    });
  }, [cafes, location, activeSort]);

  const handleSort = (next: ListSort) => {
    if (next === "nearby" && !location) {
      // 위치가 없으면 바로 위치 권한을 요청하고, 받으면 가까운 순으로 바꾼다.
      setWaitingLocation(true);
      requestLocation(() => {
        setWaitingLocation(false);
        setSort("nearby");
      });
      return;
    }
    setSort(next);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={SHEET_CONTENT_CLASS}>
        {/* 헤더: 아이콘 버튼 | 제목·안내 | 닫기 */}
        <div className="shrink-0 border-b border-[#ead9ca] px-5 pt-4 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-bark bg-leaf text-bark shadow-[2px_2px_0_var(--color-bark)]">
              <List className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <DrawerTitle className="font-paperlogy text-xl font-semibold text-bark">
                전체 카페
              </DrawerTitle>
              <DrawerDescription className="text-left text-sm break-keep text-stone-500">
                등록된 카페 {cafes.length}곳을 모두 보여드려요
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="목록 닫기"
                className="size-9 shrink-0 self-start rounded-full text-bark hover:bg-white hover:text-autumn"
              >
                <X className="size-5" />
              </Button>
            </DrawerClose>
          </div>

          {/* 정렬 탭 */}
          <div role="tablist" aria-label="정렬 기준" className="mt-4 flex gap-1.5">
            {SORT_TABS.map(({ key, label }) => {
              const selected = activeSort === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  disabled={locating}
                  onClick={() => handleSort(key)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border-2 border-bark px-3 py-1 text-xs font-bold transition-colors disabled:opacity-60",
                    selected ? "bg-autumn text-white" : "bg-white text-bark hover:bg-cream",
                  )}
                >
                  {key === "nearby" && locating && <Loader2 className="size-3 animate-spin" />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 목록 */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <ul className="space-y-2 p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {sortedCafes.length === 0 && (
              <li className="py-10 text-center text-sm text-stone-500">카페를 불러오고 있어요.</li>
            )}
            {sortedCafes.map((cafe, index) => {
              const photo = getCafePhotos(cafe)[0];
              const rating = cafe.ratings[activeSort === "google" ? "google" : "naver"];
              return (
                <li key={cafe.slug}>
                  <button
                    type="button"
                    onClick={() => onSelectCafe(cafe)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-2.5 text-left transition-colors outline-none hover:bg-[#fffaf2] focus-visible:bg-[#fffaf2]",
                      selectedSlug === cafe.slug ? "border-autumn" : "border-transparent",
                    )}
                  >
                    <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-stone-200 text-stone-400">
                      {photo ? (
                        <img
                          src={getImageUrl(photo.src)}
                          alt={`${cafe.name} 대표 사진`}
                          loading={index < 6 ? "eager" : "lazy"}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageOff className="size-5" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-paperlogy block truncate text-base font-semibold text-bark">
                        {cafe.name}
                      </span>
                      <span className="mt-1 flex items-center gap-1 truncate text-xs text-stone-600">
                        <Coffee aria-hidden="true" className="size-3.5 shrink-0 text-autumn" />
                        {cafe.type.slice(0, 3).join(" · ")}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2 text-xs font-bold text-[#795f55]">
                        {rating && (
                          <span className="flex items-center gap-1">
                            <Star aria-hidden="true" className="size-3.5 fill-autumn text-autumn" />
                            {rating.rating.toFixed(2)}
                          </span>
                        )}
                        {cafe.distance !== null && (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap text-autumn">
                            <Navigation aria-hidden="true" className="size-3 shrink-0" />
                            <span className="sr-only">내 위치에서</span>
                            {formatDistance(cafe.distance)}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
