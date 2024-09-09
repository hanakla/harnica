import * as RxTooltip from "@radix-ui/react-tooltip";

type Props = RxTooltip.TooltipProps & {
  content?: React.ReactNode;
  side?: RxTooltip.TooltipContentProps["side"];
};

export function Tooltip({ children, content, side, ...props }: Props) {
  return (
    <RxTooltip.Provider delayDuration={100}>
      <RxTooltip.Root {...props}>
        <RxTooltip.Trigger>{children}</RxTooltip.Trigger>

        <RxTooltip.Portal>
          <RxTooltip.Content
            className="p-[2px_4px] rounded-[4px] text-[14px] text-white bg-neutral-800 bg-opacity-95"
            sideOffset={-6}
            side={side}
          >
            <RxTooltip.Arrow className="fill-neutral-800 opacity-95" />
            {content}
          </RxTooltip.Content>
        </RxTooltip.Portal>
      </RxTooltip.Root>
    </RxTooltip.Provider>
  );
}
