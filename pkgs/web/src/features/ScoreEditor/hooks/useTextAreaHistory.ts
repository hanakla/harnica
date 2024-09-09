import { useChangedEffect } from "@hanakla/arma";
import { useEffect, useInsertionEffect, useRef, useState } from "react";
import useEvent from "react-use-event-hook";

interface HistoryState {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export function useContentEditableHistory(
  latestValue: string,
  {
    onChange: onChangeCallback,
  }: {
    onChange: (value: string) => void;
  },
) {
  const [value, setValue] = useBufferedState(latestValue);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const nextApplyState = useRef<HistoryState | null>(null);

  const onChange = useEvent(
    (
      newValue: string,
      selectionRange?: {
        start: number;
        end: number;
      } | null,
    ) => {
      const selection = window.getSelection();
      const range = selection!.rangeCount > 0 ? selection!.getRangeAt(0) : null;
      if (!selection || !range) return;

      const preSelectionRange = range.cloneRange();
      const contentEditable = selection.anchorNode?.parentElement;

      if (contentEditable) {
        preSelectionRange.selectNodeContents(contentEditable);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + range.toString().length;

        selectionRange ??= { start, end };

        setValue(newValue);
        saveState(newValue, start, end);
      }
    },
  );

  const saveState = useEvent(
    (value: string, selectionStart: number, selectionEnd: number) => {
      setHistory((prevHistory) => {
        const newHistory = prevHistory.slice(0, currentIndex + 1);
        newHistory.push({ value, selectionStart, selectionEnd });
        return newHistory;
      });
      setCurrentIndex((prevIndex) => prevIndex + 1);
    },
  );

  const undo = useEvent(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      restoreState(history[currentIndex - 1]);
    }
  });

  const redo = useEvent(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      restoreState(history[currentIndex + 1]);
    }
  });

  const restoreState = useEvent((state: HistoryState) => {
    setValue(state.value);
    nextApplyState.current = state;
    onChangeCallback(state.value);
  });

  useEffect(() => {
    if (!nextApplyState.current) return;

    const state = nextApplyState.current;
    nextApplyState.current = null;

    const selection = window.getSelection();

    // TODO: Fix error on undo
    try {
      if (selection) {
        const range = document.createRange();
        const contentEditable = selection.anchorNode?.parentElement;
        if (contentEditable) {
          range.setStart(contentEditable.childNodes[0], state.selectionStart);
          range.setEnd(contentEditable.childNodes[0], state.selectionEnd);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  return { value, onChange, undo, redo };
}

function useBufferedState<T>(value: T) {
  const [state, setState] = useState(value);

  useChangedEffect(() => {
    setState(value);

    return () => {};
  }, [value]);

  return [state, setState] as const;
}
