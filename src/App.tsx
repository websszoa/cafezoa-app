import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { CafeListSheet } from "@/components/cafe/cafe-sheet-list";
import { CafeSheet } from "@/components/cafe/cafe-sheet-detail";
import { DialogViewMode } from "@/components/dialog/dialog-view-mode";
import { MapHeader } from "@/components/map-header";
import { LimitButton } from "@/components/limit-button";
import { MenuButton } from "@/components/menu-button";
import { LocationButton } from "@/components/location/location-button";
import { LocationProvider } from "@/components/location/location-provider";
import { NaverMap } from "@/components/naver-map";
import { ViewModeButton } from "@/components/view-mode-button";
import { useLocation } from "@/lib/location-context";
import {
  fetchCafes,
  getMarkerBadge,
  rankCafes,
  searchCafes,
  VIEW_LIMIT,
  VIEW_MODES,
  type MapCafe,
  type ViewLimit,
  type ViewMode,
} from "@/lib/cafes";

function App() {
  return (
    <LocationProvider>
      <MapScreen />
      <Toaster
        position="top-center"
        // 상단 헤더 검색창과 같은 자리에 내려오도록: 헤더(top-2 + p-3) = 위에서 20px
        offset={{ top: 20 }}
        mobileOffset={{ top: 20, left: 20, right: 20 }}
        toastOptions={{
          // 글씨는 카페 마커 이름표와 동일 (NanumSquareNeo · 12px · 800)
          // sonner 기본 스타일보다 우선하도록 ! (important)
          classNames: {
            title:
              "font-nanum! text-[13px]! leading-5! font-bold! text-center!",
            description: "font-nanum! text-[13px]! font-bold! text-center!",
            // 아이콘(있으면)과 글씨를 묶어서 가운데로
            content: "items-center!",
          },
          // 카페 마커 이름 알약과 같은 모양: 연두색 배경 + bark 글씨·테두리 + 완전히 둥근 모서리
          // 높이는 검색창과 같은 44px (py-2.5 + 20px 줄 높이 + 테두리 2px×2)
          style: {
            boxShadow: "none",
            background: "var(--leaf)",
            color: "var(--bark)",
            border: "2px solid var(--bark)",
            borderRadius: "999px",
            height: "44px",
            minHeight: "44px",
            padding: "0 18px",
            justifyContent: "center",
            fontFamily: "var(--font-nanum)",
          },
        }}
      />
    </LocationProvider>
  );
}

// 지도 화면. 내 위치(useLocation)로 근처 카페를 정렬해야 해서 LocationProvider 안쪽에 둔다.
function MapScreen() {
  const { location } = useLocation();
  const [cafes, setCafes] = useState<MapCafe[]>([]);
  const [query, setQuery] = useState("");

  // 보기 기준. 처음 팝업에서 고르기 전에는 null (그동안 뒤에는 네이버 평점 순을 보여준다)
  const [mode, setMode] = useState<ViewMode | null>(null);
  const [modeDialogOpen, setModeDialogOpen] = useState(true);
  const activeMode = mode ?? "naver";
  // 지도에 보여줄 카페 수 (상단 오른쪽 버튼: 10 / 20 / 30)
  const [limit, setLimit] = useState<ViewLimit>(VIEW_LIMIT);

  // 선택한 카페. 시트를 닫아도 닫히는 애니메이션 동안 내용이 남도록 cafe와 open을 나눠 둔다.
  const [selectedCafe, setSelectedCafe] = useState<MapCafe | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchCafes(controller.signal)
      .then(setCafes)
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        console.error(e);
        toast("카페 정보를 불러오지 못했어요. 잠시 후 다시 열어 주세요.");
      });
    return () => controller.abort();
  }, []);

  // 검색어로 거른 뒤 기준으로 정렬한 TOP 10. 지도 마커와 화면 범위가 이 목록을 따라간다.
  const visibleCafes = useMemo(
    () => rankCafes(searchCafes(cafes, query), activeMode, location, limit),
    [cafes, query, activeMode, location, limit],
  );

  const getBadge = useCallback(
    (cafe: MapCafe) => getMarkerBadge(cafe, activeMode, location),
    [activeMode, location],
  );

  const handleSelectMode = (next: ViewMode) => {
    setMode(next);
    setModeDialogOpen(false);
    toast(VIEW_MODES[next].description(limit));
  };

  const handleModeDialogChange = (open: boolean) => {
    setModeDialogOpen(open);
    // 고르지 않고 닫으면 네이버 평점 순으로 확정
    if (!open && mode === null) setMode("naver");
  };

  const handleSearch = (next: string) => {
    // 가까운 순은 내 위치가 있어야 정렬할 수 있다 (결과가 없는 게 아니라 위치가 없는 경우)
    if (next.trim() && activeMode === "nearby" && !location) {
      toast("내 위치를 켜야 가까운 카페를 찾을 수 있어요.");
      return;
    }
    if (
      next.trim() &&
      rankCafes(searchCafes(cafes, next), activeMode, location, limit).length === 0
    ) {
      toast("검색 결과가 없어요. 다른 이름이나 지역으로 찾아보세요.");
      return;
    }
    setQuery(next);
  };

  const handleSelectCafe = (cafe: MapCafe) => {
    setSelectedCafe(cafe);
    setSheetOpen(true);
  };

  // 전체 카페 보기: 목록 시트에는 전체 카페, 지도는 지금 기준(TOP 10) 그대로 (44곳을 다 그리면 버벅여서)
  const [listOpen, setListOpen] = useState(false);
  const [focusTarget, setFocusTarget] = useState<{
    latitude: number;
    longitude: number;
    key: number;
  } | null>(null);

  const handleShowAll = () => setListOpen(true);

  // 목록에서 카페를 누르면 목록을 닫고, 지도를 그 카페로 옮긴 뒤 카페 시트를 연다.
  // (두 시트가 겹치지 않도록 목록이 닫히는 애니메이션 뒤에 연다)
  const handleSelectFromList = (cafe: MapCafe) => {
    setListOpen(false);
    setFocusTarget({ ...cafe.location, key: Date.now() });
    window.setTimeout(() => handleSelectCafe(cafe), 250);
  };

  return (
    <>
      <main className="relative h-dvh w-full">
        <MapHeader onSearch={handleSearch}>
          <LimitButton
            limit={limit}
            onChange={(next) => {
              setLimit(next);
              toast(VIEW_MODES[activeMode].description(next));
            }}
          />
        </MapHeader>
        <NaverMap
          cafes={visibleCafes}
          onSelectCafe={handleSelectCafe}
          getBadge={getBadge}
          includeInBounds={activeMode === "nearby" ? location : null}
          focusTarget={focusTarget}
          pinnedCafe={sheetOpen ? selectedCafe : null}
        />
        <LocationButton onShowAll={handleShowAll} />
        <MenuButton />
        <ViewModeButton
          mode={activeMode}
          limit={limit}
          onClick={() => setModeDialogOpen(true)}
        />
      </main>
      <DialogViewMode
        open={modeDialogOpen}
        onOpenChange={handleModeDialogChange}
        current={mode}
        limit={limit}
        onSelect={handleSelectMode}
      />
      <CafeListSheet
        cafes={cafes}
        open={listOpen}
        onOpenChange={setListOpen}
        selectedSlug={sheetOpen ? selectedCafe?.slug : null}
        onSelectCafe={handleSelectFromList}
      />
      <CafeSheet
        cafe={selectedCafe}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}

export default App;
