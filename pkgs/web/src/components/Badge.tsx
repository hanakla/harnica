import { memo } from "react";
import { twx } from "@/utils/tw";

type Props = {
  $kind?: "primary" | "default";
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>;

export const Badge = memo(function Badge({
  $kind = "default",
  className,
  children,
  ...props
}: Props) {
  return (
    <span
      className={twx(
        "inline-block min-w[16px] p-[2px_4px] text-[14px] text-center rounded-[4px]",
        $kind === "primary" && "bg-[#359b94] text-white",
        $kind === "default" && "bg-neutral-200 bg-opacity-60 text-[#333]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
});
