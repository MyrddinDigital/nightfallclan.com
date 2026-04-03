"use client";

import { createContext, useContext, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type SearchContextType = {
  inputValue: string;
  setInputValue: (value: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const SearchContext = createContext<SearchContextType>({
  inputValue: "",
  setInputValue: () => {},
  loading: true,
  setLoading: () => {},
});

function SearchProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("search") ?? "");
  const [loading, setLoading] = useState(true);

  return (
    <SearchContext.Provider value={{ inputValue, setInputValue, loading, setLoading }}>
      {children}
    </SearchContext.Provider>
  );
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <SearchProviderInner>{children}</SearchProviderInner>
    </Suspense>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
