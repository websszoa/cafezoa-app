import { Copy, Mail, MessageCircleQuestion, PencilLine, Store, Handshake } from "lucide-react";
import { toast } from "sonner";

import {
  BrandDialogContent,
  BrandDialogHeader,
  BrandNoticeList,
  type BrandNotice,
} from "@/components/dialog/brand-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";

const CONTACT_EMAIL = "helpzoa@naver.com";
const MAIL_TO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("[카페조아] 문의드립니다")}`;

const contactNotices: BrandNotice[] = [
  {
    icon: Store,
    title: "카페 등록 문의",
    text: "소개하고 싶은 카페의 이름과 위치를 알려 주세요. 사장님이 직접 등록을 요청하셔도 좋아요.",
  },
  {
    icon: PencilLine,
    title: "정보 수정 요청",
    text: "영업시간이 바뀌었거나 사진·정보가 잘못되었다면 카페 이름과 함께 알려 주세요. 빠르게 고칠게요.",
  },
  {
    icon: Handshake,
    title: "제휴 · 기타 문의",
    text: "제휴 제안이나 서비스 이용 중 불편했던 점, 바라는 기능도 모두 환영해요.",
  },
];

// 문의하기 팝업. 메일 앱으로 바로 보내거나 이메일 주소를 복사할 수 있다.
export function DialogContact({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      toast.success("이메일 주소를 복사했어요.");
    } catch {
      toast(`${CONTACT_EMAIL} 로 메일을 보내 주세요.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BrandDialogContent>
        <BrandDialogHeader
          icon={MessageCircleQuestion}
          title="무엇이든 물어보세요"
          description="궁금한 점이나 제안이 있다면 아래 메일로 편하게 보내 주세요. 확인하는 대로 답장드릴게요."
        />

        {/* 문의 메일 주소 */}
        <a
          href={MAIL_TO}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-bark bg-white px-4 py-3 text-base font-extrabold text-bark transition-colors hover:bg-leaf"
        >
          <Mail className="size-5 text-autumn" />
          {CONTACT_EMAIL}
        </a>

        <BrandNoticeList items={contactNotices} />

        <DialogFooter className="mx-0 mb-0 grid grid-cols-2 gap-2 rounded-none border-0 bg-transparent p-0">
          <Button variant="seed" onClick={copyEmail} className="w-full bg-white text-bark hover:bg-cream">
            <Copy className="size-4" />
            이메일 복사
          </Button>
          <Button asChild variant="seed" className="w-full bg-autumn text-white hover:bg-autumn-dark">
            <a href={MAIL_TO}>
              <Mail className="size-4" />
              메일 보내기
            </a>
          </Button>
        </DialogFooter>
      </BrandDialogContent>
    </Dialog>
  );
}
