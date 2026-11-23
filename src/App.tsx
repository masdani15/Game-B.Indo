import { useState } from 'react';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { ChampionScreen } from './components/ChampionScreen';
import { CurriculumModal } from './components/CurriculumModal';
import { DualArena } from './components/DualArena';
import { SetupScreen } from './components/SetupScreen';
import { TournamentHub } from './components/TournamentHub';
import { TEAM_THEMES } from './data/teamThemes';
import {
  AppScreen,
  ByeRecord,
  MatchPairing,
  QuestionItem,
  TeamRecord,
  TournamentConfig,
} from './types/game';
import { useFullscreen } from './utils/fullscreen';
import { soundEngine } from './utils/soundEngine';
import {
  advanceKnockoutTournament,
  drawUniqueDecksForMatch,
  generateInitialBracket,
} from './utils/tournamentEngine';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('SETUP');
  const [config, setConfig] = useState<TournamentConfig>({
    teamCount: 5,
    levelSelection: 'progressive',
    gameMode: 'campuran',
    sessionSeconds: 60,
  });

  const [customTeamNames, setCustomTeamNames] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[][]>([]);

  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [matches, setMatches] = useState<MatchPairing[]>([]);
  const [byes, setByes] = useState<ByeRecord[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(() => new Set());

  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeDecks, setActiveDecks] = useState<{
    deckA: QuestionItem[];
    deckB: QuestionItem[];
  } | null>(null);

  const [championTeamId, setChampionTeamId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleChangeConfig = (partial: Partial<TournamentConfig>) => {
    soundEngine.playTap();
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleChangeTeamName = (index: number, name: string) => {
    setCustomTeamNames((prev) => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  };

  const handleResetTeamNames = () => {
    soundEngine.playTap();
    setCustomTeamNames([]);
  };

  const handleStartTournament = () => {
    soundEngine.playCountdownBeep(true);
    const createdTeams: TeamRecord[] = Array.from({ length: config.teamCount }).map(
      (_, idx) => {
        const theme = TEAM_THEMES[idx % TEAM_THEMES.length];
        const customName = (customTeamNames[idx] ?? '').trim();
        return {
          id: `team-${idx + 1}`,
          name: customName || `Kelompok ${idx + 1}`,
          members: teamMembers[idx] ?? [],
          theme,
          totalPoints: 0,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          bestStreak: 0,
          eliminated: false,
        };
      }
    );

    const initialBracket = generateInitialBracket(createdTeams, config.levelSelection);
    setTeams(createdTeams);
    setMatches(initialBracket.matches);
    setByes(initialBracket.byes);
    setUsedQuestionIds(new Set());
    setChampionTeamId(null);
    setActiveMatchId(null);
    setActiveDecks(null);
    setScreen('TOURNAMENT_HUB');
  };

  const handleReshuffleBracket = () => {
    if (matches.some((m) => m.status === 'completed')) return;
    soundEngine.playRelaySwitch();
    const redrawn = generateInitialBracket(teams, config.levelSelection);
    setMatches(redrawn.matches);
    setByes(redrawn.byes);
  };

  const handleStartMatch = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch || !targetMatch.teamAId || !targetMatch.teamBId) return;

    const { deckA, deckB, newlyUsedIds } = drawUniqueDecksForMatch({
      level: targetMatch.levelUsed,
      levelSelection: config.levelSelection,
      gameMode: config.gameMode,
      usedQuestionIds,
      deckSizePerTeam: 24,
    });

    setUsedQuestionIds((prev) => {
      const next = new Set(prev);
      newlyUsedIds.forEach((id) => next.add(id));
      return next;
    });

    setActiveDecks({ deckA, deckB });
    setActiveMatchId(matchId);
    setScreen('ARENA');
  };

  const handleCompleteMatch = (result: {
    matchId: string;
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
  }) => {
    const completedMatch = matches.find((m) => m.id === result.matchId);
    if (!completedMatch || !completedMatch.teamAId || !completedMatch.teamBId) {
      setScreen('TOURNAMENT_HUB');
      return;
    }

    const winnerId =
      result.scoreA >= result.scoreB
        ? completedMatch.teamAId
        : completedMatch.teamBId;
    const loserId =
      winnerId === completedMatch.teamAId
        ? completedMatch.teamBId
        : completedMatch.teamAId;

    const updatedTeams = teams.map((team) => {
      if (team.id === completedMatch.teamAId) {
        return {
          ...team,
          totalPoints: team.totalPoints + result.scoreA,
          matchesPlayed: team.matchesPlayed + 1,
          wins: team.wins + (winnerId === team.id ? 1 : 0),
          losses: team.losses + (loserId === team.id ? 1 : 0),
          correctAnswers: team.correctAnswers + result.correctA,
          wrongAnswers: team.wrongAnswers + result.wrongA,
          bestStreak: Math.max(team.bestStreak, result.bestStreakA),
          eliminated: loserId === team.id ? true : team.eliminated,
        };
      }
      if (team.id === completedMatch.teamBId) {
        return {
          ...team,
          totalPoints: team.totalPoints + result.scoreB,
          matchesPlayed: team.matchesPlayed + 1,
          wins: team.wins + (winnerId === team.id ? 1 : 0),
          losses: team.losses + (loserId === team.id ? 1 : 0),
          correctAnswers: team.correctAnswers + result.correctB,
          wrongAnswers: team.wrongAnswers + result.wrongB,
          bestStreak: Math.max(team.bestStreak, result.bestStreakB),
          eliminated: loserId === team.id ? true : team.eliminated,
        };
      }
      return team;
    });

    const matchesWithResult = matches.map((m) =>
      m.id === result.matchId
        ? {
            ...m,
            status: 'completed' as const,
            winnerId,
            isDraw: false,
            scoreA: result.scoreA,
            scoreB: result.scoreB,
            correctA: result.correctA,
            correctB: result.correctB,
            wrongA: result.wrongA,
            wrongB: result.wrongB,
            turnsA: result.turnsA,
            turnsB: result.turnsB,
            bestStreakA: result.bestStreakA,
            bestStreakB: result.bestStreakB,
          }
        : m
    );

    const nextState = advanceKnockoutTournament({
      matches: matchesWithResult,
      byes,
      teams: updatedTeams,
      levelSelection: config.levelSelection,
    });

    setTeams(updatedTeams);
    setMatches(nextState.matches);
    setByes(nextState.byes);
    setActiveMatchId(null);
    setActiveDecks(null);

    if (nextState.championId) {
      setChampionTeamId(nextState.championId);
      setScreen('CHAMPION');
    } else {
      setScreen('TOURNAMENT_HUB');
    }
  };

  const activeMatch = activeMatchId
    ? matches.find((m) => m.id === activeMatchId)
    : undefined;
  const activeTeamA = activeMatch?.teamAId
    ? teams.find((t) => t.id === activeMatch.teamAId)
    : undefined;
  const activeTeamB = activeMatch?.teamBId
    ? teams.find((t) => t.id === activeMatch.teamBId)
    : undefined;

  return (
    <>
      {screen === 'SETUP' && (
        <SetupScreen
          config={config}
          customTeamNames={customTeamNames}
          teamMembers={teamMembers}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          onToggleMute={handleToggleMute}
          onToggleFullscreen={toggleFullscreen}
          onOpenAdminSettings={() => setIsAdminOpen(true)}
          onStartTournament={handleStartTournament}
        />
      )}

      {screen === 'TOURNAMENT_HUB' && (
        <TournamentHub
          config={config}
          teams={teams}
          matches={matches}
          byes={byes}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          onToggleMute={handleToggleMute}
          onToggleFullscreen={toggleFullscreen}
          onOpenAdminSettings={() => setIsAdminOpen(true)}
          onStartMatch={handleStartMatch}
          onReshuffleBracket={handleReshuffleBracket}
          onViewChampion={() => setScreen('CHAMPION')}
          onResetToSetup={() => setScreen('SETUP')}
        />
      )}

      {screen === 'ARENA' &&
        activeMatch &&
        activeTeamA &&
        activeTeamB &&
        activeDecks && (
          <DualArena
            match={activeMatch}
            teamA={activeTeamA}
            teamB={activeTeamB}
            allTeams={teams}
            deckA={activeDecks.deckA}
            deckB={activeDecks.deckB}
            sessionSeconds={config.sessionSeconds}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            onToggleMute={handleToggleMute}
            onToggleFullscreen={toggleFullscreen}
            onExitArena={() => {
              setActiveMatchId(null);
              setActiveDecks(null);
              setScreen('TOURNAMENT_HUB');
            }}
            onCompleteMatch={handleCompleteMatch}
          />
        )}

      {screen === 'CHAMPION' && (
        <ChampionScreen
          teams={teams}
          championTeamId={championTeamId}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onBackToHub={() => setScreen('TOURNAMENT_HUB')}
          onStartNewTournament={() => setScreen('SETUP')}
        />
      )}

      <AdminSettingsModal
        isOpen={isAdminOpen}
        config={config}
        customTeamNames={customTeamNames}
        teamMembers={teamMembers}
        isFullscreen={isFullscreen}
        onClose={() => setIsAdminOpen(false)}
        onToggleFullscreen={toggleFullscreen}
        onChangeConfig={handleChangeConfig}
        onChangeTeamName={handleChangeTeamName}
        onResetTeamNames={handleResetTeamNames}
        onSetTeamMembers={setTeamMembers}
        onOpenCurriculum={() => {
          setIsAdminOpen(false);
          setIsCurriculumOpen(true);
        }}
      />

      <CurriculumModal
        isOpen={isCurriculumOpen}
        onClose={() => setIsCurriculumOpen(false)}
      />
    </>
  );
}
