import {
  Loader2,
  LocateFixed,
  Navigation,
  Ruler,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LocationStatus } from "@/lib/location-context";

// cafezoa.com components/dialog/dialog-location.tsx 와 같은 디자인.
// 안내 문구는 앱에 있는 기능에 맞게 줄였다.
const locationNotices = [
  {
    icon: Ruler,
    title: "카페까지 거리 표시",
    text: "내 위치부터 카페까지의 거리를 km로 확인할 수 있어요.",
  },
  {
    icon: Navigation,
    title: "지도에 내 위치 표시",
    text: "지도에 내 위치가 함께 표시돼서 주변 카페를 한눈에 볼 수 있어요.",
  },
  {
    icon: ShieldCheck,
    title: "위치 정보 보호",
    text: "위치는 이 기기에만 저장되며 서버로 보내거나 다른 사람에게 공개하지 않아요. 앱 저장소를 지우면 함께 삭제돼요.",
  },
];

const statusMessages = {
  denied:
    "위치 권한이 꺼져 있어요. 설정에서 위치 권한을 허용한 뒤 다시 눌러 주세요.",
  error: "위치를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
};

// 내 위치 사용 안내 팝업. "사용하기"를 누르면 위치 권한을 요청한다.
export function DialogLocation({
  open,
  onOpenChange,
  status,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: LocationStatus;
  onConfirm: () => void;
}) {
  const isLoading = status === "loading";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 sm:max-w-md sm:p-7">
        <DialogHeader className="items-center gap-2">
          <span className="grid size-12 place-items-center rounded-full border-2 border-bark bg-leaf">
            <LocateFixed className="size-6" />
          </span>
          <DialogTitle className="font-paperlogy mt-2 text-2xl font-semibold">
            내 위치로 카페 찾기
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#795f55]">
            내 위치를 켜면 가까운 카페를 쉽게 찾을 수 있어요.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 border-t border-b border-dashed border-[#ceb5a0] py-6">
          {locationNotices.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-autumn"
              />
              <p className="text-[14px] leading-5 text-[#795f55]">
                <span className="block pb-1 text-[15px] font-bold text-bark">
                  {title}
                </span>
                <span className="block leading-5.5">{text}</span>
              </p>
            </li>
          ))}
        </ul>

        {(status === "denied" || status === "error") && (
          <p role="alert" className="text-sm leading-6 font-bold text-autumn">
            {statusMessages[status]}
          </p>
        )}

        {/* 사이트와 같게: shadcn 기본 footer의 배경·테두리·음수 여백 제거 */}
        <DialogFooter className="mx-0 mb-0 grid grid-cols-2 gap-2 rounded-none border-0 bg-transparent p-0">
          <DialogClose asChild>
            <Button
              variant="seed"
              size="icon-lg"
              className="w-full bg-white text-bark hover:bg-cream"
            >
              다음에 할게요
            </Button>
          </DialogClose>
          <Button
            variant="seed"
            size="icon-lg"
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full bg-autumn text-white hover:bg-autumn-dark"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LocateFixed className="size-4" />
            )}
            {isLoading ? "위치 확인 중" : "사용하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
