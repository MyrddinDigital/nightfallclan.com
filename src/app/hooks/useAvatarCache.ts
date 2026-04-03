const avatarCache = new Map<number, Promise<string>>();

export function getAvatar(userId: number): Promise<string> {
  if (avatarCache.has(userId)) {
    return avatarCache.get(userId)!;
  }

  const promise = fetch(
    `/api/roblox-proxy/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
  ).then((res) => res.text());

  avatarCache.set(userId, promise);
  return promise;
}
