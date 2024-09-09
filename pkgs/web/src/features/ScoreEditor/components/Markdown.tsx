import { memo } from "react";
import { twx } from "@/utils/tw";

export const Markdown = memo(function Markdown({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={twx(
        `
        text-[14px]
        [&_p]:my-[16px]
        [&_ul]:list-disc
        [&_ul]:ml-[16px]
        [&_li+li]:mt-[4px]
        [&_code]:bg-gray-200
        [&_code]:p-[2px_4px]
        [&_h2]:text-[16px]
        [&_h2]:font-bold
        [&_h2]:m-[16px_0px_8px]
        [&_h3]:font-bold
        [&_h3]:m-[16px_0px_8px]
      `,
        className,
      )}
    >
      {children}
    </div>
  );
});
