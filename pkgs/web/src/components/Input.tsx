import { twx } from "@/utils/tw";

export function Input({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  return (
    <input
      className={twx(
        "p-[4px_8px] outline-none text-black rounded-[4px]",
        className,
      )}
      {...props}
    />
  );
}
