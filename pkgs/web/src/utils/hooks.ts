import { letDownload, rescue } from "@hanakla/arma";
import { formatRelative, formatDate } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import Mousetrap, * as mousetrap from "mousetrap";
import { useRouter } from "next/router";
import {
  MutableRefObject,
  RefCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import useEvent from "react-use-event-hook";

const useBrowserEffect =
  typeof window !== "undefined" ? useLayoutEffect : () => {};

export const useStableLatestRef = <T>(value: T) => {
  const stableRef = useRef<T>(value);

  useBrowserEffect(() => {
    stableRef.current = value;
  }, [value]);

  return stableRef;
};

export const useMergeRefs = <T>(
  refs: (MutableRefObject<T> | RefCallback<T>)[],
) => {
  let current: T | null = null;

  return {
    get current(): T | null {
      return current;
    },
    set current(value: T | null) {
      current = value;

      refs.forEach((ref) => {
        if (typeof ref === "function") {
          ref(value);
        } else if (ref != null) {
          (ref as React.MutableRefObject<T | null>).current = value;
        }
      });
    },
  };
};

type MousetrapCallback = (
  e: mousetrap.ExtendedKeyboardEvent,
  combo: string,
) => void;

export const useGlobalMousetrap = (
  handlerKey: string | string[],
  handlerCallback: MousetrapCallback,
  evtType = undefined,
  {
    stopCallback,
  }: {
    stopCallback?: (
      e: mousetrap.ExtendedKeyboardEvent,
      element: Element,
      combo: string,
    ) => boolean;
  } = {},
) => {
  const handlerRef = useStableLatestRef(handlerCallback);
  const stopCallbackRef = useStableLatestRef(stopCallback);

  useEffect(() => {
    const trap = new Mousetrap();
    if (stopCallback)
      trap.stopCallback = (...args) => {
        return (
          stopCallbackRef.current?.(...args) ?? mousetrap.stopCallback(...args)
        );
      };
    trap.bind(handlerKey, (...args) => handlerRef.current(...args), evtType);

    return () => {
      trap.unbind(handlerKey);
    };
  }, [handlerKey, evtType, handlerRef, stopCallback]);
};

export const NARROW_MEDIA_WIDTH = 768;

export function useMedia() {
  const [isNarrowMedia, setIsNarrowMedia] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const matcher = window.matchMedia(`(max-width: ${NARROW_MEDIA_WIDTH}px)`);

    matcher.addEventListener("change", (e) => {
      setIsNarrowMedia(e.matches);
    });

    setIsNarrowMedia(matcher.matches);
  });

  return { isNarrowMedia };
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [state, setState] = useState(defaultValue);

  useBrowserEffect(() => {
    try {
      const rawValue = localStorage.getItem(key);
      setState(rawValue ? JSON.parse(rawValue) : defaultValue);
    } catch (e) {
      console.warn(e);
    }
  }, [key]);

  const setValue = useEvent((value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    setState(value);
  });

  return [state, setValue] as const;
}

export const useAbortableEffect = (
  effect: (signal: AbortSignal) => void | (() => void),
  deps: React.DependencyList,
) => {
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const dispose = effect(signal);

    return () => {
      abortController.abort();
      dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export function useSaveFilePicker() {
  const [handleMap, setHandleMap] = useState<
    Record<string, FileSystemFileHandle>
  >(() => Object.create(null));

  const getFileHandleOrShowSaveFilePicker = useEvent(
    async ({
      id,
      accepts,
      blob,
      suggestedName,
      selectRenew,
    }: {
      id?: string;
      selectRenew?: boolean;
      blob?: Blob;
      suggestedName?: string;
      accepts: [mime: string, extWithDot: string[]][];
    }): Promise<FileSystemFileHandle | null> => {
      if (id && !selectRenew && Object.hasOwn(handleMap, id)) {
        return handleMap[id]!;
      }

      if (typeof showSaveFilePicker !== "function") {
        if (!blob) return null;

        const url = URL.createObjectURL(blob);
        letDownload(url, suggestedName);
        URL.revokeObjectURL(url);
      }

      const [handle] = await rescue(() =>
        showSaveFilePicker({
          suggestedName,
          types: [
            {
              accept: Object.fromEntries(accepts) as any,
            },
          ],
        }),
      );

      if (!handle) return null;

      if (id) {
        setHandleMap((prev) => ({ ...prev, [id]: handle }));
      }

      return handle;
    },
  );

  const clearHandles = useEvent(() => {
    setHandleMap({});
  });

  const hasHandle = (id: string) => Object.hasOwn(handleMap, id);

  return {
    available: typeof showSaveFilePicker === "function",
    getFileHandleOrShowSaveFilePicker,
    clearHandles,
    hasHandle,
  };
}

export function useInteractiveAsync<T>(
  asyncFn: (obj: { signal: AbortSignal; revalidate: () => {} }) => Promise<T>,
  deps: React.DependencyList,
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  revalidate: () => void;
} {
  const prevAbortRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: false, error: null });

  const fetchData = useEvent(async () => {
    prevAbortRef.current?.abort();

    // if (loading) return;
    const abort = (prevAbortRef.current = new AbortController());

    setState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const result = await asyncFn({
        signal: abort.signal,
        revalidate: fetchData,
      });

      if (abort.signal.aborted) return;

      setState({ data: result, loading: false, error: null });
    } catch (e) {
      setState({ data: null, loading: false, error: e as Error });
    }
  });

  useEffect(() => {
    fetchData();
  }, deps);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    revalidate: fetchData,
  };
}

export function useDateFormat() {
  const { locale } = useRouter();

  const localeData = locale === "ja" ? ja : enUS;

  return useMemo(
    () => ({
      format: (date: Date | number, format: string) => {
        return formatDate(date, format, { locale: localeData });
      },
      formatRelative: (date: Date | number, baseDate: Date | number) => {
        return formatRelative(date, baseDate, { locale: localeData });
      },
    }),
    [localeData],
  );
}
