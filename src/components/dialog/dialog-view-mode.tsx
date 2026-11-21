import { useRef, useState } from "react";
import { ChevronRight, Coffee, Loader2, LocateFixed, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { VIEW_MODES, type ViewMode } from "@/lib/cafes";
import { useLocation } from "@/lib/location-context";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OPTIONS: { mode: ViewMode; icon: LucideIcon; iconClassName?: string }[] =
  [
    { mode: "nearby", icon: LocateFixed },
    {
      mode: "naver",
      icon: Star,
      iconClassName: "fill-[#44ba5b] text-[#44ba5b]",
    },
    {
      mode: "google",
      icon: Star,
      iconClassName: "fill-[#4285f4] text-[#4285f4]",
    },
  ];

const locationErrors = {
  denied:
    "위치 권한이 꺼져 있어요. 설정에서 위치 권한을 허용한 뒤 다시 눌러 주세요.",
  error: "위치를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
};

// 어떤 카페를 볼지 고르는 팝업. 앱에 처음 들어오면 열리고, 하단 기준 버튼으로 다시 열 수 있다.
// (디자인은 내 위치 안내 팝업 dialog-location 과 같다)
export function DialogViewMode({
  open,
  onOpenChange,
  current,
  limit,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 지금 보고 있는 기준 (처음에는 null) */
  current: ViewMode | null;
  /** 지도에 보여줄 카페 수 (설명 문구에 쓴다) */
  limit: number;
  onSelect: (mode: ViewMode) => void;
}) {
  const { location, status, requestLocation } = useLocation();
  // "내 위치 근처"를 눌러 위치를 받는 중인지 (다른 곳에서 위치를 받는 중일 때와 구분)
  const [waitingLocation, setWaitingLocation] = useState(false);
  // 위치 요청은 비동기라, 받기 전에 팝업을 닫았는지 콜백에서 알 수 있도록 ref로도 들고 있는다.
  const waitingRef = useRef(false);
  const isLoading = waitingLocation && status === "loading";
  const locationError =
    waitingLocation && (status === "denied" || status === "error")
      ? locationErrors[status]
      : null;

  const handleSelect = (mode: ViewMode) => {
    if (mode === "nearby" && !location) {
      // 위치가 없으면 이 자리에서 바로 위치 권한을 요청하고, 받으면 근처 카페를 보여준다.
      setWaitingLocation(true);
      waitingRef.current = true;
      requestLocation(() => {
        // 기다리는 도중 팝업을 닫았거나 다른 기준을 골랐으면 무시
        if (!waitingRef.current) return;
        waitingRef.current = false;
        setWaitingLocation(false);
        onSelect("nearby");
      });
      return;
    }
    waitingRef.current = false;
    setWaitingLocation(false);
    onSelect(mode);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          waitingRef.current = false;
          setWaitingLocation(false);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent
        // 열릴 때 첫 버튼 대신 팝업 자체에 포커스 (포커스 테두리가 바로 보이지 않게, 키보드 이동은 팝업 안에서 시작)
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement | null)?.focus();
        }}
        className="gap-5 rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 outline-none sm:max-w-md sm:p-7"
      >
        <DialogHeader className="items-center gap-2">
          <span className="grid size-12 place-items-center rounded-full border-2 border-bark bg-leaf">
            <Coffee className="size-6" />
          </span>
          <DialogTitle className="font-paperlogy mt-2 text-2xl font-semibold">
            어떤 카페를 볼까요?
          </DialogTitle>
          <DialogDescription className="text-sm sr-only leading-6 text-[#795f55]">
            기준을 고르면 지도에 카페를 보여드려요.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 border-t border-dashed border-[#ceb5a0] pt-5">
          {OPTIONS.map(({ mode, icon: Icon, iconClassName }) => {
            const { label, description } = VIEW_MODES[mode];
            const selected = current === mode;
            const loading = mode === "nearby" && isLoading;
            return (
              <li key={mode}>
                <button
                  type="button"
                  disabled={isLoading}
                  aria-current={selected}
                  onClick={() => handleSelect(mode)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border-2 border-bark p-3.5 text-left transition-[box-shadow,background-color] duration-200 ease-out outline-none focus-visible:ring-3 focus-visible:ring-autumn/50 disabled:opacity-60",
                    selected
                      ? "bg-leaf shadow-none"
                      : "bg-white shadow-[2px_2px_0_var(--color-bark)] hover:bg-cream hover:shadow-none",
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-bark bg-cream">
                    {loading ? (
                      <Loader2 className="size-5 animate-spin text-autumn" />
                    ) : (
                      <Icon
                        className={cn("size-5 text-autumn", iconClassName)}
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold">{label}</span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-[#795f55]">
                      {loading ? "위치를 확인하고 있어요…" : description(limit)}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-[#9c8578]" />
                </button>
              </li>
            );
          })}
        </ul>

        {locationError && (
          <p role="alert" className="text-sm leading-6 font-bold text-autumn">
            {locationError}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
