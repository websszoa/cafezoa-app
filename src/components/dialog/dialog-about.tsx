import { Coffee, MessageCircleQuestion, Sparkles, Star, Store } from "lucide-react";

import {
  BrandDialogContent,
  BrandDialogHeader,
  BrandNoticeList,
  type BrandNotice,
} from "@/components/dialog/brand-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogFooter } from "@/components/ui/dialog";

const aboutNotices: BrandNotice[] = [
  {
    icon: Sparkles,
    title: "대형카페 · 감성카페 위주로 소개해요",
    text: "드라이브 가기 좋은 대형카페와 분위기 좋은 감성카페를 중심으로 하나씩 직접 정리해 추가하고 있어요.",
  },
  {
    icon: Star,
    title: "평점과 거리로 골라 보세요",
    text: "네이버·구글 평점이 높은 순, 내 위치에서 가까운 순으로 가볼 만한 카페를 지도에서 바로 찾을 수 있어요.",
  },
  {
    icon: Store,
    title: "카페 등록 문의를 기다려요",
    text: "소개하고 싶은 카페가 있거나 우리 카페를 등록하고 싶은 사장님이라면 언제든 편하게 알려 주세요.",
  },
];

// 카페조아 소개 팝업. "등록 문의하기"를 누르면 문의 팝업으로 넘어간다.
export function DialogAbout({
  open,
  onOpenChange,
  onContact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 등록 문의하기 */
  onContact: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BrandDialogContent>
        <BrandDialogHeader
          icon={Coffee}
          title="카페조아를 소개해요"
          description={
            <>
              가보고 싶은 카페를 지도에서 쉽게 찾을 수 있도록
              <br />
              평점과 위치로 카페를 모아 보여드려요.
            </>
          }
        />

        <BrandNoticeList items={aboutNotices} />

        <DialogFooter className="mx-0 mb-0 grid grid-cols-2 gap-2 rounded-none border-0 bg-transparent p-0">
          <DialogClose asChild>
            <Button variant="seed" className="w-full bg-white text-bark hover:bg-cream">
              닫기
            </Button>
          </DialogClose>
          <Button
            variant="seed"
            onClick={onContact}
            className="w-full bg-autumn text-white hover:bg-autumn-dark"
          >
            <MessageCircleQuestion className="size-4" />
            등록 문의하기
          </Button>
        </DialogFooter>
      </BrandDialogContent>
    </Dialog>
  );
}
