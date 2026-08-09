import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSendNotification = vi.fn();
const mockSetVapidDetails = vi.fn();

vi.mock("web-push", () => ({
  default: {
    sendNotification: mockSendNotification,
    setVapidDetails: mockSetVapidDetails,
  },
}));

const mockPrisma = {
  pushSubscription: {
    findMany: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe("sendPushToUser", () => {
  it("returns 0 if VAPID keys not set", async () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;

    const { sendPushToUser } = await import("@/server/push.service");
    const result = await sendPushToUser("user1", {
      title: "Test",
      body: "Hello",
    });

    expect(result).toBe(0);
    expect(mockPrisma.pushSubscription.findMany).not.toHaveBeenCalled();
  });

  it("sends notification to all subscriptions", async () => {
    process.env.VAPID_PUBLIC_KEY = "test-key";
    process.env.VAPID_PRIVATE_KEY = "test-secret";

    const subs = [
      {
        endpoint: "https://fcm.google.com/1",
        p256dh: "key1",
        auth: "auth1",
      },
      {
        endpoint: "https://fcm.google.com/2",
        p256dh: "key2",
        auth: "auth2",
      },
    ];
    mockPrisma.pushSubscription.findMany.mockResolvedValue(subs);
    mockSendNotification.mockResolvedValue(undefined);

    const { sendPushToUser } = await import("@/server/push.service");
    const result = await sendPushToUser("user1", {
      title: "Test",
      body: "Hello",
      url: "/dashboard",
    });

    expect(result).toBe(2);
    expect(mockSendNotification).toHaveBeenCalledTimes(2);
    expect(mockSendNotification).toHaveBeenCalledWith(
      {
        endpoint: "https://fcm.google.com/1",
        keys: { p256dh: "key1", auth: "auth1" },
      },
      JSON.stringify({ title: "Test", body: "Hello", url: "/dashboard" }),
    );
  });

  it("deletes subscription on send failure", async () => {
    process.env.VAPID_PUBLIC_KEY = "test-key";
    process.env.VAPID_PRIVATE_KEY = "test-secret";

    const subs = [
      {
        endpoint: "https://fcm.google.com/1",
        p256dh: "key1",
        auth: "auth1",
      },
    ];
    mockPrisma.pushSubscription.findMany.mockResolvedValue(subs);
    mockSendNotification.mockRejectedValue(new Error("Invalid subscription"));
    mockPrisma.pushSubscription.delete.mockResolvedValue({});

    const { sendPushToUser } = await import("@/server/push.service");
    const result = await sendPushToUser("user1", {
      title: "Test",
      body: "Hello",
    });

    expect(result).toBe(0);
    expect(mockPrisma.pushSubscription.delete).toHaveBeenCalledWith({
      where: { endpoint: "https://fcm.google.com/1" },
    });
  });

  it("handles delete failure gracefully", async () => {
    process.env.VAPID_PUBLIC_KEY = "test-key";
    process.env.VAPID_PRIVATE_KEY = "test-secret";

    const subs = [
      {
        endpoint: "https://fcm.google.com/1",
        p256dh: "key1",
        auth: "auth1",
      },
    ];
    mockPrisma.pushSubscription.findMany.mockResolvedValue(subs);
    mockSendNotification.mockRejectedValue(new Error("Failed"));
    mockPrisma.pushSubscription.delete.mockRejectedValue(
      new Error("Delete failed"),
    );

    const { sendPushToUser } = await import("@/server/push.service");
    const result = await sendPushToUser("user1", {
      title: "Test",
      body: "Hello",
    });

    expect(result).toBe(0);
  });

  it("returns 0 when no subscriptions", async () => {
    process.env.VAPID_PUBLIC_KEY = "test-key";
    process.env.VAPID_PRIVATE_KEY = "test-secret";

    mockPrisma.pushSubscription.findMany.mockResolvedValue([]);

    const { sendPushToUser } = await import("@/server/push.service");
    const result = await sendPushToUser("user1", {
      title: "Test",
      body: "Hello",
    });

    expect(result).toBe(0);
    expect(mockSendNotification).not.toHaveBeenCalled();
  });
});
