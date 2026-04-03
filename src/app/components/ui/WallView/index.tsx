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
import { sanitizePosts, type Post, type SanitizedPost } from "@/app/utils/sanitize";
import styles from "./WallView.module.scss";

const POSTS_PER_LOAD = 20;
const POSTS_PER_SKIP_SMALL = 100;
const POSTS_PER_SKIP_LARGE = 1000;
const SKELETON_COUNT = 15;

type WallViewProps = {
  onLatestDateShownChange?: (timestamp: number) => void;
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

export default function WallView({ onLatestDateShownChange }: WallViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { inputValue, setInputValue, loading, setLoading } = useSearch();
  const mainRef = useRef<HTMLElement | null>(null);
  const [jumpButtonGroupLeft, setJumpButtonGroupLeft] = useState<number | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(POSTS_PER_LOAD);
  const [highlightedPostId, setHighlightedPostId] = useState(0);
  const latestDateShownRef = useRef<number | null>(null);

  const { scrollDirection } = useScrollDirection();
  const { query, queryUser, dateFilter } = useSearchParser(inputValue);

  // Track previous search state for detecting changes
  const prevSearchRef = useRef({ query: "", queryUser: "", dateFilter: null as typeof dateFilter });
  const skipPaginationResetRef = useRef(false);

  // Fetch posts
  useMemo(() => {
    fetch("/data/NFC.json")
      .then((res) => res.json())
      .then((data: Post[]) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  // Control body overflow during loading
  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (loading || !posts.length) return [];

    let result = posts;

    if (queryUser) {
      result = result.filter((post) =>
        post.poster?.user.username.toLowerCase().includes(queryUser.toLowerCase())
      );
    }

    if (dateFilter) {
      result = result.filter((post) => {
        const ts = new Date(post.created).getTime();
        if (isNaN(ts)) return false;
        if (dateFilter.start != null && ts < dateFilter.start) return false;
        if (dateFilter.end != null && ts >= dateFilter.end) return false;
        return true;
      });
    }

    if (query) {
      result = result.filter((post) =>
        post.body.toLowerCase().includes(query.toLowerCase())
      );
    }

    return result;
  }, [posts, query, queryUser, dateFilter, loading]);

  // Reset pagination when filters change
  useEffect(() => {
    const prev = prevSearchRef.current;
    if (
      prev.query !== query ||
      prev.queryUser !== queryUser ||
      JSON.stringify(prev.dateFilter) !== JSON.stringify(dateFilter)
    ) {
      if (skipPaginationResetRef.current) {
        skipPaginationResetRef.current = false;
      } else {
        setVisibleStartIndex(0);
        setVisibleEndIndex(POSTS_PER_LOAD);
        if (query || queryUser || dateFilter) {
          window.scrollTo(0, 0);
        }
      }
    }
    prevSearchRef.current = { query, queryUser, dateFilter };
  }, [query, queryUser, dateFilter]);

  // Sync URL with search
  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (inputValue !== currentSearch) {
      const url = inputValue ? `/wall?search=${encodeURIComponent(inputValue)}` : "/wall";
      router.replace(url, { scroll: false });
    }
  }, [inputValue, router, searchParams]);

  const currentPagePosts = useMemo(
    () => sanitizePosts(filteredPosts.slice(visibleStartIndex, visibleEndIndex)),
    [filteredPosts, visibleStartIndex, visibleEndIndex]
  );

  const showJumpToOldest = visibleStartIndex > 0;
  const showJumpToNewest = visibleEndIndex < filteredPosts.length;
  const hasFilter = !!(queryUser || query || dateFilter);

  // Scroll position preservation ref for prepending
  const scrollHeightBeforePrepend = useRef<number | null>(null);

  const handleLoadTop = useCallback(() => {
    if (visibleStartIndex <= 0) return;
    scrollHeightBeforePrepend.current = document.documentElement.scrollHeight;
    setVisibleStartIndex((prev) => Math.max(0, prev - POSTS_PER_LOAD));
  }, [visibleStartIndex]);

  // Preserve scroll position after prepending
  useLayoutEffect(() => {
    if (scrollHeightBeforePrepend.current !== null) {
      const oldHeight = scrollHeightBeforePrepend.current;
      const newHeight = document.documentElement.scrollHeight;
      window.scrollTo(0, document.documentElement.scrollTop + (newHeight - oldHeight));
      scrollHeightBeforePrepend.current = null;
    }
  }, [visibleStartIndex]);

  const handleLoadBottom = useCallback(() => {
    setVisibleEndIndex((prev) =>
      Math.min(filteredPosts.length, prev + POSTS_PER_LOAD)
    );
  }, [filteredPosts.length]);

  const topSentinelRef = useInfiniteScroll(
    "top",
    visibleStartIndex > 0,
    handleLoadTop
  );
  const bottomSentinelRef = useInfiniteScroll(
    "bottom",
    visibleEndIndex < filteredPosts.length,
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
    setVisibleStartIndex(0);
    setVisibleEndIndex(POSTS_PER_LOAD);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  function jumpToNewest() {
    setVisibleStartIndex(Math.max(0, filteredPosts.length - POSTS_PER_LOAD));
    setVisibleEndIndex(filteredPosts.length);
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }

  function skipPosts(offset: number) {
    if (offset === 0 || filteredPosts.length === 0) return;

    const currentWindowSize = Math.max(POSTS_PER_LOAD, visibleEndIndex - visibleStartIndex);

    if (offset < 0) {
      if (visibleStartIndex <= 0) return;
      const nextStart = Math.max(0, visibleStartIndex + offset);
      const nextEnd = Math.min(filteredPosts.length, nextStart + currentWindowSize);
      setVisibleStartIndex(nextStart);
      setVisibleEndIndex(nextEnd);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
      return;
    }

    if (visibleEndIndex >= filteredPosts.length) return;
    const nextEnd = Math.min(filteredPosts.length, visibleEndIndex + offset);
    const nextStart = Math.max(0, nextEnd - currentWindowSize);
    setVisibleStartIndex(nextStart);
    setVisibleEndIndex(nextEnd);
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }

  function searchUser(username: string) {
    setVisibleStartIndex(0);
    setVisibleEndIndex(POSTS_PER_LOAD);
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
    setTimeout(() => setLoading(false), 100);
  }

  function gotoContext(id: number) {
    const postIndex = posts.findIndex((post) => post.id === id);
    if (postIndex === -1) return;

    const windowSize = 10;
    skipPaginationResetRef.current = true;
    setInputValue("");
    setVisibleStartIndex(Math.max(0, postIndex - windowSize));
    setVisibleEndIndex(Math.min(posts.length, postIndex + windowSize + 1));
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
          {loading || posts.length === 0 ? (
            <p>Loading</p>
          ) : filteredPosts.length === 0 ? (
            <p>No posts found</p>
          ) : filteredPosts.length === 1 ? (
            <p>Showing one single lonely post</p>
          ) : (
            <p>Showing {filteredPosts.length.toLocaleString()} posts</p>
          )}
        </div>

        {visibleStartIndex > 0 && (
          <div ref={topSentinelRef} className={styles.sentinel} />
        )}

        {loading || posts.length === 0
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

        {visibleEndIndex < filteredPosts.length && (
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
