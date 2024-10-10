import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams as useNextSearchParams } from "next/navigation";

type SearchParamsSetterValue =
  | URLSearchParams
  | ((prevSearchParams: URLSearchParams) => URLSearchParams);

type SetSearchParams = (newSearchParams: SearchParamsSetterValue) => void;

const useSearchParams = (): [URLSearchParams, SetSearchParams] => {
  const search = useNextSearchParams();

  /**
   * Keep track of whether navigate has been called in the current render cycle
   * to avoid adding extra entries in the history stack.
   */
  const hasNavigatedRef = useRef(false);
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  /**
   * Keep track of the current searchParams value so that updater functions can
   * use the current value rather than value from previous render.
   */
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    hasNavigatedRef.current = false;
    /**
     * Each render, sync the ref with the current state value.
     * This is necessary in case search params has changed via some source other
     * than this hook (e.g., browser navigation).
     */
    searchParamsRef.current = searchParams;
  });

  const setSearchParams: SetSearchParams = useCallback((nextValue) => {
    const newParams =
      typeof nextValue === "function"
        ? nextValue(searchParamsRef.current)
        : nextValue;

    searchParamsRef.current = newParams;

    if (hasNavigatedRef.current) {
      window.history.replaceState({}, "", `?${newParams}`);
    } else {
      window.history.pushState({}, "", `?${newParams}`);
    }

    hasNavigatedRef.current = true;
  }, []);
  return [searchParams, setSearchParams];
};

export default useSearchParams;
