import useEvent from "react-use-event-hook";

export function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const handleClick = useEvent((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.isDefaultPrevented()) return;
    if (e.target === e.currentTarget) onClose?.();
  });

  return (
    <div
      className="
      fixed top-0 left-0 w-dvw h-dvh bg-black bg-opacity-60
      flex overflow-auto
    "
      onClick={handleClick}
      tabIndex={-1}
    >
      <div className="m-auto">{children}</div>
    </div>
  );
}
