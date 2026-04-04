const avatarCache = new Map<number, string>();
const inFlightAvatarRequests = new Map<number, Promise<string>>();

const FALLBACK_AVATAR_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIGlkPSJMYXllcl8xIiB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHg9IjAiIHk9IjAiIHZpZXdCb3g9IjAgMCA5MCA5MCI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJ1bmFwcHJvdmVkXzFfIj48cGF0aCBpZD0iYmdfMl8iIGQ9Ik0wIDBoOTB2OTBIMHoiIHN0eWxlPSJmaWxsOiM2NTY2NjgiLz48ZyBpZD0idW5hcHByb3ZlZCIgc3R5bGU9Im9wYWNpdHk6LjMiPjxjaXJjbGUgY3g9IjQ1IiBjeT0iNDguOCIgcj0iMTAiIGNsYXNzPSJzdDIiLz48cGF0aCBkPSJtMzggNDEuNyAxNCAxNC4xTTMyLjUgMjMuNWgtNHY0TTI4LjUgNjIuNXY0aDRNMjguNSAzMS44djZNMjguNSA0MnY2TTI4LjUgNTIuMnY2TTU3LjUgNjYuNWg0di00TTYxLjUgNTguMnYtNk02MS41IDQ4di02TTYxLjUgMzcuOHYtNE0zNi44IDY2LjVoNk00Ny4yIDY2LjVoNk00Ny4yIDIzLjVoNE01MS40IDIzLjZsMy41IDMuNU01Ny45IDMwLjFsMy41IDMuNU01MS4yIDIzLjh2M001OC41IDMzLjhoM001MS4yIDMwLjJ2My42aDMuNiIgY2xhc3M9InN0MiIvPjwvZz48L2c+PC9zdmc+";

type RobloxAvatarResponse = {
  data?: Array<{
    targetId?: number;
    imageUrl?: string;
  }>;
};

function normalizeUserIds(userIds: number[]): number[] {
  return [...new Set(userIds.filter((id) => Number.isFinite(id) && id > 0))];
}

export function prefetchAvatars(userIds: number[]): Promise<void> {
  const normalizedIds = normalizeUserIds(userIds);
  const missingIds = normalizedIds.filter(
    (id) => !avatarCache.has(id) && !inFlightAvatarRequests.has(id)
  );

  if (missingIds.length === 0) {
    return Promise.resolve();
  }

  const requestPromise = fetch(
    `/api/roblox-proxy/users/avatar-headshot?userIds=${missingIds.join(",")}&size=420x420&format=Png&isCircular=false`
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Avatar fetch failed with status ${res.status}`);
      }
      return res.json() as Promise<RobloxAvatarResponse>;
    })
    .then((payload) => {
      const imageByUserId = new Map<number, string>();
      for (const item of payload.data ?? []) {
        if (
          typeof item?.targetId === "number" &&
          typeof item?.imageUrl === "string" &&
          item.imageUrl.length > 0
        ) {
          imageByUserId.set(item.targetId, item.imageUrl);
        }
      }
      return imageByUserId;
    });

  for (const userId of missingIds) {
    const perUserPromise = requestPromise
      .then((imageByUserId) => imageByUserId.get(userId) ?? FALLBACK_AVATAR_URL)
      .catch(() => FALLBACK_AVATAR_URL)
      .then((avatarUrl) => {
        avatarCache.set(userId, avatarUrl);
        inFlightAvatarRequests.delete(userId);
        return avatarUrl;
      });

    inFlightAvatarRequests.set(userId, perUserPromise);
  }

  return Promise.all(missingIds.map((id) => inFlightAvatarRequests.get(id)!)).then(() => undefined);
}

export function getAvatar(userId: number): Promise<string> {
  const cachedAvatar = avatarCache.get(userId);
  if (cachedAvatar) {
    return Promise.resolve(cachedAvatar);
  }

  const pendingRequest = inFlightAvatarRequests.get(userId);
  if (pendingRequest) {
    return pendingRequest;
  }

  void prefetchAvatars([userId]);
  return inFlightAvatarRequests.get(userId) ?? Promise.resolve(FALLBACK_AVATAR_URL);
}
