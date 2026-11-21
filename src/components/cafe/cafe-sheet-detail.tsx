import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { CafePhotoSlider } from "@/components/cafe/cafe-slider";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/lib/location-context";
import { SHEET_CONTENT_CLASS } from "@/lib/sheet-styles";
import { MapPin, Navigation, Star } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  distanceBetween,
  formatDistance,
  getCafePhotos,
  type LatestRating,
  type MapCafe,
} from "@/lib/cafes";

// 마커를 누르면 아래에서 올라오는 카페 정보 시트. (cafezoa.com 카페 상세 페이지를 모바일 시트에 맞게 줄인 구성)
export function CafeSheet({
  cafe,
  open,
  onOpenChange,
}: {
  cafe: MapCafe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={SHEET_CONTENT_CLASS}>
        {cafe && <CafeSheetBody cafe={cafe} />}
      </DrawerContent>
    </Drawer>
  );
}

function CafeSheetBody({ cafe }: { cafe: MapCafe }) {
  const { location } = useLocation();
  const photos = getCafePhotos(cafe);

  const distance = location
    ? distanceBetween(
        location.latitude,
        location.longitude,
        cafe.location.latitude,
        cafe.location.longitude,
      )
    : null;

  const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(cafe.name)}`;
  const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(cafe.name)},${cafe.location.latitude},${cafe.location.longitude}`;

  return (
    <div className="overflow-y-auto overscroll-contain px-5 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
      {/* 기본 정보 (사진 영역 위쪽) */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5">
          {cafe.type.map((type) => (
            <span
              key={type}
              className="rounded-full border-2 border-bark bg-leaf px-2.5 py-0.5 text-xs font-bold"
            >
              {type}
            </span>
          ))}
        </div>
        <DrawerTitle className="font-paperlogy mt-3 text-[1.75rem] leading-tight font-semibold text-bark">
          {cafe.name}
        </DrawerTitle>
        {/* 주소는 왼쪽, 거리는 오른쪽 (세로 가운데 정렬) */}
        <div className="mt-2 flex items-center justify-between gap-3 text-sm font-bold text-[#5a4031]">
          <p className="flex min-w-0 items-center gap-1.5">
            <MapPin className="size-4 shrink-0 text-autumn" />
            <span>{cafe.location.address}</span>
          </p>
          {distance !== null && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-autumn px-2 py-px text-[11px] text-white">
              <Navigation className="size-3" />
              {formatDistance(distance)}
            </span>
          )}
        </div>
      </div>

      {/* 사진 */}
      <CafePhotoSlider key={cafe.slug} name={cafe.name} photos={photos} />

      {/* 평점 */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <RatingBox label="네이버" rating={cafe.ratings.naver} />
        <RatingBox label="구글" rating={cafe.ratings.google} />
      </div>

      {/* 카페 소개 (흰 박스) */}
      <DrawerDescription className="mt-3 rounded-2xl border-2 border-bark bg-white p-4 text-sm leading-6 text-[#795f55]">
        {cafe.description || cafe.summary}
      </DrawerDescription>

      {/* 바로가기 */}
      <div className="mt-5 grid grid-cols-2 gap-2 mb-10">
        <LinkButton
          href={naverMapUrl}
          className="bg-[#44ba5b] text-white hover:bg-[#3a9e4d]"
        >
          <NaverIcon />
          네이버 지도
        </LinkButton>
        <LinkButton
          href={kakaoMapUrl}
          className="bg-[#fee500] text-bark hover:bg-[#f4dc00]"
        >
          <KakaoIcon />
          카카오 지도
        </LinkButton>
      </div>
    </div>
  );
}

function RatingBox({
  label,
  rating,
}: {
  label: string;
  rating: LatestRating | null;
}) {
  return (
    <div className="rounded-2xl border-2 border-bark bg-white p-4">
      <p className="text-xs font-bold text-[#9c8578]">{label}</p>
      {rating ? (
        <>
          <p className="mt-1 flex items-center gap-1 text-xl font-extrabold">
            <Star className="size-4 fill-autumn text-autumn" />
            {rating.rating.toFixed(2)}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#5a4031]">
            리뷰 {rating.count.toLocaleString()}
            <br />
            {rating.month} 기준
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-[#9c8578]">정보 없음</p>
      )}
    </div>
  );
}

function LinkButton({
  href,
  external = true,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button
      asChild
      variant="seed"
      className={cn("w-full px-2 py-6 text-[15px]", className)}
    >
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
      >
        {children}
      </a>
    </Button>
  );
}

// 네이버·카카오 로고 (cafezoa.com 과 동일한 SVG)
function NaverIcon() {
  return (
    <svg aria-hidden="true" viewBox="-3 -3 30 30" className="size-4">
      <path
        fill="currentColor"
        d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845Z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="currentColor"
        d="M12 3C6.48 3 2 6.5 2 10.82c0 2.76 1.83 5.18 4.59 6.57l-.93 3.42a.38.38 0 0 0 .58.42l4.08-2.7c.55.07 1.11.11 1.68.11 5.52 0 10-3.5 10-7.82S17.52 3 12 3Z"
      />
    </svg>
  );
}
