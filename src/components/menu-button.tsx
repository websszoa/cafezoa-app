import { useState } from "react";
import { Info, MessageCircleQuestion, Settings } from "lucide-react";

import { DialogAbout } from "@/components/dialog/dialog-about";
import { DialogContact } from "@/components/dialog/dialog-contact";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS, MENU_SEPARATOR_CLASS } from "@/lib/menu-styles";

// 모바일 화면(지도 영역) 오른쪽 하단의 메뉴 버튼: 소개 / 문의하기 팝업
export function MenuButton() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      {/* modal={false}: 메뉴에서 팝업을 열 때 포커스·클릭 잠금이 꼬이지 않게 */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="seed"
            size="icon"
            aria-label="메뉴 열기"
            className="absolute right-4 bottom-5 z-40 size-10 bg-leaf p-0 text-bark hover:bg-leaf-dark"
          >
            <Settings className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" sideOffset={8} className={MENU_CONTENT_CLASS}>
          <DropdownMenuItem onSelect={() => setAboutOpen(true)} className={MENU_ITEM_CLASS}>
            <Info />
            소개
          </DropdownMenuItem>
          <DropdownMenuSeparator className={MENU_SEPARATOR_CLASS} />
          <DropdownMenuItem onSelect={() => setContactOpen(true)} className={MENU_ITEM_CLASS}>
            <MessageCircleQuestion />
            문의하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogAbout
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        onContact={() => {
          setAboutOpen(false);
          setContactOpen(true);
        }}
      />
      <DialogContact open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
