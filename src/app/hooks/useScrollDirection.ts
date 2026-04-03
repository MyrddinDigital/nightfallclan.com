import { useState, useEffect, useRef } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<
    "up" | "down" | null
  >(null);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const lastUserIntentAt = useRef(Number.NEGATIVE_INFINITY);

  useEffect(() => {
    const USER_SCROLL_WINDOW_MS = 220;
    const SCROLL_THRESHOLD = 10;

    function markUserIntent() {
      lastUserIntentAt.current = performance.now();
    }

    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key;
      const isScrollKey =
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "PageUp" ||
        key === "PageDown" ||
        key === "Home" ||
        key === "End" ||
        key === " ";

      if (!isScrollKey) return;

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (!isTypingTarget) {
        markUserIntent();
      }
    }

    function handleScroll() {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 60);

      if (currentScrollY <= 0) {
        lastScrollY.current = 0;
        setScrollDirection(null);
        return;
      }

      if (Math.abs(currentScrollY - lastScrollY.current) < SCROLL_THRESHOLD) {
        return;
      }

      const isUserScroll =
        performance.now() - lastUserIntentAt.current < USER_SCROLL_WINDOW_MS;

      if (isUserScroll) {
        if (currentScrollY > lastScrollY.current) {
          setScrollDirection("down");
        } else if (currentScrollY < lastScrollY.current) {
          setScrollDirection("up");
        }
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("wheel", markUserIntent, { passive: true });
    window.addEventListener("touchstart", markUserIntent, { passive: true });
    window.addEventListener("touchmove", markUserIntent, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", markUserIntent);
      window.removeEventListener("touchstart", markUserIntent);
      window.removeEventListener("touchmove", markUserIntent);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { scrollDirection, scrolled };
}
