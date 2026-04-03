import { useState, useEffect, useRef } from "react";
import { parseSearchInput, type SearchState, type DateFilter } from "@/app/utils/parseSearch";

export type { SearchState, DateFilter };

export function useSearchParser(inputValue: string): SearchState {
  const [searchState, setSearchState] = useState<SearchState>({
    query: "",
    queryUser: "",
    dateFilter: null,
  });
  const prevInputRef = useRef(inputValue);

  useEffect(() => {
    const isUserInput = document.activeElement?.tagName === "INPUT";
    const delay = isUserInput ? 300 : 0;

    const timeout = setTimeout(() => {
      setSearchState(parseSearchInput(inputValue));
    }, delay);

    prevInputRef.current = inputValue;
    return () => clearTimeout(timeout);
  }, [inputValue]);

  return searchState;
}
