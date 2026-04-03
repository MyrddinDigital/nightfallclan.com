function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sanitizeText(raw: string): string {
  const urlRegex = /https?:\/\/[^\s<]+/g;
  let result = "";
  let lastIndex = 0;

  raw.replace(urlRegex, (match: string, offset: number) => {
    result += escapeHtml(raw.slice(lastIndex, offset));

    const trailingPunct = /[.,!?)]+$/.exec(match);
    const cleanUrl = trailingPunct
      ? match.slice(0, -trailingPunct[0].length)
      : match;
    const trailing = trailingPunct ? trailingPunct[0] : "";

    let href = cleanUrl;
    try {
      const u = new URL(cleanUrl);
      if (
        u.hostname.endsWith("roblox.com") &&
        u.pathname === "/Forum/ShowPost.aspx"
      ) {
        const id = u.searchParams.get("PostID");
        if (id) href = `https://archive.froast.io/forum/${id}`;
      }
    } catch {
      /* ignore malformed urls */
    }

    result += `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(cleanUrl)}</a>${escapeHtml(trailing)}`;
    lastIndex = offset + match.length;
    return match;
  });

  result += escapeHtml(raw.slice(lastIndex));
  return result;
}

export type Poster = {
  user: {
    userId: number;
    username: string;
    displayName: string;
  };
};

export type Post = {
  id: number;
  poster?: Poster;
  body: string;
  created: string;
};

export type SanitizedPost = Post & { poster: Poster };

export function sanitizePosts(posts: Post[]): SanitizedPost[] {
  return posts.map((post) => {
    const safePoster: Poster = post.poster ?? {
      user: { userId: 1, username: "Banned User", displayName: "Banned User" },
    };
    return { ...post, poster: safePoster, body: sanitizeText(post.body ?? "") } as SanitizedPost;
  });
}
