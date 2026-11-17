import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { getImageUrl, type CafePhoto } from "@/lib/cafes";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

// 카페 사진 슬라이드: 손가락으로 넘기는 큰 사진 + 번호(3 / 16) + 사진 설명 + 아래 썸네일 줄.
export function CafePhotoSlider({
  name,
  photos,
}: {
  name: string;
  photos: CafePhoto[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // 슬라이드가 바뀌면 현재 번호를 맞춘다.
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect).on("reInit", onSelect);
    return () => {
      api.off("select", onSelect).off("reInit", onSelect);
    };
  }, [api]);

  // 현재 썸네일이 보이도록 썸네일 줄을 스크롤한다.
  useEffect(() => {
    const thumb = thumbsRef.current?.children[current] as
      | HTMLElement
      | undefined;
    thumb?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [current]);

  if (photos.length === 0) {
    return (
      <div className="grid aspect-4/3 place-items-center rounded-3xl border-2 border-bark bg-white text-[#9c8578]">
        <div className="flex flex-col items-center gap-2 text-sm font-bold">
          <ImageOff className="size-6" />
          사진 준비 중이에요
        </div>
      </div>
    );
  }

  const photo = photos[current];

  return (
    // data-vaul-no-drag: 사진을 옆으로 넘길 때 바텀시트가 같이 끌리지 않게 한다.
    <div data-vaul-no-drag>
      <Carousel
        setApi={setApi}
        opts={{ loop: photos.length > 1 }}
        className="group/slider"
      >
        <div className="overflow-hidden rounded-3xl border-2 border-bark bg-bark">
          <CarouselContent className="ml-0">
            {photos.map((item, index) => (
              <CarouselItem key={item.src} className="pl-0">
                <img
                  src={getImageUrl(item.src)}
                  alt={
                    item.alt
                      ? `${name} ${item.alt}`
                      : `${name} 사진 ${index + 1}`
                  }
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable={false}
                  className="aspect-4/3 w-full object-cover select-none"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>

        {/* 번호 */}
        <span className="pointer-events-none absolute top-3 right-3 rounded-full border-2 border-bark bg-white px-2.5 py-0.5 text-xs font-extrabold text-bark">
          <span className="text-autumn">{current + 1}</span> / {photos.length}
        </span>

        {/* 사진 설명 (마우스를 올렸을 때만) */}
        {photo?.alt && (
          <p className="pointer-events-none absolute inset-x-0 bottom-0 truncate rounded-b-3xl bg-linear-to-t from-black/60 to-transparent px-4 pt-8 pb-3 text-sm font-bold text-white opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100">
            {photo.alt}
          </p>
        )}

        {/* 이전·다음 (마우스를 올렸을 때만. 키보드로 이동하면 보인다) */}
        {photos.length > 1 && (
          <>
            <SlideButton
              side="left"
              label="이전 사진"
              onClick={() => api?.scrollPrev()}
            />
            <SlideButton
              side="right"
              label="다음 사진"
              onClick={() => api?.scrollNext()}
            />
          </>
        )}
      </Carousel>

      {/* 썸네일 */}
      {photos.length > 1 && (
        <div
          ref={thumbsRef}
          className="mt-3 flex gap-2 overflow-x-auto px-0.5 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((item, index) => (
            <button
              key={item.src}
              type="button"
              aria-label={`${index + 1}번째 사진 보기`}
              aria-current={index === current}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "size-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                index === current
                  ? "border-autumn"
                  : "border-transparent opacity-60",
              )}
            >
              <img
                src={getImageUrl(item.src)}
                alt=""
                loading="lazy"
                draggable={false}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SlideButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border-2 border-bark bg-white/90 text-bark opacity-0 transition-[opacity,background-color] duration-200 group-hover/slider:opacity-100 hover:bg-leaf focus-visible:opacity-100",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
