import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Flame,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Tv,
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
  team: TeamRecord;
  currentQuestion: QuestionItem | undefined;
  questionNumber: number;
  isPlayable: boolean;
  isFinalTen: boolean;
  stats: SideStats;
  liveRank: number;
  onAnswerAndAdvance: (isCorrect: boolean, pointsEarned: number) => void;
}

const TeamPlaySide: React.FC<TeamPlaySideProps> = ({
  team,
  currentQuestion,
  questionNumber,
  isPlayable,
  isFinalTen,
  stats,
  liveRank,
  onAnswerAndAdvance,
}) => {
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
  }, [questionNumber, currentQuestion?.id]);

  // Neutral transition: NEVER reveals right/wrong, only updates score silently & hands off turn
  const triggerNeutralSubmit = useCallback(
    (isCorrect: boolean) => {
      if (lockedRef.current || !isPlayable) return;
      lockedRef.current = true;

      const nextStreak = isCorrect ? stats.streak + 1 : 0;
      const streakBonus = isCorrect && nextStreak >= 3 ? 5 : 0;
      const pointsEarned = isCorrect ? 10 + streakBonus : 0;

      // Identical neutral crystalline chime regardless of correctness
      soundEngine.playAnswerSubmit();
      onAnswerAndAdvance(isCorrect, pointsEarned);
      setIsTransitioning(true);

      const t1 = window.setTimeout(() => {
        soundEngine.playRelaySwitch();
        setIsTransitioning(false);
        lockedRef.current = false;
      }, 420);

      timersRef.current.push(t1);
    },
    [isPlayable, onAnswerAndAdvance, stats.streak]
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
      className="ifp-touch-zone relative flex-1 flex flex-col justify-between p-4 md:p-5 overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 0%, ${team.theme.primary}38 0%, rgba(10, 20, 48, 0.88) 72%)`,
      }}
    >
      {/* TV Contestant Podium Header: Name, Active Student, Live LED Score ONLY */}
      <div
        className="glass-studio rounded-2xl px-4 py-3 flex items-center justify-between gap-3 border-2"
        style={{
          borderColor: isFinalTen ? 'rgba(248, 113, 113, 0.7)' : `${team.theme.primary}88`,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <TeamEmblem emblem={team.theme.emblem} color={team.theme.primary} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base md:text-lg font-extrabold text-white truncate">
                {team.name}
              </h2>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 whitespace-nowrap">
                #{liveRank}
              </span>
            </div>
            <p className="text-xs font-bold text-amber-300 truncate">
              Pemain Aktif: {activeStudent}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 bg-slate-950/75 border border-white/15 rounded-xl px-3.5 py-1.5 min-w-[78px]">
          <div className="text-[10px] font-extrabold text-sky-300 tracking-widest">SKOR</div>
          <div
            key={stats.score}
            className="font-mono-num text-3xl md:text-4xl font-extrabold leading-none text-amber-300 animate-score-pop"
          >
            {stats.score}
          </div>
        </div>
      </div>

      {/* Main TV Broadcast Question Monitor */}
      <div className="flex-1 flex flex-col justify-center my-3 min-h-0">
        {currentQuestion && (
          <div
            key={`${currentQuestion.id}-${questionNumber}`}
            className="glass-panel rounded-3xl border-2 p-5 md:p-6 ifp-pop-card flex flex-col gap-4 animate-pop-in"
            style={{ borderColor: team.theme.primary }}
          >
            <div className="flex items-center justify-between gap-2 text-xs font-extrabold">
              <span
                className="px-2.5 py-1 rounded-lg text-white"
                style={{ backgroundColor: team.theme.primary }}
              >
                {GAME_TYPE_LABEL[currentQuestion.gameType]}
              </span>
              <span className="font-mono-num text-slate-500">
                Level {currentQuestion.level} · Soal #{questionNumber}
              </span>
            </div>

            <h3 className="font-display text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
              {currentQuestion.prompt}
            </h3>

            {currentQuestion.gameType === 'rakit_kalimat' && currentQuestion.targetTokens ? (
              <div className="flex flex-col gap-3.5">
                <div className="min-h-[68px] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 p-3 flex flex-wrap items-center gap-2">
                  {selectedTokenIndices.length === 0 ? (
                    <span className="text-sm text-slate-400 font-semibold">
                      Susun {currentQuestion.targetTokens.length} bagian jawaban...
                    </span>
                  ) : (
                    selectedTokenIndices.map((poolIdx, orderIdx) => (
                      <button
                        key={`${poolIdx}-${orderIdx}`}
                        type="button"
                        onPointerDown={(e) => handleTokenPointerDown(e, poolIdx)}
                        className="ifp-pop-btn px-4 py-2 rounded-xl bg-indigo-600 border-b-4 border-indigo-900 text-white font-bold text-base md:text-lg"
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
                            ? 'bg-slate-100 border-slate-200 text-slate-300 scale-95'
                            : 'bg-white border-slate-300 text-slate-900 hover:border-sky-400'
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
                      className="ifp-pop-btn min-h-[68px] md:min-h-[76px] px-4 py-3.5 rounded-2xl border-2 border-b-4 border-slate-300 bg-slate-50 hover:bg-white hover:border-sky-400 text-left flex items-center gap-3 cursor-pointer shadow-xs"
                    >
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-extrabold text-base text-white shrink-0 shadow-sm border-b-2 border-black/25"
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

      {/* Neutral TV Studio Wipe Overlay (Zero right/wrong reveal!) */}
      {isTransitioning && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-950/65 backdrop-blur-md text-white animate-pop-in">
          <div className="glass-studio border-2 border-amber-300/60 rounded-3xl px-8 py-6 flex flex-col items-center gap-2 shadow-2xl">
            <Users size={42} strokeWidth={2.2} className="text-amber-300" />
            <div className="font-display text-2xl md:text-3xl font-extrabold text-white">
              Ganti Pemain!
            </div>
            <p className="text-base text-sky-200 font-bold">
              Berikutnya: {activeStudent}
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

  // Separate question indices with live cross-side collision prevention
  const [idxA, setIdxA] = useState<number>(0);
  const [idxB, setIdxB] = useState<number>(() => {
    if (deckB.length > 1 && deckA[0] && deckB[0]?.id === deckA[0].id) {
      return 1;
    }
    return 0;
  });
  const [qNumA, setQNumA] = useState<number>(1);
  const [qNumB, setQNumB] = useState<number>(1);

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

  const currentQuestionA = deckA[idxA % deckA.length];
  const currentQuestionB = deckB[idxB % deckB.length];

  const activeIdARef = useRef<string | undefined>(currentQuestionA?.id);
  const activeIdBRef = useRef<string | undefined>(currentQuestionB?.id);
  activeIdARef.current = currentQuestionA?.id;
  activeIdBRef.current = currentQuestionB?.id;

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

    // Dramatic TV countdown beep every second in the final 10 seconds
    if (timeLeft <= 10) {
      soundEngine.playCountdownSecond(timeLeft);
    }

    const id = window.setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => window.clearTimeout(id);
  }, [preCountdown, isPaused, matchEnded, timeLeft]);

  const handleAnswerA = useCallback(
    (isCorrect: boolean, pointsEarned: number) => {
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

      const delayId = window.setTimeout(() => {
        setIdxA((prev) => {
          const base = prev + 1;
          if (deckA.length <= 1) {
            activeIdARef.current = deckA[base % deckA.length]?.id;
            return base;
          }
          for (let step = 0; step < deckA.length; step++) {
            const candidateIdx = base + step;
            const candidate = deckA[candidateIdx % deckA.length];
            if (candidate && candidate.id !== activeIdBRef.current) {
              activeIdARef.current = candidate.id;
              return candidateIdx;
            }
          }
          activeIdARef.current = deckA[base % deckA.length]?.id;
          return base;
        });
        setQNumA((n) => n + 1);
      }, 420);
      return () => window.clearTimeout(delayId);
    },
    [deckA]
  );

  const handleAnswerB = useCallback(
    (isCorrect: boolean, pointsEarned: number) => {
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

      const delayId = window.setTimeout(() => {
        setIdxB((prev) => {
          const base = prev + 1;
          if (deckB.length <= 1) {
            activeIdBRef.current = deckB[base % deckB.length]?.id;
            return base;
          }
          for (let step = 0; step < deckB.length; step++) {
            const candidateIdx = base + step;
            const candidate = deckB[candidateIdx % deckB.length];
            if (candidate && candidate.id !== activeIdARef.current) {
              activeIdBRef.current = candidate.id;
              return candidateIdx;
            }
          }
          activeIdBRef.current = deckB[base % deckB.length]?.id;
          return base;
        });
        setQNumB((n) => n + 1);
      }, 420);
      return () => window.clearTimeout(delayId);
    },
    [deckB]
  );

  const liveProjectedLeaderboard = useMemo(() => {
    const projected = allTeams.map((t) => {
      if (t.id === teamA.id) {
        return { ...t, totalPoints: t.totalPoints + statsA.score };
      }
      if (t.id === teamB.id) {
        return { ...t, totalPoints: t.totalPoints + statsB.score };
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
  const isFinalTen = timeLeft <= 10 && timeLeft > 0 && preCountdown === 0 && !matchEnded;

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
  const matchLevelText =
    match.levelUsed === 'all' ? 'Semua Level (1–6)' : `Level ${match.levelUsed}`;

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex flex-col ifp-touch-zone relative transition-all duration-300 ${
        isFinalTen ? 'ring-4 ring-inset ring-red-500' : ''
      }`}
    >
      {/* Glowing Crimson Perimeter Vignette during final 10 seconds */}
      {isFinalTen && (
        <div
          className="pointer-events-none fixed inset-0 z-30 shadow-[inset_0_0_95px_rgba(239,68,68,0.68)] animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* TV Quiz Show Broadcast HUD */}
      <header
        className={`px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 z-30 border-b transition-colors duration-300 ${
          isFinalTen
            ? 'bg-red-950/95 border-red-400/70'
            : 'glass-dark border-white/15'
        } text-white`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onExitArena}
            className="ifp-pop-btn px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft size={14} />
            Keluar
          </button>
          <span className="hidden md:flex items-center gap-1.5 text-xs font-extrabold text-amber-300 truncate">
            <Tv size={14} />
            {match.label} · {matchLevelText}
          </span>
        </div>

        {/* Central Giant TV Countdown Clock */}
        <div className="flex items-center gap-3">
          {isFinalTen && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-red-200 animate-pulse">
              <Flame size={15} className="text-red-400" />
              10 Detik Terakhir!
            </span>
          )}
          <div
            className={`font-mono-num text-2xl md:text-4xl font-extrabold px-6 py-1.5 rounded-2xl border-2 transition-all ${
              isFinalTen
                ? 'bg-red-600 border-red-200 text-white animate-tv-red-glow'
                : timeLeft <= 20
                ? 'bg-amber-400 border-amber-200 text-slate-950 shadow-md'
                : 'bg-slate-900/90 border-sky-400/60 text-white shadow-inner'
            }`}
          >
            {formatClock(timeLeft)}
          </div>
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

      {/* Broadcast Tug-of-War Score Meter */}
      <div className="bg-slate-950/90 border-b border-white/15 px-4 md:px-6 py-2 flex flex-col gap-1.5 shrink-0 z-20 text-white">
        <div className="flex items-center justify-between text-xs font-extrabold gap-4">
          <span className="truncate text-sky-200">
            {teamA.name} · <span className="font-mono-num text-amber-300">{statsA.score}</span>
          </span>
          <span className="text-amber-300 whitespace-nowrap font-extrabold tracking-wide">
            {statsA.score === statsB.score
              ? 'SKOR IMBANG'
              : statsA.score > statsB.score
              ? `${teamA.name} UNGGUL +${statsA.score - statsB.score}`
              : `${teamB.name} UNGGUL +${statsB.score - statsA.score}`}
          </span>
          <span className="truncate text-right text-sky-200">
            <span className="font-mono-num text-amber-300">{statsB.score}</span> · {teamB.name}
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full overflow-hidden bg-slate-800 flex border border-white/10">
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
          team={teamA}
          currentQuestion={currentQuestionA}
          questionNumber={qNumA}
          isPlayable={isPlayable}
          isFinalTen={isFinalTen}
          stats={statsA}
          liveRank={rankA}
          onAnswerAndAdvance={handleAnswerA}
        />

        <div
          className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 z-10 pointer-events-none transition-colors ${
            isFinalTen
              ? 'bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.95)]'
              : 'bg-amber-300/70 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
          }`}
        />

        <TeamPlaySide
          team={teamB}
          currentQuestion={currentQuestionB}
          questionNumber={qNumB}
          isPlayable={isPlayable}
          isFinalTen={isFinalTen}
          stats={statsB}
          liveRank={rankB}
          onAnswerAndAdvance={handleAnswerB}
        />
      </div>

      {/* Pre-Match 3-2-1 TV Broadcast Countdown */}
      {preCountdown > 0 && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-300 mb-2">
            Bersiap di Panggung Kuis TV
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold mb-6">
            {teamA.name} <span className="text-amber-300 mx-2">VS</span> {teamB.name}
          </h2>
          <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-300 border-4 border-white text-slate-950 flex items-center justify-center font-mono-num text-7xl font-extrabold shadow-2xl animate-pop-in">
            {preCountdown}
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !matchEnded && (
        <div className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white">
          <div className="glass-studio rounded-3xl border border-amber-300/40 p-8 flex flex-col items-center gap-5">
            <h2 className="font-display text-3xl font-extrabold">Tayangan Dijeda</h2>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="ifp-pop-btn px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 border-b-4 border-amber-600 text-slate-950 text-base font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <Play size={18} fill="currentColor" />
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* Match Complete TV Score Reveal Modal (Scores & Turns ONLY — zero right/wrong reveal) */}
      {matchEnded && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
          <div className="glass-studio border-2 border-amber-300/60 rounded-3xl w-full max-w-2xl p-6 md:p-8 flex flex-col gap-6 animate-pop-in text-white">
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 border-b-4 border-amber-700 text-slate-950 flex items-center justify-center shadow-lg">
                <Trophy size={30} />
              </div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                Hasil Akhir Pertandingan
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">
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
                  className={`rounded-2xl border-2 p-5 flex items-center justify-between gap-3 bg-white text-slate-900 ${
                    isWinner ? 'border-amber-400 ring-4 ring-amber-400/30 shadow-xl' : 'border-white'
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
                  className="ifp-pop-btn px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 border-b-4 border-amber-600 text-slate-950 text-base font-extrabold flex items-center gap-2 cursor-pointer"
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
                  className="ifp-pop-btn px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 border-b-4 border-amber-600 text-slate-950 text-base font-extrabold cursor-pointer shadow-lg"
                >
                  Simpan Skor &amp; Lanjut
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
