import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import useEvent from "react-use-event-hook";
import { useContentEditableHistory } from "@/features/ScoreEditor/hooks/useTextAreaHistory";
import { rescue } from "@/utils/rescue";
import { twx } from "@/utils/tw";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onCaretPositionChange?: (position: number) => void;
  decorate: RichTextEditor.Decorator;
  className?: string;
  onContextMenu?: (e: React.MouseEvent<HTMLElement>) => void;
};

type EditorSelection = { start: number; end: number };

export namespace RichTextEditor {
  export type Handler = {
    updateValue: (value: string, selection?: EditorSelection) => void;
    getSelection: () => EditorSelection | null;
    setSelection: (selection: EditorSelection) => void;
  };

  export type Decorator = (text: string) => React.ReactNode;
}

export const RichTextEditor = memo(
  forwardRef<RichTextEditor.Handler, Props>(function RichTextEditor(
    {
      value,
      onChange,
      onCaretPositionChange,
      onContextMenu,
      decorate,
      className,
    }: Props,
    ref,
  ) {
    const history = useContentEditableHistory(value, {
      onChange: (value) => {
        onChange(value);
      },
    });

    const editorRef = useRefWithLog<HTMLDivElement | null>(null);
    const hasFocusRef = useRef<boolean>(false);

    const [selectionState, setSelectionState] =
      useState<EditorSelection | null>({ start: 0, end: 0 });
    const [scrollState, setScrollState] = useState<number | null>(null);
    const isInInputRef = useRef(false);

    useImperativeHandle(
      ref,
      () => ({
        updateValue: (value: string, selection?: EditorSelection) => {
          if (selection) {
            setSelectionState(selection);
            onCaretPositionChange?.(selection.end);
          }
          onChange(value);
        },
        getSelection: () => {
          return selectionState;
        },
        setSelection: (selection: EditorSelection) => {
          setTimeout(() => {
            setSelectionState(selection);
            onCaretPositionChange?.(selection.end);
          });
        },
      }),
      [selectionState, onChange, onCaretPositionChange, history],
    );

    const getCaretPos = useEvent(
      (element: HTMLDivElement | null = editorRef.current) => {
        const rangeResult = rescue(() => window.getSelection()?.getRangeAt(0));
        if (!rangeResult.ok || !rangeResult.result || !element) return 0;

        const range = rangeResult.result;

        const prefix = range.cloneRange();
        prefix.selectNodeContents(element);
        prefix.setEnd(range.endContainer, range.endOffset);

        return prefix.toString().length;
      },
    );

    const getSelection = useEvent(
      (element: HTMLDivElement | null = editorRef.current) => {
        const rangeResult = rescue(() => window.getSelection()?.getRangeAt(0));
        if (!rangeResult.ok || !rangeResult.result || !element) return null;

        const range = rangeResult.result;
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(element);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);

        const start = Array.from(
          preSelectionRange.cloneContents().childNodes,
        ).reduce((sum, node) => sum + (node.textContent?.length || 0), 0);

        const selectedContent = range.cloneContents();
        const end = Array.from(selectedContent.childNodes).reduce(
          (sum, node) => sum + (node.textContent?.length || 0),
          start,
        );

        return { start, end };
      },
    );

    const handleInput = useEvent(
      (e: React.SyntheticEvent<HTMLDivElement, globalThis.InputEvent>) => {
        isInInputRef.current = true;

        try {
          if (!e.nativeEvent.isComposing && editorRef.current) {
            const newValue = (editorRef.current.innerText ?? "").replace(
              /* nbsp */ /\u00A0/g,
              " ",
            );

            Promise.resolve().then(() => {
              const sel = getSelection()!;
              const isInsert = e.nativeEvent.inputType === "insertParagraph";

              sel.start += isInsert ? 1 : 0;
              sel.end += isInsert ? 1 : 0;

              setSelectionState(sel);
            });

            onChange(newValue);
          }
        } finally {
          isInInputRef.current = false;
        }
      },
    );

    const handleKeyDown = useEvent((e: React.KeyboardEvent) => {
      if (e.nativeEvent.isComposing) return;

      if (e.key === "Enter") {
        e.preventDefault();

        const sel = getSelection()!;
        const value = (editorRef.current!.innerText ?? "").replace(
          /* nbsp */ /\u00A0/g,
          " ",
        );

        const newValue =
          value.slice(0, sel.start) + "\n" + value.slice(sel.end);

        onChange(newValue);
        Promise.resolve().then(() => {
          setSelectionState({ start: sel.start + 1, end: sel.start + 1 });
        });
        return;
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        history.undo();
        return;
      }

      if (
        (e.metaKey && e.shiftKey && e.key === "z") ||
        (e.ctrlKey && e.key === "y")
      ) {
        e.preventDefault();
        history.redo();
        return;
      }
    });

    const handleFocus = useEvent(() => {
      hasFocusRef.current = true;
    });

    const handleBlur = useEvent(() => {
      hasFocusRef.current = false;
    });

    const handleScroll = useEvent(() => {
      setScrollState(editorRef.current!.scrollTop);
    });

    useIsomorphicLayoutEffect(() => {
      if (hasFocusRef.current) editorRef.current!.focus();

      editorRef.current!.scrollTop = scrollState || 0;

      const ref = editorRef.current;
      if (!ref) return;

      // Sync cursor position from before rendererd element
      if (ref && selectionState && ref.contains(document.activeElement)) {
        const range = document.createRange();
        const startNode = getNodeAndOffsetAt(ref, selectionState.start);
        const endNode = getNodeAndOffsetAt(ref, selectionState.end);

        if (startNode && endNode) {
          range.setStart(startNode.node, startNode.offset);
          range.setEnd(endNode.node, endNode.offset);

          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }

      // Use .addEventListener instead of React event handler for avoid select event callback loop
      const abort = new AbortController();

      const handleSelect = () => {
        const pos = getCaretPos(ref);
        onCaretPositionChange?.(pos);

        const selection = getSelection(ref);
        // console.log(selection);
        setSelectionState(selection);
      };

      ref.addEventListener("keydown", handleSelect, { signal: abort.signal });
      ref.addEventListener("keyup", handleSelect, { signal: abort.signal });
      ref.addEventListener("pointerup", handleSelect, { signal: abort.signal });
      ref.addEventListener("pointerdown", handleSelect, {
        signal: abort.signal,
      });
      ref.addEventListener("focusin", handleSelect, { signal: abort.signal });
      ref.addEventListener("blur", handleSelect, { signal: abort.signal });

      return () => {
        abort.abort();
      };
    });

    useEffect(() => {
      if (value === history.value) return;
      history.onChange(value, selectionState);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
      <>
        <div
          ref={editorRef}
          key={history.value}
          className={twx(
            "whitespace-pre-wrap bg-neutral-50 outline-none overflow-auto",
            className,
          )}
          contentEditable
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          suppressContentEditableWarning
          spellCheck={false}
          onContextMenu={onContextMenu}
        >
          {decorate(history.value)}
        </div>
      </>
    );
  }),
);

function getNodeAndOffsetAt(
  node: Node,
  offset: number,
): { node: Node; offset: number } | null {
  let currentNode: Node | null = node;
  let currentOffset = offset;

  const stack = [currentNode];
  while (stack.length > 0) {
    currentNode = stack.pop()!;

    if (currentNode.nodeType === Node.TEXT_NODE) {
      const textLength = currentNode.textContent?.length || 0;
      if (currentOffset <= textLength) {
        return { node: currentNode, offset: currentOffset };
      }
      currentOffset -= textLength;
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const childNodes = Array.from(currentNode.childNodes);
      for (let i = childNodes.length - 1; i >= 0; i--) {
        stack.push(childNodes[i]);
      }
    }
  }

  return null;
}

function useRefWithLog<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);

  return useMemo(
    () => ({
      get current() {
        return ref.current;
      },
      set current(value) {
        // console.log("ref set", value);
        ref.current = value;
      },
    }),
    [],
  );
}
