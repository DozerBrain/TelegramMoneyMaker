export type PlayerProfile = {
  userId: string;     // Firebase auth uid or your own id
  username: string;   // display name
  region: string;     // e.g., 'US', 'KZ', 'RU'
  score: number;      // current best score
  rank?: number;      // optional rank from leaderboard
  avatarUrl?: string; // optional profile image
};
