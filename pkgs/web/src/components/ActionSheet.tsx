import { css } from "@emotion/react";
import {
  createContext,
  DetailedHTMLProps,
  forwardRef,
  HTMLAttributes,
  memo,
  MouseEvent,
  ReactNode,
  useEffect,
} from "react";
import { RiCloseFill } from "react-icons/ri";
import useEvent from "react-use-event-hook";
import { FocusTrap } from "@/components/FocusTrap";
import { twx } from "@/utils/tw";
import { Button } from "./Button";
import { Portal } from "./Portal";

type Props = {
  opened?: boolean;
  enabled?: boolean;
  backdrop?: boolean;
  className?: string;
  heading?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const ActionSheet = memo(
  forwardRef<HTMLDivElement, Props>(function ActionSheet(
    { opened, enabled, backdrop, children, className, onClose, ...props },
    ref,
  ) {
    const handleClickBackdrop = useEvent((e: MouseEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
    });

    const handleClickClose = useEvent(() => {
      console.log("hi");
      onClose?.();
    });

    useEffect(() => {
      if (!opened) return;

      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") onClose?.();
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [opened]);

    if (!enabled) return children;

    return (
      <FocusTrap paused={!opened}>
        <Portal>
          <div {...props}>
            <div
              // backdrop
              className={twx(
                "fixed top-0 left-0 w-dvw h-dvh z-1 isolate",
                backdrop && "bg-slate-500 bg-opacity-60",
                (!opened || !enabled) && "pinter-events-none",
              )}
              style={{
                // ...backdropStyle,
                pointerEvents: enabled && opened && backdrop ? "all" : "none",
              }}
              onClick={handleClickBackdrop}
            >
              <div
                ref={ref}
                className={twx(
                  "absolute left-0 bottom-0 w-dvw min-h-[50dvh] bg-neutral-50 shadow-lg transition-transform transform-gpu overflow-auto",
                  "pointer-events-auto",
                  className,
                  enabled && opened ? "translate-y-0" : "translate-y-full",
                )}
              >
                <div className="absolute top-[8px] right-[8px]">
                  <div className="sticky top-0  z-10">
                    <Button
                      css={css`
                        right: 8px;
                        display: flex;
                        margin-left: auto;
                        align-items: center;
                        justify-content: center;
                        padding: 4px;
                        border-radius: 32px;
                      `}
                      onClick={handleClickClose}
                    >
                      <RiCloseFill
                        size={24}
                        css={css`
                          opacity: 0.4;
                          fill: var(--gray-12);
                        `}
                      />
                    </Button>
                  </div>
                </div>

                <div
                  css={css`
                    flex: 1;
                  `}
                  tabIndex={-1}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </FocusTrap>
    );
  }),
);
