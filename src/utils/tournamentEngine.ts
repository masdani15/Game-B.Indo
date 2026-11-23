import { QUESTION_BANK } from '../data/questions';
import {
  ByeRecord,
  GameModeId,
  GradeLevel,
  LevelSelection,
  MatchPairing,
  QuestionItem,
  TeamRecord,
  TournamentStage,
} from '../types/game';

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function resolveLevelForStage(
  selection: LevelSelection,
  stage: TournamentStage
): GradeLevel {
  if (selection !== 'progressive') return selection;
  switch (stage) {
    case 'PENYISIHAN':
      return 2;
    case 'PEREMPAT_FINAL':
      return 3;
    case 'SEMIFINAL':
      return 4;
    case 'FINAL':
      return 6;
    default:
      return 3;
  }
}

function getStageMetaForRound(
  activeTeamCount: number,
  roundNumber: number
): { stage: TournamentStage; title: string } {
  if (activeTeamCount === 2) {
    return { stage: 'FINAL', title: 'Babak Final' };
  }
  if (activeTeamCount <= 4) {
    return { stage: 'SEMIFINAL', title: 'Babak Semifinal' };
  }
  if (activeTeamCount <= 8) {
    return {
      stage: 'PEREMPAT_FINAL',
      title: activeTeamCount === 8 ? 'Perempat Final' : `Babak ${roundNumber} (Penyisihan)`,
    };
  }
  return { stage: 'PENYISIHAN', title: `Babak ${roundNumber} (Penyisihan)` };
}

function makeEmptyMatch(params: {
  id: string;
  roundNumber: number;
  stage: TournamentStage;
  stageTitle: string;
  matchNumber: number;
  label: string;
  teamAId: string | null;
  teamBId: string | null;
  levelUsed: GradeLevel;
}): MatchPairing {
  return {
    id: params.id,
    roundNumber: params.roundNumber,
    stage: params.stage,
    stageTitle: params.stageTitle,
    matchNumber: params.matchNumber,
    label: params.label,
    teamAId: params.teamAId,
    teamBId: params.teamBId,
    status: 'pending',
    winnerId: null,
    scoreA: 0,
    scoreB: 0,
    correctA: 0,
    correctB: 0,
    wrongA: 0,
    wrongB: 0,
    turnsA: 0,
    turnsB: 0,
    bestStreakA: 0,
    bestStreakB: 0,
    levelUsed: params.levelUsed,
  };
}

/**
 * Creates a single knockout round for `activeTeams`:
 * - Randomly shuffles activeTeams so opponents & Bye are drawn fairly.
 * - If activeTeams count is odd, 1 team automatically advances to the next round (Bye).
 * - Guarantees a team that received a Bye in the previous round plays in the current round.
 */
export function createKnockoutRound(params: {
  activeTeams: TeamRecord[];
  roundNumber: number;
  startingMatchNumber: number;
  levelSelection: LevelSelection;
  previousByeTeamId?: string | null;
}): { matches: MatchPairing[]; bye: ByeRecord | null } {
  const {
    activeTeams,
    roundNumber,
    startingMatchNumber,
    levelSelection,
    previousByeTeamId,
  } = params;

  const { stage, title } = getStageMetaForRound(activeTeams.length, roundNumber);
  const levelUsed = resolveLevelForStage(levelSelection, stage);

  let ordered = shuffleArray(activeTeams);

  // If odd count and someone had a Bye last round, ensure they are NOT placed in the last (Bye) slot
  if (ordered.length % 2 === 1 && previousByeTeamId && ordered.length >= 3) {
    const lastIdx = ordered.length - 1;
    if (ordered[lastIdx].id === previousByeTeamId) {
      [ordered[0], ordered[lastIdx]] = [ordered[lastIdx], ordered[0]];
    }
  }

  const pairCount = Math.floor(ordered.length / 2);
  const matches: MatchPairing[] = [];

  for (let i = 0; i < pairCount; i++) {
    const teamA = ordered[i * 2];
    const teamB = ordered[i * 2 + 1];
    const matchNum = startingMatchNumber + i;
    const label =
      stage === 'FINAL'
        ? 'Babak Final · Penentuan Juara Utama'
        : `${title} · Laga ${i + 1}`;

    matches.push(
      makeEmptyMatch({
        id: `round-${roundNumber}-match-${i + 1}`,
        roundNumber,
        stage,
        stageTitle: title,
        matchNumber: matchNum,
        label,
        teamAId: teamA.id,
        teamBId: teamB.id,
        levelUsed,
      })
    );
  }

  let bye: ByeRecord | null = null;
  if (ordered.length % 2 === 1) {
    const byeTeam = ordered[ordered.length - 1];
    bye = {
      roundNumber,
      stageTitle: title,
      teamId: byeTeam.id,
    };
  }

  return { matches, bye };
}

export function generateInitialBracket(
  teams: TeamRecord[],
  levelSelection: LevelSelection
): { matches: MatchPairing[]; byes: ByeRecord[] } {
  const round1 = createKnockoutRound({
    activeTeams: teams,
    roundNumber: 1,
    startingMatchNumber: 1,
    levelSelection,
  });

  return {
    matches: round1.matches,
    byes: round1.bye ? [round1.bye] : [],
  };
}

/**
 * Checks if the latest round is completed; if so and it wasn't the Final,
 * automatically generates the next knockout round (and assigns a Bye if odd).
 */
export function advanceKnockoutTournament(params: {
  matches: MatchPairing[];
  byes: ByeRecord[];
  teams: TeamRecord[];
  levelSelection: LevelSelection;
}): {
  matches: MatchPairing[];
  byes: ByeRecord[];
  championId: string | null;
} {
  const { matches, byes, teams, levelSelection } = params;
  const maxRound = Math.max(...matches.map((m) => m.roundNumber), 1);
  const currentRoundMatches = matches.filter((m) => m.roundNumber === maxRound);

  const allDone = currentRoundMatches.every((m) => m.status === 'completed');
  if (!allDone) {
    return { matches, byes, championId: null };
  }

  const isFinal = currentRoundMatches.some((m) => m.stage === 'FINAL');
  if (isFinal) {
    const finalMatch = currentRoundMatches.find((m) => m.stage === 'FINAL');
    return {
      matches,
      byes,
      championId: finalMatch?.winnerId ?? finalMatch?.teamAId ?? null,
    };
  }

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const advancingTeams: TeamRecord[] = [];

  currentRoundMatches.forEach((m) => {
    const winId = m.winnerId ?? m.teamAId;
    if (winId) {
      const t = teamMap.get(winId);
      if (t) advancingTeams.push(t);
    }
  });

  const roundBye = byes.find((b) => b.roundNumber === maxRound);
  if (roundBye) {
    const byeTeam = teamMap.get(roundBye.teamId);
    if (byeTeam) advancingTeams.push(byeTeam);
  }

  if (advancingTeams.length < 2) {
    return {
      matches,
      byes,
      championId: advancingTeams[0]?.id ?? null,
    };
  }

  const nextRoundNumber = maxRound + 1;
  const nextRound = createKnockoutRound({
    activeTeams: advancingTeams,
    roundNumber: nextRoundNumber,
    startingMatchNumber: matches.length + 1,
    levelSelection,
    previousByeTeamId: roundBye?.teamId ?? null,
  });

  return {
    matches: [...matches, ...nextRound.matches],
    byes: nextRound.bye ? [...byes, nextRound.bye] : byes,
    championId: null,
  };
}

export function sortTeamsForLeaderboard(teams: TeamRecord[]): TeamRecord[] {
  return [...teams].sort((a, b) => {
    if (Number(a.eliminated) !== Number(b.eliminated)) {
      return Number(a.eliminated) - Number(b.eliminated);
    }
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
    return b.bestStreak - a.bestStreak;
  });
}

function prepareQuestionVariant(q: QuestionItem): QuestionItem {
  if (q.options) {
    return {
      ...q,
      options: shuffleArray(q.options),
    };
  }
  return { ...q };
}

/**
 * Anti-cheat unique question distributor:
 * Guarantees Team A and Team B NEVER share the same questions in a match,
 * and prioritizes unseen questions across the whole tournament.
 */
export function drawUniqueDecksForMatch(params: {
  level: GradeLevel;
  levelSelection: LevelSelection;
  gameMode: GameModeId;
  usedQuestionIds: Set<string>;
  deckSizePerTeam?: number;
}): {
  deckA: QuestionItem[];
  deckB: QuestionItem[];
  newlyUsedIds: string[];
} {
  const { level, levelSelection, gameMode, usedQuestionIds, deckSizePerTeam = 22 } = params;

  const matchesMode = (q: QuestionItem) =>
    gameMode === 'campuran' ? true : q.gameType === gameMode;

  const primaryPool = shuffleArray(
    QUESTION_BANK.filter(
      (q) => q.level === level && matchesMode(q) && !usedQuestionIds.has(q.id)
    )
  );

  const nearbyPool = shuffleArray(
    QUESTION_BANK.filter(
      (q) =>
        q.level !== level &&
        (levelSelection === 'progressive'
          ? Math.abs(q.level - level) <= 2
          : Math.abs(q.level - level) <= 3) &&
        matchesMode(q) &&
        !usedQuestionIds.has(q.id)
    )
  );

  const restUnseen = shuffleArray(
    QUESTION_BANK.filter(
      (q) =>
        matchesMode(q) &&
        !usedQuestionIds.has(q.id) &&
        !primaryPool.some((p) => p.id === q.id) &&
        !nearbyPool.some((n) => n.id === q.id)
    )
  );

  let fullPool = [...primaryPool, ...nearbyPool, ...restUnseen];

  if (fullPool.length < deckSizePerTeam * 2) {
    const recycled = shuffleArray(
      QUESTION_BANK.filter(
        (q) =>
          matchesMode(q) &&
          !fullPool.some((existing) => existing.id === q.id)
      )
    );
    fullPool = [...fullPool, ...recycled];
  }

  const deckA: QuestionItem[] = [];
  const deckB: QuestionItem[] = [];
  const newlyUsedIds: string[] = [];

  for (let i = 0; i < fullPool.length; i++) {
    const q = prepareQuestionVariant(fullPool[i]);
    if (i % 2 === 0 && deckA.length < deckSizePerTeam) {
      deckA.push(q);
      newlyUsedIds.push(q.id);
    } else if (i % 2 === 1 && deckB.length < deckSizePerTeam) {
      deckB.push(q);
      newlyUsedIds.push(q.id);
    }
    if (deckA.length >= deckSizePerTeam && deckB.length >= deckSizePerTeam) break;
  }

  return { deckA, deckB, newlyUsedIds };
}
