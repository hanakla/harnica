import { twx } from "@/utils/tw";
import { ModalBackdrop } from "./ModalBackdrop";

export function ModalRoot({
  children,
  className,
  onClose,
  ...props
}: {
  onClose?: () => void;
} & React.DetailedHTMLProps<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className={twx(
          "bg-white min-w-[320px] rounded-[8px] pointer-events-auto",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ModalBackdrop>
  );
}

function ModalHeader({
  className,
  ...props
}: React.PropsWithChildren<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>) {
  return (
    <div
      className={twx(
        "flex justify-center items-center p-[16px] border-b border-gray-200",
        "font-bold",
        className,
      )}
      {...props}
    />
  );
}

function ModalContent({
  className,
  ...props
}: React.PropsWithChildren<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>) {
  return <div className={twx("p-[16px]", className)} {...props} />;
}

function ModalFooter({
  className,
  ...props
}: React.PropsWithChildren<
  React.DetailedHTMLProps<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    HTMLDivElement
  >
>) {
  return (
    <div
      className={twx(
        "flex justify-end gap-[8px] p-[16px] border-t border-gray-200",
        className,
      )}
      {...props}
    />
  );
}

export const ModalBase = {
  Root: ModalRoot,
  Header: ModalHeader,
  Content: ModalContent,
  Footer: ModalFooter,
};
