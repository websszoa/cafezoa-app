import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { CafePhotoSlider } from "@/components/cafe/cafe-photo-slider";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/lib/location-context";
import {
  AtSign,
  Baby,
  BookOpenCheck,
  Building2,
  Car,
  Cigarette,
  Clock3,
  Coffee,
  Eye,
  MapPin,
  Navigation,
  PawPrint,
  Phone,
  Rows3,
  Sparkles,
  Star,
  Toilet,
  Users,
} from "lucide-react";
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

const WEEKDAYS = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

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
      {/* [&>div:first-child]: shadcn drawer 상단 손잡이 → bark색 */}
      <DrawerContent className="mx-auto max-w-120 [&>div:first-child]:bg-bark rounded-t-3xl border-0 bg-cream text-bark data-[vaul-drawer-direction=bottom]:max-h-[88dvh] data-[vaul-drawer-direction=bottom]:border-t-0 data-[vaul-drawer-direction=bottom]:rounded-t-3xl">
        {cafe && <CafeSheetBody cafe={cafe} />}
      </DrawerContent>
    </Drawer>
  );
}

function CafeSheetBody({ cafe }: { cafe: MapCafe }) {
  const { location } = useLocation();
  const detail = cafe.detail;
  const photos = getCafePhotos(cafe);
  const phone = detail?.media?.phone;
  const instagram = detail?.media?.instagram;
  const website = detail?.media?.website;
  const hours = detail?.business?.hours ?? {};
  const closedDays = detail?.business?.closed_days;
  const prices = Object.entries(detail?.price ?? {});
  const today = WEEKDAYS[new Date().getDay()];

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
      <CafePhotoSlider key={cafe.slug} name={cafe.name} photos={photos} />

      {/* 기본 정보 */}
      <div className="mt-6">
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
        <DrawerDescription className="mt-3 text-sm leading-6 text-[#795f55]">
          {cafe.description || cafe.summary}
        </DrawerDescription>
      </div>

      {/* 평점 */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <RatingBox label="네이버" rating={cafe.ratings.naver} />
        <RatingBox label="Google" rating={cafe.ratings.google} />
      </div>

      {/* 바로가기 */}
      <div
        className={cn("mt-4 grid gap-2", phone ? "grid-cols-3" : "grid-cols-2")}
      >
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
        {phone && (
          <LinkButton
            href={`tel:${phone}`}
            external={false}
            className="bg-white text-bark hover:bg-leaf"
          >
            <Phone className="size-4" />
            전화
          </LinkButton>
        )}
      </div>

      {detail ? (
        <section className="mt-8">
          <SectionHeading eyebrow="Information">
            방문 전에 알아두면 좋아요!
          </SectionHeading>

          <div className="mt-4 space-y-3">
            <InfoCard icon={<Clock3 />} title="영업시간">
              {Object.keys(hours).length === 0 ? (
                <p>정보 없음</p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(hours).map(([day, time]) => (
                    <div
                      key={day}
                      className={cn(
                        "flex justify-between gap-4",
                        day === today && "font-bold text-autumn",
                      )}
                    >
                      <span>
                        {day}
                        {day === today && (
                          <span className="ml-1.5 rounded-full bg-autumn px-1.5 py-px text-[10px] text-white">
                            오늘
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "font-bold",
                          day !== today && "text-bark",
                        )}
                      >
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {closedDays && (
                <p className="mt-3 border-t border-[#ead9ca] pt-3 font-bold text-autumn">
                  {closedDays === "연중무휴"
                    ? closedDays
                    : `휴무 · ${closedDays}`}
                </p>
              )}
            </InfoCard>

            <InfoCard icon={<Coffee />} title="메뉴·서비스">
              <TagList items={detail.services} />
              {prices.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-[#ead9ca] pt-3">
                  <p className="font-bold text-bark">대표 가격</p>
                  {prices.map(([menu, price]) => (
                    <div key={menu} className="flex justify-between gap-4">
                      <span>{menu}</span>
                      <span className="font-bold text-bark">
                        {price === null
                          ? "가격 정보 없음"
                          : `${price.toLocaleString()}원`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>

            <InfoCard
              icon={<Sparkles />}
              title="공간 특징"
              items={detail.features}
            />
            <InfoCard
              icon={<Users />}
              title="추천 목적"
              items={detail.purpose}
            />

            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                compact
                icon={<Building2 />}
                title="층"
                items={detail.floors}
              />
              <InfoCard
                compact
                icon={<Rows3 />}
                title="좌석"
                items={detail.seating}
              />
              <InfoCard
                compact
                icon={<Car />}
                title="주차"
                items={detail.parking}
              />
              <InfoCard
                compact
                icon={<Eye />}
                title="전망"
                items={detail.view}
              />
              <InfoCard
                compact
                icon={<Baby />}
                title="아이 동반"
                items={detail.children}
              />
              <InfoCard
                compact
                icon={<BookOpenCheck />}
                title="스터디"
                items={detail.study}
              />
              <InfoCard
                compact
                icon={<PawPrint />}
                title="반려동물"
                items={detail.pet}
              />
              <InfoCard
                compact
                icon={<Cigarette />}
                title="흡연"
                items={detail.smoking}
              />
              <InfoCard
                compact
                icon={<Toilet />}
                title="화장실"
                items={detail.restroom}
              />
              <InfoCard compact icon={<AtSign />} title="SNS·웹사이트">
                {instagram || website ? (
                  <div className="flex flex-wrap gap-1">
                    {instagram && (
                      <a
                        href={`https://www.instagram.com/${instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="max-w-full truncate rounded-full bg-cream px-2 py-0.5 text-xs leading-5 font-bold hover:text-autumn"
                      >
                        @{instagram}
                      </a>
                    )}
                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noreferrer"
                        className="max-w-full truncate rounded-full bg-cream px-2 py-0.5 text-xs leading-5 font-bold hover:text-autumn"
                      >
                        공식 웹사이트
                      </a>
                    )}
                  </div>
                ) : (
                  <p>정보 없음</p>
                )}
              </InfoCard>
            </div>
          </div>
        </section>
      ) : (
        <p className="mt-8 rounded-2xl border-2 border-dashed border-[#ceb5a0] p-5 text-center text-sm font-bold text-[#9c8578]">
          자세한 카페 정보를 준비하고 있어요.
        </p>
      )}

      <p className="mt-8 text-center text-xs leading-5 text-[#9c8578]">
        영업시간·가격 등은 바뀔 수 있어요. 방문 전에 한 번 더 확인해 주세요.
      </p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-extrabold tracking-[0.18em] text-autumn uppercase">
        {eyebrow}
      </p>
      <h2 className="font-paperlogy mt-1 text-xl font-semibold">{children}</h2>
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
            리뷰 {rating.count.toLocaleString()} · {rating.month} 기준
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
      className={cn("w-full px-2 text-[13px]", className)}
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

function InfoCard({
  icon,
  title,
  items,
  compact = false,
  children,
}: {
  icon: ReactNode;
  title: string;
  items?: string[];
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border-2 border-bark bg-white",
        compact ? "p-3.5" : "p-4",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-leaf",
            compact ? "size-7 [&_svg]:size-3.5" : "size-8 [&_svg]:size-4",
          )}
        >
          {icon}
        </span>
        <h3
          className={cn(
            "font-paperlogy font-semibold",
            compact ? "text-sm" : "text-base",
          )}
        >
          {title}
        </h3>
      </div>
      <div
        className={cn(
          "text-[#795f55]",
          compact ? "mt-2.5 text-xs leading-5" : "mt-3 text-sm leading-6",
        )}
      >
        {children ?? <TagList items={items} />}
      </div>
    </article>
  );
}

// 모든 카드의 뱃지를 같은 크기(text-xs)로 맞춘다.
function TagList({ items }: { items?: string[] }) {
  if (!items?.length) return <p>정보 없음</p>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-cream px-2 py-0.5 text-xs leading-5 font-bold"
        >
          {item}
        </span>
      ))}
    </div>
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
