import * as RxSlider from "@radix-ui/react-slider";
import { twx } from "@/utils/tw";

export function Slider({ className, ...props }: RxSlider.SliderProps) {
  return (
    <span className="relative flex w-full p-[0_8px]">
      <RxSlider.Root
        className={twx(
          "relative flex items-center w-full flex-none ",
          className,
        )}
        {...props}
      >
        <RxSlider.Track className="relative bg-slate-500 bg-opacity-30 rounded-full w-full h-[3px]">
          <RxSlider.Range className="absolute bg-lime-500 rounded-full h-full" />
        </RxSlider.Track>
        <RxSlider.Thumb className="block w-[12px] h-[12px] bg-white shadow rounded-full" />
      </RxSlider.Root>
    </span>
  );
}
