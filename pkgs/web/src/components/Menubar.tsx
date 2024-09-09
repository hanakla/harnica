import { css } from "@emotion/react";
import * as RxMenubar from "@radix-ui/react-menubar";
import { RiArrowRightSLine } from "react-icons/ri";
import { twx } from "@/utils/tw";

function MenubarRoot({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <RxMenubar.Root
      className={twx(
        "flex bg-neutral-50 p-[3px] rounded-[3px] select-none shadow-md",
        className,
      )}
    >
      {children}
    </RxMenubar.Root>
  );
}

function Separator() {
  return (
    <RxMenubar.Separator className="w-full h-[1px] m-[4px] bg-neutral-200" />
  );
}

function Menu({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <RxMenubar.Menu>
      <RxMenubar.Trigger
        className="
        p-[2px_12px] flex justify-center items-center
        font-medium text-[14px]

        data-[highlighted]:bg-neutral-200
        data-[state='open']:bg-neutral-200
      "
      >
        {label}
      </RxMenubar.Trigger>

      <RxMenubar.Portal>
        <RxMenubar.Content
          css={css`
            min-width: 220px;
            box-shadow:
              0px 10px 38px -10px rgba(22, 23, 24, 0.35),
              0px 10px 20px -15px rgba(22, 23, 24, 0.2);
            animation-duration: 400ms;
            animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform, opacity;
          `}
          className="
            text-[14px] p-[5px]
            bg-neutral-50 select-none shadow-md rounded-[6px]
          "
        >
          {children}
        </RxMenubar.Content>
      </RxMenubar.Portal>
    </RxMenubar.Menu>
  );
}

function Item(props: RxMenubar.MenuItemProps) {
  return (
    <RxMenubar.Item
      {...props}
      className={twx(
        `
          p-[4px_8px]
          text-[14px]
          cursor-pointer
          flex items-center
          transition-colors duration-200
          outline-none
          hover:bg-neutral-200
          data-[highlighted]:bg-neutral-200
        `,
        props.className,
      )}
    />
  );
}

function SubMenu({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <RxMenubar.Sub>
      <RxMenubar.SubTrigger
        className="
        p-[4px_8px] flex items-center
        text-[14px]
        data-[highlighted]:bg-neutral-200
        data-[state='open']:bg-neutral-200
      "
      >
        {label}
        <RiArrowRightSLine className="ml-auto" />
      </RxMenubar.SubTrigger>

      <RxMenubar.Portal>
        <RxMenubar.SubContent
          className="
            text-[14px] p-[5px]
            bg-neutral-50 select-none shadow-md rounded-[6px]
          "
          alignOffset={-5}
        >
          {children}
        </RxMenubar.SubContent>
      </RxMenubar.Portal>
    </RxMenubar.Sub>
  );
}

export const Menubar = {
  Root: MenubarRoot,
  Menu,
  Item,
  Separator,
  SubMenu,
};
