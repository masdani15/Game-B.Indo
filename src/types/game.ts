export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type LevelSelection = GradeLevel | 'progressive' | 'all';

export type GameModeId =
  | 'campuran'
  | 'pilihan_cepat'
  | 'rakit_kalimat'
  | 'detektif_ejaan'
  | 'padan_kata'
  | 'majas_idiom';

export type MiniGameType = Exclude<GameModeId, 'campuran'>;

export interface QuestionItem {
  id: string;
  level: GradeLevel;
  gameType: MiniGameType;
  topic: string;
  prompt: string;
  hint?: string;
  options?: string[];
  correctAnswer?: string;
  targetTokens?: string[];
  distractorTokens?: string[];
}

export interface TeamTheme {
  id: string;
  name: string;
  primary: string;
  lightBg: string;
  border: string;
  text: string;
  badgeBg: string;
  emblem:
    | 'garuda'
    | 'komodo'
    | 'rajawali'
    | 'cenderawasih'
    | 'harimau'
    | 'merpati'
    | 'elang'
    | 'banteng';
}

export interface TeamRecord {
  id: string;
  name: string;
  members: string[];
  theme: TeamTheme;
  totalPoints: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  correctAnswers: number;
  wrongAnswers: number;
  bestStreak: number;
  eliminated: boolean;
}

export type TournamentStage = 'PENYISIHAN' | 'PEREMPAT_FINAL' | 'SEMIFINAL' | 'FINAL';

export interface ByeRecord {
  roundNumber: number;
  stageTitle: string;
  teamId: string;
}

export interface MatchPairing {
  id: string;
  roundNumber: number;
  stage: TournamentStage;
  stageTitle: string;
  matchNumber: number;
  label: string;
  teamAId: string | null;
  teamBId: string | null;
  status: 'pending' | 'active' | 'completed';
  winnerId: string | null;
  isDraw?: boolean;
  scoreA: number;
  scoreB: number;
  correctA: number;
  correctB: number;
  wrongA: number;
  wrongB: number;
  turnsA: number;
  turnsB: number;
  bestStreakA: number;
  bestStreakB: number;
  levelUsed: GradeLevel | 'all';
}

export type AppScreen = 'SETUP' | 'TOURNAMENT_HUB' | 'ARENA' | 'CHAMPION';

export interface TournamentConfig {
  teamCount: number;
  levelSelection: LevelSelection;
  gameMode: GameModeId;
  sessionSeconds: number;
}
