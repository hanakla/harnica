import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function Portal({
  containerQuery = null,
  disabled,
  children,
}: {
  containerQuery?: string | null;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (containerQuery) {
      const target = document.querySelector(containerQuery);
      if (!target) return;
      setRoot(target as HTMLElement);
      return;
    }

    const target = document.createElement("div");
    document.body.appendChild(target);
    setRoot(target);

    return () => {
      document.body.removeChild(target);
    };
  }, []);

  return disabled ? children : root ? createPortal(children, root) : null;
}
