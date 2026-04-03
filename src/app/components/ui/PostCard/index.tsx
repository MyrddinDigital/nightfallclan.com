"use client";

import { useEffect, useState } from "react";
import { getAvatar } from "@hooks/useAvatarCache";
import styles from "./PostCard.module.scss";

type SanitizedPost = {
  id: number;
  poster: {
    user: {
      userId: number;
      username: string;
      displayName: string;
    };
  };
  body: string;
  created: string;
};

export default function PostCard({
  post,
  highlighted,
  hasFilter,
  onSearchUser,
  onGotoContext,
}: {
  post: SanitizedPost;
  highlighted: boolean;
  hasFilter: boolean;
  onSearchUser: (username: string) => void;
  onGotoContext: (id: number) => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAvatar(post.poster.user.userId)
      .then((url) => {
        if (!cancelled) setAvatarUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [post.poster.user.userId]);

  const created = new Date(post.created);
  const dateStr = `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(created)}, ${created.getFullYear()} at ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(created)}`;

  return (
    <div
      id={`post-${post.id}`}
      className={`${styles.post} ${highlighted ? styles["post--highlighted"] : ""}`}
    >
      {hasFilter && (
        <button
          className={styles.contextJump}
          onClick={() => onGotoContext(post.id)}
        >
          Jump
        </button>
      )}
      <a
        href={`https://www.roblox.com/users/${post.poster.user.userId}/profile`}
        className={styles.post__avatarContainer}
        target="_blank"
        rel="noopener noreferrer"
      >
        {avatarUrl ? (
          <img className={styles.post__avatar} src={avatarUrl} alt="" />
        ) : (
          <div
            className={`${styles.post__avatar} ${styles["post__avatar--loading"]}`}
          />
        )}
      </a>

      <div className={styles.post__content}>
        <div className={styles["post__user-date-container"]}>
          <button
            className={styles.post__user}
            onClick={() => onSearchUser(post.poster.user.username)}
          >
            {post.poster.user.username}
          </button>
          <span className={styles.post__date}>{dateStr}</span>
        </div>
        <p
          className={styles.post__body}
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </div>
    </div>
  );
}
