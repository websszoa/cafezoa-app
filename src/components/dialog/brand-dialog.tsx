import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// 카페조아 팝업 공통 틀 (dialog-location 과 같은 디자인)
// cream 배경 + bark 테두리·그림자 + 가운데 연두 아이콘 + Paperlogy 제목 + 점선 구분 안내 목록

export function BrandDialogContent({ className, ...props }: ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      // 열릴 때 첫 버튼 대신 팝업 자체에 포커스 (포커스 테두리가 바로 보이지 않게)
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        (event.currentTarget as HTMLElement | null)?.focus();
      }}
      className={cn(
        "gap-5 rounded-3xl border-2 border-bark bg-cream p-6 text-bark shadow-[4px_5px_0_var(--color-bark)] ring-0 outline-none sm:max-w-md sm:p-7",
        className,
      )}
      {...props}
    />
  );
}

export function BrandDialogHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <DialogHeader className="items-center gap-2">
      <span className="grid size-12 place-items-center rounded-full border-2 border-bark bg-leaf">
        <Icon className="size-6" />
      </span>
      <DialogTitle className="font-paperlogy mt-2 text-2xl font-semibold">{title}</DialogTitle>
      <DialogDescription className="text-center text-sm leading-6 text-[#795f55]">
        {description}
      </DialogDescription>
    </DialogHeader>
  );
}

export type BrandNotice = { icon: LucideIcon; title: string; text: ReactNode };

export function BrandNoticeList({ items }: { items: BrandNotice[] }) {
  return (
    <ul className="space-y-3 border-t border-b border-dashed border-[#ceb5a0] py-6">
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3">
          <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-autumn" />
          <p className="text-[14px] leading-5 text-[#795f55]">
            <span className="block pb-1 text-[15px] font-bold text-bark">{title}</span>
            <span className="block leading-5.5">{text}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
