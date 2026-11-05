import type { Profile } from "./types";

const rayaAvatar = require("../assets/images/avatar1.png");
const manasAvatar = require("../assets/images/avatar2.png");
const maxAvatar = require("../assets/images/avatar3.png");
const ravenAvatar = require("../assets/images/avatar2.png");

const profiles: Profile[] = [
  {
    id: "raya-jane",
    name: "Raya Jane",
    handle: "rayajane",
    avatarSource: rayaAvatar,
    verified: true,
    bio: "Product designer exploring how good ideas scale into great startups.",
    followers: 12800,
    following: 412,
    isFollowing: false,
    mutualFollowers: {
      previewIds: ["maxime-pepber", "manas-sharma"],
      totalCount: 24,
    },
  },
  {
    id: "maxime-pepber",
    name: "Max Pepber",
    handle: "maxpepber",
    avatarSource: maxAvatar,
    verified: true,
    bio: "Frontend engineer building thoughtful tools and giving back to open source.",
    followers: 860,
    following: 210,
    isFollowing: true,
    mutualFollowers: {
      previewIds: ["raya-jane"],
      totalCount: 6,
    },
  },
  {
    id: "manas-sharma",
    name: "Manas Sharma",
    handle: "Manassharma",
    avatarSource: manasAvatar,
    verified: true,
    bio: "React Native developer obsessed with motion, polish, and tiny details.",
    followers: 340,
    following: 128,
    isFollowing: true,
    mutualFollowers: {
      previewIds: [],
      totalCount: 3,
    },
  },
  {
    id: "raven-chandler",
    name: "Raven Chandler",
    handle: "ravenchandler",
    avatarSource: ravenAvatar,
    verified: true,
    bio: "Brand designer and illustrator growing a kind, creative community.",
    followers: 5400,
    following: 302,
    isFollowing: false,
    mutualFollowers: {
      previewIds: ["raya-jane", "manas-sharma"],
      totalCount: 12,
    },
  },
];

export function getProfileById(id: string): Profile | undefined {
  return profiles.find((profile) => profile.id === id);
}
