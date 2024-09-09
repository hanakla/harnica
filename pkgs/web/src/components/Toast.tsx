import { css, keyframes } from "@emotion/react";
import * as RxToast from "@radix-ui/react-toast";
import { create } from "zustand";
import { Portal } from "./Portal";

type ToastEntry = {
  id: number;
  title: string;
  message?: string;
  durationMs?: number;
};
type ToastStore = {
  toasts: ToastEntry[];
  showToast: (arg: Omit<ToastEntry, "id">) => void;
  deleteToast: (id: number) => void;
};

let toastId = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  showToast: (arg) => {
    set((state) => ({
      toasts: [...state.toasts, { ...arg, id: toastId++ }],
    }));
  },
  deleteToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export function Toast() {
  const toasts = useToastStore();

  return (
    <RxToast.Provider swipeDirection="right">
      {toasts.toasts.map((toast) => (
        <RxToast.Root
          key={toast.id}
          css={css`
            &[data-state="open"] {
              animation: ${animSlideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1);
            }
            &[data-state="closed"] {
              animation: ${animHide} 100ms ease-in;
            }

            &[data-swipe="move"] {
              transform: translateX(var(--radix-toast-swipe-move-x));
            }
            &[data-swipe="cancel"] {
              transform: translateX(0);
              transition: transform 200ms ease-out;
            }
            &[data-swipe="end"] {
              animation: ${animSwipeOut} 100ms ease-out;
            }
          `}
          className="
            flex
            items-center
            min-w-[320px]
            text-[14px]
          bg-neutral-100 p-[16px] shadow-lg rounded-md
          "
          duration={toast.durationMs ?? 3000}
          onOpenChange={(open) => {
            if (!open) toasts.deleteToast(toast.id);
          }}
        >
          <div>
            <RxToast.Title className="font-bold">{toast.title}</RxToast.Title>
            {toast.message && (
              <RxToast.Description
                asChild
                className="mt-[4px] text-neutral-500"
              >
                <div>{toast.message}</div>
              </RxToast.Description>
            )}
          </div>
          <RxToast.Close className="ml-auto text-[16px] text-neutral-400">
            &times;
          </RxToast.Close>
        </RxToast.Root>
      ))}

      <Portal>
        <RxToast.Viewport className="fixed bottom-0 right-0 flex flex-col gap-[16px] p-[32px] z-10" />
      </Portal>
    </RxToast.Provider>
  );
}

const animSlideIn = keyframes`
  from {
    transform: translateX(calc(100% + var(--viewport-padding)));
  }
  to {
    transform: translateX(0);
  }
`;

const animSwipeOut = keyframes`
  from {
    transform: translateX(var(--radix-toast-swipe-end-x));
  }
  to {
    transform: translateX(calc(100% + var(--viewport-padding)));
  }
`;

const animHide = keyframes`
from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
  `;
