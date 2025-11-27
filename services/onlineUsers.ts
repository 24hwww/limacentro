// In-memory store for active users.
// A Map where the key is a unique user identifier and the value is the timestamp of their last ping.
const activeUsers = new Map<string, number>();

const USER_TIMEOUT = 40 * 1000; // Users are considered offline after 40 seconds

// A simple flag to ensure setInterval is only started once per instance.
let cleanupInterval: NodeJS.Timeout | null = null;

const cleanupOldUsers = () => {
  const now = Date.now();
  for (const [userId, lastPing] of activeUsers.entries()) {
    if (now - lastPing > USER_TIMEOUT) {
      activeUsers.delete(userId);
    }
  }
};

const startCleanup = () => {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupOldUsers, USER_TIMEOUT / 2);
  }
};

export const recordUserPing = (userId: string) => {
  activeUsers.set(userId, Date.now());
  startCleanup(); // Ensure cleanup is running
};

export const getOnlineUserCount = () => {
  const now = Date.now();
  let onlineCount = 0;
  for (const lastPing of activeUsers.values()) {
    if (now - lastPing <= USER_TIMEOUT) {
      onlineCount++;
    }
  }
  return onlineCount;
};
