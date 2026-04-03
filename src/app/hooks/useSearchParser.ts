import { useState, useEffect, useRef } from "react";

type ParsedDateInput = { start: number; end: number } | { instant: number };

function parseLocalDayRange(
  year: number,
  month: number,
  day: number
): { start: number; end: number } | null {
  const startDate = new Date(year, month - 1, day);
  if (
    startDate.getFullYear() !== year ||
    startDate.getMonth() !== month - 1 ||
    startDate.getDate() !== day
  ) {
    return null;
  }
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  return { start: startDate.getTime(), end: endDate.getTime() };
}

function parseDateInput(dateStr: string): ParsedDateInput | null {
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  const yearMatch = trimmed.match(/^(\d{4})$/);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    return {
      start: new Date(year, 0, 1).getTime(),
      end: new Date(year + 1, 0, 1).getTime(),
    };
  }

  const yearMonthMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})$/);
  if (yearMonthMatch) {
    const year = Number(yearMonthMatch[1]);
    const month = Number(yearMonthMatch[2]);
    if (month < 1 || month > 12) return null;
    return {
      start: new Date(year, month - 1, 1).getTime(),
      end: new Date(year, month, 1).getTime(),
    };
  }

  const isoDateOnlyMatch = trimmed.match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/
  );
  if (isoDateOnlyMatch) {
    return parseLocalDayRange(
      Number(isoDateOnlyMatch[1]),
      Number(isoDateOnlyMatch[2]),
      Number(isoDateOnlyMatch[3])
    );
  }

  const usDateOnlyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usDateOnlyMatch) {
    return parseLocalDayRange(
      Number(usDateOnlyMatch[3]),
      Number(usDateOnlyMatch[1]),
      Number(usDateOnlyMatch[2])
    );
  }

  const parsedDate = new Date(trimmed);
  if (isNaN(parsedDate.getTime())) return null;

  const hasTimeComponent = /[T\s]\d{1,2}:\d{2}/.test(trimmed);
  if (hasTimeComponent) {
    return { instant: parsedDate.getTime() };
  }

  const localDayStart = new Date(parsedDate);
  localDayStart.setHours(0, 0, 0, 0);
  const nextDay = new Date(localDayStart);
  nextDay.setDate(nextDay.getDate() + 1);
  return { start: localDayStart.getTime(), end: nextDay.getTime() };
}

function getDateFilter(
  operator: "before" | "after" | "during",
  dateStr: string
): { start?: number; end?: number } | null {
  const parsed = parseDateInput(dateStr);
  if (!parsed) return null;

  if ("instant" in parsed) {
    if (operator === "before") return { end: parsed.instant };
    if (operator === "after") return { start: parsed.instant };
    if (operator === "during")
      return { start: parsed.instant, end: parsed.instant + 1 };
    return null;
  }

  if (operator === "before") return { end: parsed.start };
  if (operator === "after") return { start: parsed.end };
  if (operator === "during") return { start: parsed.start, end: parsed.end };
  return null;
}

export type DateFilter = { start?: number; end?: number } | null;

export type SearchState = {
  query: string;
  queryUser: string;
  dateFilter: DateFilter;
};

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

    const fromUserRegex = /\s*from:\s*(\S+)\s*/i;
    const beforeDateRegex = /\s*before:\s*(\S+)\s*/i;
    const afterDateRegex = /\s*after:\s*(\S+)\s*/i;
    const duringDateRegex = /\s*during:\s*(\S+)\s*/i;

    let newQuery = inputValue;
    let newQueryUser = "";
    let newDateFilter: { start?: number; end?: number } = {};

    const fromMatch = newQuery.match(fromUserRegex);
    if (fromMatch) {
      newQueryUser = fromMatch[1];
      newQuery = newQuery.replace(fromUserRegex, "").trim();
    }

    const beforeMatch = newQuery.match(beforeDateRegex);
    if (beforeMatch) {
      const filter = getDateFilter("before", beforeMatch[1]);
      if (filter?.end != null) newDateFilter.end = filter.end;
      newQuery = newQuery.replace(beforeDateRegex, "").trim();
    }

    const afterMatch = newQuery.match(afterDateRegex);
    if (afterMatch) {
      const filter = getDateFilter("after", afterMatch[1]);
      if (filter?.start != null) newDateFilter.start = filter.start;
      newQuery = newQuery.replace(afterDateRegex, "").trim();
    }

    const duringMatch = newQuery.match(duringDateRegex);
    if (duringMatch) {
      const filter = getDateFilter("during", duringMatch[1]);
      if (filter) newDateFilter = filter;
      newQuery = newQuery.replace(duringDateRegex, "").trim();
    }

    const finalFilter =
      Object.keys(newDateFilter).length > 0 ? newDateFilter : null;

    const timeout = setTimeout(() => {
      setSearchState({
        query: newQuery,
        queryUser: newQueryUser,
        dateFilter: finalFilter,
      });
    }, delay);

    prevInputRef.current = inputValue;
    return () => clearTimeout(timeout);
  }, [inputValue]);

  return searchState;
}
