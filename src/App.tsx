import { useEffect, useMemo, useState } from "react";

import { toast, Toaster } from "sonner";

import { CafeSheet } from "@/components/cafe/cafe-sheet";
import { MapHeader } from "@/components/map-header";
import { LocationButton } from "@/components/location/location-button";
import { LocationProvider } from "@/components/location/location-provider";
import { NaverMap } from "@/components/naver-map";
import { fetchCafes, searchCafes, type MapCafe } from "@/lib/cafes";

function App() {
  const [cafes, setCafes] = useState<MapCafe[]>([]);
  const [query, setQuery] = useState("");
  // 선택한 카페. 시트를 닫아도 닫히는 애니메이션 동안 내용이 남도록 cafe와 open을 나눠 둔다.
  const [selectedCafe, setSelectedCafe] = useState<MapCafe | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSelectCafe = (cafe: MapCafe) => {
    setSelectedCafe(cafe);
    setSheetOpen(true);
  };
  // 검색어로 거른 카페. 지도 마커와 화면 범위가 이 목록을 따라간다.
  const visibleCafes = useMemo(() => searchCafes(cafes, query), [cafes, query]);

  const handleSearch = (next: string) => {
    if (next.trim() && searchCafes(cafes, next).length === 0) {
      toast("검색 결과가 없어요. 다른 이름이나 지역으로 찾아보세요.");
      return;
    }
    setQuery(next);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCafes(controller.signal)
      // 네이버 평점이 있는 카페만 지도에 표시
      .then((all) => setCafes(all.filter((cafe) => cafe.naverRating !== null)))
      .catch((e: Error) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => controller.abort();
  }, []);

  return (
    <LocationProvider>
      <main className="relative h-dvh w-full">
        <MapHeader onSearch={handleSearch} />
        <NaverMap cafes={visibleCafes} onSelectCafe={handleSelectCafe} />
        <LocationButton />
      </main>
      <CafeSheet cafe={selectedCafe} open={sheetOpen} onOpenChange={setSheetOpen} />
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            title: "font-anyvid",
            description: "font-anyvid",
          },
          style: { boxShadow: "none" },
        }}
      />
    </LocationProvider>
  );
}

export default App;
