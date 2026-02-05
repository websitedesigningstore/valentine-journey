export interface User {
  id: string;
  username: string; // Still used for display name
  mobile: string;   // New unique identifier
  partnerName: string;
  pin: string; // Simple auth
}

export enum DayType {
  WAITING = 'waiting',
  ROSE = 'rose',
  PROPOSE = 'propose',
  CHOCOLATE = 'chocolate',
  TEDDY = 'teddy',
  PROMISE = 'promise',
  HUG = 'hug',
  KISS = 'kiss',
  VALENTINE = 'valentine',
  FINISHED = 'finished'
}

export interface DayContent {
  message: string;
  customQuestion?: string;
  customAnswerYes?: string;
  customAnswerNo?: string;
}

export interface ValentineConfig {
  userId: string;
  isActive?: boolean;
  days: Record<DayType, DayContent>;
  confessions: Confession[];
}

export interface Confession {
  id: string;
  sessionId?: string; // To track distinct sessions (fresh starts) vs updates
  date: string;
  text: string;
  day: DayType;
}

// Default content for fallback
export const DEFAULT_CONTENT: Record<DayType, DayContent> = {
  [DayType.WAITING]: { message: "Tumhare liye kuch khaas tayaar ho raha hai… bas thoda sa intezaar ❤️" },
  [DayType.ROSE]: { message: "Just like this rose, you make my life beautiful. Happy Rose Day! 🌹" },
  [DayType.PROPOSE]: { message: "I want to walk with you forever. Will you be mine?" },
  [DayType.CHOCOLATE]: { message: "Life is sweeter with you. Happy Chocolate Day! 🍫" },
  [DayType.TEDDY]: { message: "Sending you a bear hug! You are my cutest teddy. 🧸" },
  [DayType.PROMISE]: { message: "I promise to stand by you, today and forever. 🤝" },
  [DayType.HUG]: { message: "A hug from you fixes everything. Sending you a warm one! 🤗" },
  [DayType.KISS]: { message: "Your love is the best feeling in the world. Happy Kiss Day! 💋" },
  [DayType.VALENTINE]: { message: "You are my forever Valentine. I love you! ❤️" },
  [DayType.FINISHED]: { message: "Our love story continues..." }
};
