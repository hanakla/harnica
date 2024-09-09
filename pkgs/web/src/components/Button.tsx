import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { memo } from "react";
import { twx } from "@/utils/tw";

type Props = {
  $kind?: "primary" | "default" | "none";
  $size?: "sm" | "icon";
  $rounded?: boolean;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const Button = memo(function Button({
  $kind = "default",
  $size,
  $rounded,
  className,
  ...props
}: Props) {
  return (
    <button
      css={css`
        transition-property: border-color, transform, box-shadow;
        transition-duration: 0.2s;
        transition-timing-function: ease-out;
      `}
      className={twx(
        "appearance-none inline-flex items-center justify-center p-[4px_16px] rounded-[4px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        $kind !== "none" &&
          "shadow-[0_0_6px_rgba(0, 0, 0, 0.1)] focus:active:shadow-[inset_0_0_4px_rgba(0, 0, 0, 0.2)]",

        $kind === "default" &&
          "text-[#333] bg-neutral-50 hover:focus:bg-neutral-200 active:bg-neutral-300",
        $kind === "primary" && "text-white bg-[#8ac151] font-bold",
        $kind === "none" && "p-0",
        $size === "sm" && "p-[4px] text-[12px]",
        $size === "icon" && "aspect-[1] p-[4px] text-[12px]",
        $rounded && "rounded-full",
        className,
      )}
      {...props}
    />
  );
});
