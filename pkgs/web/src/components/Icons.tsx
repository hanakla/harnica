import { ComponentProps, forwardRef, memo } from "react";
import { IconBase } from "react-icons";

export const RiCornerRightUp = memo<ComponentProps<typeof IconBase>>(
  function RiCornerRightUp(props) {
    return (
      <IconBase {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M13.9999 19.0003L5.00003 19.0004L5 17.0004L11.9999 17.0003L12 6.82845L8.05027 10.7782L6.63606 9.36396L13 3L19.364 9.36396L17.9498 10.7782L14 6.8284L13.9999 19.0003Z"></path>
        </svg>
      </IconBase>
    );
  },
);
