import { FocusTrap as _FocusTrap, createFocusTrap } from "focus-trap";
import { ReactNode, useEffect, useRef } from "react";

type Props = {
  as?: string;
  className?: string;
  paused?: boolean;
  children: ReactNode;
};

export function FocusTrap({ paused, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const focusTrap = useRef<_FocusTrap | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const trap = (focusTrap.current = createFocusTrap(ref.current!, {
      preventScroll: true,
    }));

    try {
      trap.activate();
      paused ? trap.pause() : trap.unpause();
    } catch (e) {
      focusTrap.current = null;
    }
  }, []);

  useEffect(() => {
    if (!focusTrap.current) return;

    if (paused) focusTrap.current.pause();
    else focusTrap.current.unpause();
  }, [paused]);

  return (
    <div role="none" ref={ref} style={{ display: "contents" }} tabIndex={-1}>
      {children}
    </div>
  );
}
