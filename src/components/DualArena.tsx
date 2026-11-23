import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MatchPairing, QuestionItem, TeamRecord } from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { shuffleArray, sortTeamsForLeaderboard } from '../utils/tournamentEngine';
import { TeamEmblem } from './TeamEmblem';

interface DualArenaProps {
  match: MatchPairing;
  teamA: TeamRecord;
  teamB: TeamRecord;
  allTeams: TeamRecord[];
  deckA: QuestionItem[];
  deckB: QuestionItem[];
  sessionSeconds: number;
  isMuted: boolean;
  isFullscreen: boolean;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onExitArena: () => void;
  onCompleteMatch: (result: {
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
  }) => void;
}

interface SideStats {
  score: number;
  correct: number;
  wrong: number;
  turns: number;
  streak: number;
  bestStreak: number;
}

const GAME_TYPE_LABEL: Record<QuestionItem['gameType'], string> = {
  pilihan_cepat: 'Kilat Kosakata',
  rakit_kalimat: 'Rakit Kalimat',
  detektif_ejaan: 'Detektif Ejaan',
  padan_kata: 'Padan Kata',
  majas_idiom: 'Majas & Idiom',
};

interface TeamPlaySideProps {
  side: 'A' | 'B';
  team: TeamRecord;
  deck: QuestionItem[];
  isPlayable: boolean;
  stats: SideStats;
  liveRank: number;
  onAnswerResult: (isCorrect: boolean, pointsEarned: number) => void;
}

const TeamPlaySide: React.FC<TeamPlaySideProps> = ({
  team,
  deck,
  isPlayable,
  stats,
  liveRank,
  onAnswerResult,
}) => {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedTokenIndices, setSelectedTokenIndices] = useState<number[]>([]);

  const timersRef = useRef<number[]>([]);
  const lockedRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const currentQuestion = deck[questionIdx % deck.length];

  const tokenPool = useMemo(() => {
    if (!currentQuestion || currentQuestion.gameType !== 'rakit_kalimat') return [];
    const combined = [
      ...(currentQuestion.targetTokens ?? []),
      ...(currentQuestion.distractorTokens ?? []),
    ];
    return shuffleArray(combined);
  }, [currentQuestion]);

  useEffect(() => {
    setSelectedTokenIndices([]);
  }, [questionIdx, currentQuestion?.id]);

  // Neutral transition: NEVER reveals right/wrong, only updates score silently & hands off turn
  const triggerNeutralSubmit = useCallback(
    (isCorrect: boolean) => {
      if (lockedRef.current || !isPlayable) return;
      lockedRef.current = true;

      const nextStreak = isCorrect ? stats.streak + 1 : 0;
      const streakBonus = isCorrect && nextStreak >= 3 ? 5 : 0;
      const pointsEarned = isCorrect ? 10 + streakBonus : 0;

      // Always play the exact same neutral crystalline chime
      soundEngine.playAnswerSubmit();
      onAnswerResult(isCorrect, pointsEarned);
      setIsTransitioning(true);

      const t1 = window.setTimeout(() => {
        soundEngine.playRelaySwitch();
        setIsTransitioning(false);
        setQuestionIdx((prev) => prev + 1);
        lockedRef.current = false;
      }, 460);

      timersRef.current.push(t1);
    },
    [isPlayable, onAnswerResult, stats.streak]
  );

  const handleOptionPointerDown = (e: React.PointerEvent, optionText: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPlayable || lockedRef.current || !currentQuestion) return;
    const isCorrect = optionText === currentQuestion.correctAnswer;
    triggerNeutralSubmit(isCorrect);
  };

  const handleTokenPointerDown = (e: React.PointerEvent, poolIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPlayable || lockedRef.current || !currentQuestion?.targetTokens) return;

    soundEngine.playTap();

    if (selectedTokenIndices.includes(poolIndex)) {
      setSelectedTokenIndices((prev) => prev.filter((i) => i !== poolIndex));
      return;
    }

    const nextSelected = [...selectedTokenIndices, poolIndex];
    setSelectedTokenIndices(nextSelected);

    const targetLen = currentQuestion.targetTokens.length;
    if (nextSelected.length === targetLen) {
      const builtString = nextSelected.map((i) => tokenPool[i]).join(' ');
      const expectedString = currentQuestion.targetTokens.join(' ');
      const isCorrect = builtString === expectedString;
      triggerNeutralSubmit(isCorrect);
    }
  };

  const handleResetAssembly = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPlayable || lockedRef.current) return;
    soundEngine.playTap();
    setSelectedTokenIndices([]);
  };

  const activeStudent =
    team.members.length > 0
      ? team.members[stats.turns % team.members.length]
      : `Siswa #${stats.turns + 1}`;

  return (
    <div
      className="ifp-touch-zone relative flex-1 flex flex-col justify-between p-4 md:p-6 overflow-hidden"
      style={{
        background: `linear-gradient(155deg, ${team.theme.lightBg} 0%, rgba(255,255,255,0.7) 100%)`,
      }}
    >
      {/* Team Glass Header: Name, Active Student, Live Score ONLY */}
      <div className="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <TeamEmblem emblem={team.theme.emblem} color={team.theme.primary} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base md:text-lg font-extrabold text-slate-900 truncate">
                {team.name}
              </h2>
              <span
                className="text-xs font-extrabold px-2 py-0.5 rounded-lg whitespace-nowrap"
                style={{ backgroundColor: team.theme.badgeBg, color: team.theme.text }}
              >
                #{liveRank}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-700 truncate">
              Giliran: {activeStudent}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] font-bold text-slate-500 tracking-wider">SKOR</div>
          <div
            key={stats.score}
            className="font-mono-num text-3xl md:text-4xl font-extrabold leading-none animate-score-pop"
            style={{ color: team.theme.primary }}
          >
            {stats.score}
          </div>
        </div>
      </div>

      {/* Main Question Glass Card */}
      <div className="flex-1 flex flex-col justify-center my-3 min-h-0">
        {currentQuestion && (
          <div
            key={currentQuestion.id}
            className="glass-panel rounded-3xl border-2 p-5 md:p-6 ifp-pop-card flex flex-col gap-4 animate-pop-in"
            style={{ borderColor: team.theme.border }}
          >
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500">
              <span>{GAME_TYPE_LABEL[currentQuestion.gameType]}</span>
              <span className="font-mono-num">
                Level {currentQuestion.level} · #{questionIdx + 1}
              </span>
            </div>

            <h3 className="font-display text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
              {currentQuestion.prompt}
            </h3>

            {currentQuestion.gameType === 'rakit_kalimat' && currentQuestion.targetTokens ? (
              <div className="flex flex-col gap-3.5">
                <div className="min-h-[68px] rounded-2xl bg-white/75 border-2 border-dashed border-slate-300 p-3 flex flex-wrap items-center gap-2">
                  {selectedTokenIndices.length === 0 ? (
                    <span className="text-sm text-slate-400 font-medium">
                      Susun {currentQuestion.targetTokens.length} bagian...
                    </span>
                  ) : (
                    selectedTokenIndices.map((poolIdx, orderIdx) => (
                      <button
                        key={`${poolIdx}-${orderIdx}`}
                        type="button"
                        onPointerDown={(e) => handleTokenPointerDown(e, poolIdx)}
                        className="ifp-pop-btn px-4 py-2 rounded-xl bg-sky-600 border-b-4 border-sky-800 text-white font-bold text-base md:text-lg"
                      >
                        {tokenPool[poolIdx]}
                      </button>
                    ))
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {tokenPool.map((token, idx) => {
                    const isUsed = selectedTokenIndices.includes(idx);
                    return (
                      <button
                        key={`${token}-${idx}`}
                        type="button"
                        disabled={!isPlayable || isUsed}
                        onPointerDown={(e) => handleTokenPointerDown(e, idx)}
                        className={`ifp-pop-btn min-h-[56px] px-4 py-2.5 rounded-2xl border-2 border-b-4 font-bold text-base md:text-lg ${
                          isUsed
                            ? 'bg-slate-100/60 border-slate-200 text-slate-300 scale-95'
                            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        {token}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onPointerDown={handleResetAssembly}
                    className="ifp-pop-btn px-3.5 py-2 rounded-xl border-2 border-b-3 border-slate-200 bg-white text-xs font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    Ulang
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`grid gap-3 ${
                  currentQuestion.gameType === 'detektif_ejaan'
                    ? 'grid-cols-1'
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {(currentQuestion.options ?? []).map((opt, idx) => {
                  const optionLetter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={`${currentQuestion.id}-opt-${idx}`}
                      type="button"
                      disabled={!isPlayable}
                      onPointerDown={(e) => handleOptionPointerDown(e, opt)}
                      className="ifp-pop-btn min-h-[68px] md:min-h-[76px] px-4 py-3.5 rounded-2xl border-2 border-b-4 border-slate-200 bg-white/95 hover:bg-white text-left flex items-center gap-3 cursor-pointer"
                    >
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-extrabold text-sm text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: team.theme.primary }}
                      >
                        {optionLetter}
                      </span>
                      <span className="font-bold text-base md:text-lg text-slate-900 leading-snug">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Neutral Glass Relay Overlay (Zero right/wrong reveal!) */}
      {isTransitioning && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-900/55 backdrop-blur-md text-white animate-pop-in">
          <div className="glass-dark rounded-3xl px-8 py-6 flex flex-col items-center gap-2 shadow-2xl">
            <Users size={44} strokeWidth={2.2} className="text-sky-300" />
            <div className="font-display text-2xl md:text-3xl font-extrabold">
              Ganti Pemain
            </div>
            <p className="text-base text-slate-200 font-semibold">
              Lanjut: {activeStudent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const DualArena: React.FC<DualArenaProps> = ({
  match,
  teamA,
  teamB,
  allTeams,
  deckA,
  deckB,
  sessionSeconds,
  isMuted,
  isFullscreen,
  onToggleMute,
  onToggleFullscreen,
  onExitArena,
  onCompleteMatch,
}) => {
  const [preCountdown, setPreCountdown] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(sessionSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [matchEnded, setMatchEnded] = useState(false);

  const [statsA, setStatsA] = useState<SideStats>({
    score: 0,
    correct: 0,
    wrong: 0,
    turns: 0,
    streak: 0,
    bestStreak: 0,
  });

  const [statsB, setStatsB] = useState<SideStats>({
    score: 0,
    correct: 0,
    wrong: 0,
    turns: 0,
    streak: 0,
    bestStreak: 0,
  });

  useEffect(() => {
    if (preCountdown <= 0) return;
    soundEngine.playCountdownBeep(false);
    const id = window.setTimeout(() => {
      if (preCountdown === 1) {
        soundEngine.playCountdownBeep(true);
      }
      setPreCountdown((c) => c - 1);
    }, 850);
    return () => window.clearTimeout(id);
  }, [preCountdown]);

  useEffect(() => {
    if (preCountdown > 0 || isPaused || matchEnded) return;

    if (timeLeft <= 0) {
      setMatchEnded(true);
      soundEngine.playMatchEnd();
      return;
    }

    if (timeLeft <= 10) {
      soundEngine.playUrgentTick();
    }

    const id = window.setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => window.clearTimeout(id);
  }, [preCountdown, isPaused, matchEnded, timeLeft]);

  const handleAnswerA = useCallback((isCorrect: boolean, pointsEarned: number) => {
    setStatsA((prev) => {
      const nextStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        score: prev.score + pointsEarned,
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: prev.wrong + (isCorrect ? 0 : 1),
        turns: prev.turns + 1,
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      };
    });
  }, []);

  const handleAnswerB = useCallback((isCorrect: boolean, pointsEarned: number) => {
    setStatsB((prev) => {
      const nextStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        score: prev.score + pointsEarned,
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: prev.wrong + (isCorrect ? 0 : 1),
        turns: prev.turns + 1,
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      };
    });
  }, []);

  const liveProjectedLeaderboard = useMemo(() => {
    const projected = allTeams.map((t) => {
      if (t.id === teamA.id) {
        return {
          ...t,
          totalPoints: t.totalPoints + statsA.score,
        };
      }
      if (t.id === teamB.id) {
        return {
          ...t,
          totalPoints: t.totalPoints + statsB.score,
        };
      }
      return t;
    });
    return sortTeamsForLeaderboard(projected);
  }, [allTeams, teamA.id, teamB.id, statsA.score, statsB.score]);

  const rankA = liveProjectedLeaderboard.findIndex((t) => t.id === teamA.id) + 1;
  const rankB = liveProjectedLeaderboard.findIndex((t) => t.id === teamB.id) + 1;

  const totalMatchPoints = statsA.score + statsB.score;
  const leftPercent =
    totalMatchPoints === 0 ? 50 : Math.round((statsA.score / totalMatchPoints) * 100);

  const isPlayable = preCountdown === 0 && !isPaused && !matchEnded;

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSuddenOvertime = () => {
    soundEngine.playCountdownBeep(true);
    setTimeLeft(15);
    setMatchEnded(false);
  };

  const isKnockoutTie = matchEnded && statsA.score === statsB.score;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col ifp-touch-zone">
      {/* Minimalist Frosted Dark HUD */}
      <header className="glass-dark text-white px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onExitArena}
            className="ifp-pop-btn px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft size={14} />
            Keluar
          </button>
          <span className="hidden sm:inline text-xs font-bold text-slate-200 truncate">
            {match.label} · Level {match.levelUsed}
          </span>
        </div>

        <div
          className={`font-mono-num text-2xl md:text-3xl font-extrabold px-5 py-1 rounded-2xl border transition-colors ${
            timeLeft <= 10
              ? 'bg-rose-600 border-rose-400 text-white'
              : timeLeft <= 20
              ? 'bg-amber-400 border-amber-300 text-slate-950'
              : 'bg-white/10 border-white/20 text-white'
          }`}
        >
          {formatClock(timeLeft)}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            disabled={preCountdown > 0 || matchEnded}
            className="ifp-pop-btn px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            {isPaused ? 'Lanjut' : 'Jeda'}
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="ifp-pop-btn p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="ifp-pop-btn p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* Slim Glass Tug-of-War Scoreboard */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white px-4 md:px-6 py-2 flex flex-col gap-1.5 shrink-0 z-20">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 gap-4">
          <span className="truncate">
            {teamA.name} · <span className="font-mono-num">{statsA.score}</span>
          </span>
          <span className="text-slate-600 whitespace-nowrap font-bold">
            {statsA.score === statsB.score
              ? 'Imbang'
              : statsA.score > statsB.score
              ? `${teamA.name} +${statsA.score - statsB.score}`
              : `${teamB.name} +${statsB.score - statsA.score}`}
          </span>
          <span className="truncate text-right">
            <span className="font-mono-num">{statsB.score}</span> · {teamB.name}
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full overflow-hidden bg-slate-200/80 flex">
          <div
            className="h-full transition-all duration-200"
            style={{ width: `${leftPercent}%`, backgroundColor: teamA.theme.primary }}
          />
          <div
            className="h-full transition-all duration-200"
            style={{ width: `${100 - leftPercent}%`, backgroundColor: teamB.theme.primary }}
          />
        </div>
      </div>

      {/* Dual Independent Touch Arena */}
      <div className="flex-1 grid grid-cols-2 min-h-0 relative">
        <TeamPlaySide
          side="A"
          team={teamA}
          deck={deckA}
          isPlayable={isPlayable}
          stats={statsA}
          liveRank={rankA}
          onAnswerResult={handleAnswerA}
        />

        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-white/90 shadow-sm z-10 pointer-events-none" />

        <TeamPlaySide
          side="B"
          team={teamB}
          deck={deckB}
          isPlayable={isPlayable}
          stats={statsB}
          liveRank={rankB}
          onAnswerResult={handleAnswerB}
        />
      </div>

      {/* Pre-Match 3-2-1 Countdown Overlay */}
      {preCountdown > 0 && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
          <h2 className="font-display text-2xl md:text-4xl font-extrabold mb-6">
            {teamA.name} vs {teamB.name}
          </h2>
          <div className="w-32 h-32 rounded-3xl bg-sky-600 border-4 border-white/60 flex items-center justify-center font-mono-num text-7xl font-extrabold shadow-2xl animate-pop-in">
            {preCountdown}
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !matchEnded && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white">
          <div className="glass-dark rounded-3xl p-8 flex flex-col items-center gap-5">
            <h2 className="font-display text-3xl font-extrabold">Dijeda</h2>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="ifp-pop-btn px-7 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-base font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <Play size={18} fill="currentColor" />
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* Match Complete Summary Modal (Scores & Turns ONLY — zero right/wrong reveal) */}
      {matchEnded && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
          <div className="glass-panel rounded-3xl w-full max-w-2xl p-6 md:p-8 flex flex-col gap-6 animate-pop-in">
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 border-b-4 border-amber-600 text-slate-950 flex items-center justify-center">
                <Trophy size={28} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">
                {statsA.score === statsB.score
                  ? 'Skor Imbang!'
                  : statsA.score > statsB.score
                  ? `Pemenang: ${teamA.name}`
                  : `Pemenang: ${teamB.name}`}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { team: teamA, stats: statsA, isWinner: statsA.score > statsB.score },
                { team: teamB, stats: statsB, isWinner: statsB.score > statsA.score },
              ].map(({ team, stats, isWinner }) => (
                <div
                  key={team.id}
                  className={`rounded-2xl border-2 p-5 flex items-center justify-between gap-3 bg-white/85 ${
                    isWinner ? 'border-amber-400 shadow-md' : 'border-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamEmblem emblem={team.theme.emblem} color={team.theme.primary} size="md" />
                    <div className="min-w-0">
                      <div className="font-display text-lg font-extrabold text-slate-900 truncate">
                        {team.name}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {stats.turns} giliran
                      </div>
                    </div>
                  </div>
                  <div
                    className="font-mono-num text-4xl font-extrabold"
                    style={{ color: team.theme.primary }}
                  >
                    {stats.score}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-1">
              {isKnockoutTie ? (
                <button
                  type="button"
                  onClick={handleSuddenOvertime}
                  className="ifp-pop-btn px-7 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 text-slate-950 text-base font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={18} />
                  Babak Tambahan 15 Detik
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onCompleteMatch({
                      matchId: match.id,
                      scoreA: statsA.score,
                      scoreB: statsB.score,
                      correctA: statsA.correct,
                      correctB: statsB.correct,
                      wrongA: statsA.wrong,
                      wrongB: statsB.wrong,
                      turnsA: statsA.turns,
                      turnsB: statsB.turns,
                      bestStreakA: statsA.bestStreak,
                      bestStreakB: statsB.bestStreak,
                    })
                  }
                  className="ifp-pop-btn px-8 py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-base font-extrabold cursor-pointer"
                >
                  Simpan Skor & Lanjut
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
