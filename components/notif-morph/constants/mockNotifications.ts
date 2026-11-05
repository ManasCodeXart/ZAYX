import type { Notification } from "./types";

export const notifications: Notification[] = [
  {
    id: "notif-follow-002",
    type: "follow",
    actorId: "raven-chandler",
    timestamp: "2026-10-26T10:05:00.000Z",
    read: false,
  },
  {
    id: "notif-like-001",
    type: "like",
    actorId: "raya-jane",
    timestamp: "2026-10-26T09:12:00.000Z",
    read: false,
    postSnippet: "Shipping a new morph interaction the badge now unfolds into a tray",
  },
  {
    id: "notif-follow-001",
    type: "follow",
    actorId: "maxime-pepber",
    timestamp: "2026-10-26T08:40:00.000Z",
    read: false,
  },
  {
    id: "notif-reply-001",
    type: "reply",
    actorId: "raya-jane",
    timestamp: "2026-10-25T18:05:00.000Z",
    read: true,
    replyText: "Your zayx is awesome!",
    replyingToHandle: "@Manassharma",
  },
];
