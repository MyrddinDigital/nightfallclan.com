"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearch } from "@context/SearchContext";
import { useSearchParser } from "@hooks/useSearchParser";
import { useScrollDirection } from "@hooks/useScrollDirection";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import PostCard from "@ui/PostCard";
import postStyles from "@ui/PostCard/PostCard.module.scss";
import { sanitizePosts, type Post } from "@/app/utils/sanitize";
import styles from "./WallView.module.scss";

const POSTS_PER_LOAD = 20;
const POSTS_PER_SKIP_SMALL = 100;
const POSTS_PER_SKIP_LARGE = 1000;
const SKELETON_COUNT = 15;

type WallViewProps = {
  onLatestDateShownChange?: (timestamp: number) => void;
};

type ApiResponse = {
  posts: Post[];
  total: number;
  offset: number;
  contextIndex?: number;
};

function SkipArrowIcon({
  direction,
  hasSecondChevron,
}: {
  direction: "up" | "down";
  hasSecondChevron: boolean;
}) {
  const isUp = direction === "up";
  const stemPath = hasSecondChevron
    ? isUp
      ? "M10 17V9"
      : "M10 3V11"
    : isUp
      ? "M10 15V8"
      : "M10 5V12";
  const firstChevronPath = hasSecondChevron
    ? isUp
      ? "M6 11L10 7L14 11"
      : "M6 9L10 13L14 9"
    : isUp
      ? "M6 9L10 5L14 9"
      : "M6 11L10 15L14 11";

  return (
    <svg
      className={styles.jumpIcon}
      width="18"
      height="18"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={stemPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={firstChevronPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {hasSecondChevron && (
        <path
          d={isUp ? "M6 7L10 3L14 7" : "M6 13L10 17L14 13"}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

function buildFetchUrl(params: {
  query: string;
  queryUser: string;
  dateFilter: { start?: number; end?: number } | null;
  offset: number;
  limit: number;
}): string {
  const url = new URL("/api/posts", window.location.origin);
  if (params.queryUser) url.searchParams.set("from", params.queryUser);
  if (params.dateFilter?.start != null) url.searchParams.set("after", String(params.dateFilter.start));
  if (params.dateFilter?.end != null) url.searchParams.set("before", String(params.dateFilter.end));
  if (params.query) url.searchParams.set("q", params.query);
  url.searchParams.set("offset", String(params.offset));
  url.searchParams.set("limit", String(params.limit));
  return url.toString();
}

export default function WallView({ onLatestDateShownChange }: WallViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { inputValue, setInputValue, loading, setLoading } = useSearch();
  const mainRef = useRef<HTMLElement | null>(null);
  const [jumpButtonGroupLeft, setJumpButtonGroupLeft] = useState<number | null>(null);

  // API-driven state
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [highlightedPostId, setHighlightedPostId] = useState(0);
  const latestDateShownRef = useRef<number | null>(null);
  const fetchControllerRef = useRef<AbortController | null>(null);
  const initialLoadDoneRef = useRef(false);

  const { scrollDirection } = useScrollDirection();
  const { query, queryUser, dateFilter } = useSearchParser(inputValue);

  // Track previous search state for detecting changes
  const prevSearchRef = useRef({ query: "", queryUser: "", dateFilter: null as typeof dateFilter });
  const skipPaginationResetRef = useRef(false);

  // Core fetch function
  const fetchPosts = useCallback(
    async (fetchOffset: number, fetchLimit: number, append?: "top" | "bottom") => {
      fetchControllerRef.current?.abort();
      const controller = new AbortController();
      fetchControllerRef.current = controller;

      const url = buildFetchUrl({
        query,
        queryUser,
        dateFilter,
        offset: fetchOffset,
        limit: fetchLimit,
      });

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data: ApiResponse = await res.json();

        if (append === "top") {
          setPosts((prev) => [...data.posts, ...prev]);
        } else if (append === "bottom") {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setTotal(data.total);
        setOffset(append === "top" ? fetchOffset : append === "bottom" ? offset : fetchOffset);
        setLoading(false);
        initialLoadDoneRef.current = true;
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setLoading(false);
      }
    },
    [query, queryUser, dateFilter, offset, setLoading]
  );

  // Initial fetch and re-fetch when search changes
  useEffect(() => {
    const prev = prevSearchRef.current;
    const searchChanged =
      prev.query !== query ||
      prev.queryUser !== queryUser ||
      JSON.stringify(prev.dateFilter) !== JSON.stringify(dateFilter);

    prevSearchRef.current = { query, queryUser, dateFilter };

    if (!initialLoadDoneRef.current || searchChanged) {
      if (skipPaginationResetRef.current) {
        skipPaginationResetRef.current = false;
        return;
      }

      setOffset(0);
      setPosts([]);
      setLoading(true);

      if (searchChanged && (query || queryUser || dateFilter)) {
        window.scrollTo(0, 0);
      }

      fetchPosts(0, POSTS_PER_LOAD);
    }
  }, [query, queryUser, dateFilter, fetchPosts, setLoading]);

  // Control body overflow during loading
  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  // Sync URL with search
  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (inputValue !== currentSearch) {
      const url = inputValue ? `/wall?search=${encodeURIComponent(inputValue)}` : "/wall";
      router.replace(url, { scroll: false });
    }
  }, [inputValue, router, searchParams]);

  const currentPagePosts = useMemo(
    () => sanitizePosts(posts),
    [posts]
  );

  const showJumpToOldest = offset > 0;
  const showJumpToNewest = offset + posts.length < total;
  const hasFilter = !!(queryUser || query || dateFilter);

  // Scroll position preservation ref for prepending
  const scrollHeightBeforePrepend = useRef<number | null>(null);

  const handleLoadTop = useCallback(() => {
    if (offset <= 0) return;
    scrollHeightBeforePrepend.current = document.documentElement.scrollHeight;
    const newOffset = Math.max(0, offset - POSTS_PER_LOAD);
    const fetchCount = offset - newOffset;
    setOffset(newOffset);
    fetchPosts(newOffset, fetchCount, "top");
  }, [offset, fetchPosts]);

  // Preserve scroll position after prepending
  useLayoutEffect(() => {
    if (scrollHeightBeforePrepend.current !== null) {
      const oldHeight = scrollHeightBeforePrepend.current;
      const newHeight = document.documentElement.scrollHeight;
      window.scrollTo(0, document.documentElement.scrollTop + (newHeight - oldHeight));
      scrollHeightBeforePrepend.current = null;
    }
  }, [posts]);

  const handleLoadBottom = useCallback(() => {
    if (offset + posts.length >= total) return;
    const newOffset = offset + posts.length;
    fetchPosts(newOffset, POSTS_PER_LOAD, "bottom");
  }, [offset, posts.length, total, fetchPosts]);

  const topSentinelRef = useInfiniteScroll(
    "top",
    offset > 0,
    handleLoadTop
  );
  const bottomSentinelRef = useInfiniteScroll(
    "bottom",
    offset + posts.length < total,
    handleLoadBottom
  );

  useEffect(() => {
    if (!onLatestDateShownChange || loading || currentPagePosts.length === 0) return;

    let rafId: number | null = null;

    const updateLatestDateShown = () => {
      const viewportBottom = window.innerHeight;
      let selectedCreated: string | null = null;
      let topMostAtOrAboveBottom = -Infinity;
      let firstBelowBottom: { top: number; created: string } | null = null;

      for (const post of currentPagePosts) {
        const element = document.getElementById(`post-${post.id}`);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const intersectsViewportBottom =
          rect.top <= viewportBottom && rect.bottom >= viewportBottom;

        if (intersectsViewportBottom) {
          selectedCreated = post.created;
          break;
        }

        if (rect.top <= viewportBottom && rect.top > topMostAtOrAboveBottom) {
          topMostAtOrAboveBottom = rect.top;
          selectedCreated = post.created;
        } else if (
          rect.top > viewportBottom &&
          (!firstBelowBottom || rect.top < firstBelowBottom.top)
        ) {
          firstBelowBottom = { top: rect.top, created: post.created };
        }
      }

      if (!selectedCreated && firstBelowBottom) {
        selectedCreated = firstBelowBottom.created;
      }

      if (!selectedCreated) return;

      const timestamp = Date.parse(selectedCreated);
      if (Number.isNaN(timestamp) || latestDateShownRef.current === timestamp) return;

      latestDateShownRef.current = timestamp;
      onLatestDateShownChange(timestamp);
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateLatestDateShown();
      });
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [currentPagePosts, loading, onLatestDateShownChange]);

  useLayoutEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const updateJumpButtonGroupLeft = () => {
      const rect = mainElement.getBoundingClientRect();
      const nextLeft = rect.left + rect.width / 2;
      setJumpButtonGroupLeft((current) => {
        if (current !== null && Math.abs(current - nextLeft) < 0.5) {
          return current;
        }
        return nextLeft;
      });
    };

    updateJumpButtonGroupLeft();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateJumpButtonGroupLeft);
      resizeObserver.observe(mainElement);
    }

    window.addEventListener("resize", updateJumpButtonGroupLeft);
    return () => {
      window.removeEventListener("resize", updateJumpButtonGroupLeft);
      resizeObserver?.disconnect();
    };
  }, []);

  function jumpToOldest() {
    setOffset(0);
    setPosts([]);
    setLoading(true);
    fetchPosts(0, POSTS_PER_LOAD);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  function jumpToNewest() {
    const newOffset = Math.max(0, total - POSTS_PER_LOAD);
    setOffset(newOffset);
    setPosts([]);
    setLoading(true);
    fetchPosts(newOffset, POSTS_PER_LOAD);
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }

  function skipPosts(skipAmount: number) {
    if (skipAmount === 0 || total === 0) return;

    const currentWindowSize = Math.max(POSTS_PER_LOAD, posts.length);

    if (skipAmount < 0) {
      if (offset <= 0) return;
      const newOffset = Math.max(0, offset + skipAmount);
      setOffset(newOffset);
      setPosts([]);
      setLoading(true);
      fetchPosts(newOffset, Math.min(currentWindowSize, total - newOffset));
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
      return;
    }

    if (offset + posts.length >= total) return;
    const newOffset = Math.min(total - 1, offset + skipAmount);
    const fetchLimit = Math.min(currentWindowSize, total - newOffset);
    setOffset(newOffset);
    setPosts([]);
    setLoading(true);
    fetchPosts(newOffset, fetchLimit);
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }

  function searchUser(username: string) {
    setOffset(0);
    setPosts([]);
    setLoading(true);

    const fromUserRegex = /\s*from:\s*(\S+)\s*/i;
    const fromUserString = `from:${username}`;

    if (inputValue.match(fromUserRegex)) {
      setInputValue(
        inputValue.replace(fromUserRegex, ` ${fromUserString} `).trim()
      );
    } else {
      setInputValue(`${inputValue} ${fromUserString}`.trim());
    }

    window.scrollTo(0, 0);
  }

  function gotoContext(id: number) {
    skipPaginationResetRef.current = true;
    setInputValue("");
    setPosts([]);
    setLoading(true);

    fetch(`/api/posts?context=${id}&window=10`)
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setPosts(data.posts);
        setTotal(data.total);
        setOffset(data.offset);
        setLoading(false);
        setHighlightedPostId(id);

        setTimeout(() => {
          const maxAttempts = 20;
          let attempt = 0;
          const interval = setInterval(() => {
            const element = document.getElementById(`post-${id}`);
            if (element) {
              clearInterval(interval);
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              setTimeout(() => {
                setHighlightedPostId((current) => (current === id ? 0 : current));
              }, 2000);
            } else if (++attempt >= maxAttempts) {
              clearInterval(interval);
            }
          }, 100);
        }, 50);
      });
  }

  return (
    <div>
      <main ref={mainRef} className={styles.main}>
        {showJumpToOldest && !loading && (
          <div
            className={`${styles.jumpButtonGroup} ${styles["jumpButtonGroup--top"]} ${scrollDirection === "down" ? styles.hidden : ""}`}
            style={jumpButtonGroupLeft === null ? undefined : { left: jumpButtonGroupLeft }}
          >
            <button
              className={`${styles.jumpButton} ${styles["jumpButton--icon"]}`}
              onClick={() => skipPosts(-POSTS_PER_SKIP_LARGE)}
              aria-label="Skip back 1000 posts"
              title="Skip back 1000 posts"
            >
              <SkipArrowIcon direction="up" hasSecondChevron />
            </button>
            <button
              className={`${styles.jumpButton} ${styles["jumpButton--icon"]}`}
              onClick={() => skipPosts(-POSTS_PER_SKIP_SMALL)}
              aria-label="Skip back 100 posts"
              title="Skip back 100 posts"
            >
              <SkipArrowIcon direction="up" hasSecondChevron={false} />
            </button>
            <button className={styles.jumpButton} onClick={jumpToOldest}>
              Jump To Oldest
            </button>
          </div>
        )}

        <div className={styles.postCount}>
          {loading || !initialLoadDoneRef.current ? (
            <p>Loading</p>
          ) : total === 0 ? (
            <p>No posts found</p>
          ) : total === 1 ? (
            <p>Showing one single lonely post</p>
          ) : (
            <p>Showing {total.toLocaleString()} posts</p>
          )}
        </div>

        {offset > 0 && (
          <div ref={topSentinelRef} className={styles.sentinel} />
        )}

        {loading || !initialLoadDoneRef.current
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <div key={i} className={`${postStyles.post} ${postStyles["post--skeleton"]}`}>
                <div
                  className={`${postStyles.post__avatar} ${postStyles["post__avatar--loading"]}`}
                />
                <div className={postStyles.post__content}>
                  <div className={postStyles["post__user-date-container"]}>
                    <div
                      className={`${postStyles.skeleton} ${postStyles["skeleton-user"]}`}
                    />
                    <div
                      className={`${postStyles.skeleton} ${postStyles["skeleton-date"]}`}
                    />
                  </div>
                  <div
                    className={`${postStyles.skeleton} ${postStyles["skeleton-body"]}`}
                  />
                </div>
              </div>
            ))
          : currentPagePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                highlighted={post.id === highlightedPostId}
                hasFilter={hasFilter}
                onSearchUser={searchUser}
                onGotoContext={gotoContext}
              />
            ))}

        {offset + posts.length < total && (
          <div ref={bottomSentinelRef} className={styles.sentinel} />
        )}

        {showJumpToNewest && !loading && (
          <div
            className={`${styles.jumpButtonGroup} ${styles["jumpButtonGroup--bottom"]} ${scrollDirection === "up" ? styles.hidden : ""}`}
            style={jumpButtonGroupLeft === null ? undefined : { left: jumpButtonGroupLeft }}
          >
            <button className={styles.jumpButton} onClick={jumpToNewest}>
              Jump To Newest
            </button>
            <button
              className={`${styles.jumpButton} ${styles["jumpButton--icon"]}`}
              onClick={() => skipPosts(POSTS_PER_SKIP_SMALL)}
              aria-label="Skip ahead 100 posts"
              title="Skip ahead 100 posts"
            >
              <SkipArrowIcon direction="down" hasSecondChevron={false} />
            </button>
            <button
              className={`${styles.jumpButton} ${styles["jumpButton--icon"]}`}
              onClick={() => skipPosts(POSTS_PER_SKIP_LARGE)}
              aria-label="Skip ahead 1000 posts"
              title="Skip ahead 1000 posts"
            >
              <SkipArrowIcon direction="down" hasSecondChevron />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
