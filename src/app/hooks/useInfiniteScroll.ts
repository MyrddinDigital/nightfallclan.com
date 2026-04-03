import { useEffect, useRef } from "react";

export function useInfiniteScroll(
  direction: "top" | "bottom",
  enabled: boolean,
  onIntersect: () => void
) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onIntersect();
      }
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return sentinelRef;
}
