
export enum GameStatus {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  ERROR = 'ERROR',
  LEADERBOARD = 'LEADERBOARD'
}

export enum RiddleCategory {
  NATURE = 'Natur & Tiere',
  TECH = 'Technologie',
  HISTORY = 'Geschichte',
  HOUSEHOLD = 'Haushalt',
  ABSTRACT = 'Abstraktes'
}

export interface RiddleData {
  riddleText: string;
  answer: string;
  hint: string;
  difficulty: string;
  options: string[];
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
}

export interface GameState {
  status: GameStatus;
  currentRiddle: RiddleData | null;
  score: number;
  streak: number;
  userInput: string;
  feedbackMessage: string;
  hintsUsed: boolean;
  selectedCategory: RiddleCategory;
}
