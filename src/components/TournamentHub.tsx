import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Shuffle,
  SlidersHorizontal,
  Trophy,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ByeRecord, MatchPairing, TeamRecord, TournamentConfig } from '../types/game';
import { sortTeamsForLeaderboard } from '../utils/tournamentEngine';
import { TeamEmblem } from './TeamEmblem';

interface TournamentHubProps {
  config: TournamentConfig;
  teams: TeamRecord[];
  matches: MatchPairing[];
  byes: ByeRecord[];
  isMuted: boolean;
  isFullscreen: boolean;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onOpenAdminSettings: () => void;
  onStartMatch: (matchId: string) => void;
  onReshuffleBracket: () => void;
  onViewChampion: () => void;
  onResetToSetup: () => void;
}

export const TournamentHub: React.FC<TournamentHubProps> = ({
  teams,
  matches,
  byes,
  isMuted,
  isFullscreen,
  onToggleMute,
  onToggleFullscreen,
  onOpenAdminSettings,
  onStartMatch,
  onReshuffleBracket,
  onViewChampion,
  onResetToSetup,
}) => {
  const leaderboard = sortTeamsForLeaderboard(teams);
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const nextPlayableMatch = matches.find(
    (m) => m.status === 'pending' && m.teamAId && m.teamBId
  );

  const finalMatch = matches.find((m) => m.stage === 'FINAL');
  const tournamentFinished = finalMatch?.status === 'completed';
  const canReshuffleBracket = matches.every((m) => m.status === 'pending');

  const roundNumbers = Array.from(new Set(matches.map((m) => m.roundNumber))).sort(
    (a, b) => a - b
  );

  const formatLevelLabel = (lvl: MatchPairing['levelUsed']) =>
    lvl === 'all' ? 'Semua Level (1–6)' : `Level ${lvl}`;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col tv-stage-grid text-white">
      {/* TV Studio Spotlights */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 w-[460px] h-[460px] rounded-full bg-sky-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-0 -right-32 w-[480px] h-[480px] rounded-full bg-amber-400/15 blur-3xl"
        aria-hidden="true"
      />

      {/* Broadcast Header */}
      <header className="relative z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto glass-studio rounded-2xl px-5 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onResetToSetup}
              className="ifp-pop-btn px-3.5 py-2 rounded-xl border border-white/25 border-b-4 border-b-slate-950/70 bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft size={15} />
              Beranda
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Tv size={18} className="text-amber-300 shrink-0" />
              <h1 className="font-display text-base md:text-lg font-extrabold text-white truncate">
                Papan Klasemen &amp; Bagan TV ({teams.length} Kelompok)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`ifp-pop-btn px-3 py-2 rounded-xl border-2 border-b-4 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-400 border-amber-600 text-slate-950'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 border-b-slate-950/60 text-white'
              }`}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              {isFullscreen ? 'Keluar' : 'Layar Penuh'}
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className="ifp-pop-btn p-2 rounded-xl border border-white/20 border-b-4 border-b-slate-950/60 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              type="button"
              onClick={onOpenAdminSettings}
              className="ifp-pop-btn px-3.5 py-2 rounded-xl border border-white/20 border-b-4 border-b-slate-950/60 bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              Pengaturan
            </button>

            {canReshuffleBracket && (
              <button
                type="button"
                onClick={onReshuffleBracket}
                className="ifp-pop-btn px-3.5 py-2 rounded-xl border border-white/20 border-b-4 border-b-slate-950/60 bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Shuffle size={14} />
                Undi Lawan
              </button>
            )}

            {nextPlayableMatch && (
              <button
                type="button"
                onClick={() => onStartMatch(nextPlayableMatch.id)}
                className="ifp-pop-btn px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 border-b-4 border-amber-600 text-slate-950 text-sm font-extrabold flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Play size={15} fill="currentColor" />
                Mulai Laga
              </button>
            )}

            {tournamentFinished && (
              <button
                type="button"
                onClick={onViewChampion}
                className="ifp-pop-btn px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 text-slate-950 text-sm font-extrabold flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Trophy size={15} />
                Juara
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live TV Leaderboard (Scores & Wins ONLY) */}
        <section className="lg:col-span-5 glass-panel rounded-3xl p-5 flex flex-col gap-4 ifp-pop-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-slate-900">
              Papan Skor Real-Time
            </h2>
            <span className="text-xs font-extrabold text-sky-700">Klasemen</span>
          </div>

          <div className="divide-y divide-slate-200/70 rounded-2xl overflow-hidden bg-white border border-slate-200 max-h-[560px] overflow-y-auto">
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-900 text-[11px] font-extrabold text-amber-300 uppercase tracking-wider sticky top-0">
              <span className="col-span-1">#</span>
              <span className="col-span-7">Kelompok</span>
              <span className="col-span-2 text-right">Menang</span>
              <span className="col-span-2 text-right">Skor</span>
            </div>

            {leaderboard.map((team, idx) => {
              const rank = idx + 1;
              const isByeThisRound = byes.some(
                (b) =>
                  b.teamId === team.id &&
                  b.roundNumber === Math.max(...roundNumbers, 1)
              );
              return (
                <div
                  key={team.id}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center ${
                    team.eliminated
                      ? 'opacity-55'
                      : rank === 1 && team.totalPoints > 0
                      ? 'bg-amber-50'
                      : ''
                  }`}
                >
                  <div className="col-span-1 font-mono-num text-sm font-extrabold text-slate-700">
                    {rank}
                  </div>
                  <div className="col-span-7 flex items-center gap-2.5 min-w-0">
                    <TeamEmblem emblem={team.theme.emblem} color={team.theme.primary} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 truncate">{team.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 truncate">
                        {team.eliminated
                          ? 'Gugur'
                          : tournamentFinished && rank === 1
                          ? 'Juara Utama'
                          : isByeThisRound
                          ? 'Lolos Otomatis'
                          : 'Aktif'}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-mono-num text-sm font-bold text-slate-700">
                    {team.wins}
                  </div>
                  <div className="col-span-2 text-right font-mono-num text-base font-extrabold text-slate-900">
                    {team.totalPoints}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: TV Broadcast Matchup Cards & Automatic Bye */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {nextPlayableMatch && (
            <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 border-2 border-amber-300/60 border-b-4 border-b-indigo-950 text-white p-6 ifp-pop-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                  {nextPlayableMatch.label} · {formatLevelLabel(nextPlayableMatch.levelUsed)}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold mt-1">
                  {teamMap.get(nextPlayableMatch.teamAId!)?.name}{' '}
                  <span className="text-amber-300 mx-1">VS</span>{' '}
                  {teamMap.get(nextPlayableMatch.teamBId!)?.name}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {canReshuffleBracket && (
                  <button
                    type="button"
                    onClick={onReshuffleBracket}
                    className="ifp-pop-btn px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 border-b-4 border-b-indigo-950 text-white text-sm font-extrabold flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <Shuffle size={16} />
                    Undi Ulang
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onStartMatch(nextPlayableMatch.id)}
                  className="ifp-pop-btn px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 border-b-4 border-amber-600 text-slate-950 text-base font-extrabold flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-lg"
                >
                  <Play size={18} fill="currentColor" />
                  Masuk Panggung
                </button>
              </div>
            </div>
          )}

          {tournamentFinished && (
            <div className="rounded-3xl bg-gradient-to-r from-amber-400 to-yellow-300 border-b-4 border-amber-600 text-slate-950 p-6 ifp-pop-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  Kompetisi Selesai
                </span>
                <h2 className="font-display text-2xl font-extrabold">
                  Juara: {leaderboard[0]?.name}
                </h2>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onViewChampion}
                  className="ifp-pop-btn px-5 py-3 rounded-2xl bg-white border-b-4 border-amber-200 text-slate-900 text-sm font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  <Trophy size={16} />
                  Podium Juara
                </button>
                <button
                  type="button"
                  onClick={onResetToSetup}
                  className="ifp-pop-btn px-4 py-3 rounded-2xl bg-slate-900 border-b-4 border-slate-950 text-white text-sm font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={15} />
                  Baru
                </button>
              </div>
            </div>
          )}

          {roundNumbers.map((roundNum) => {
            const roundMatches = matches.filter((m) => m.roundNumber === roundNum);
            const roundTitle = roundMatches[0]?.stageTitle ?? `Babak ${roundNum}`;
            const roundBye = byes.find((b) => b.roundNumber === roundNum);
            const byeTeam = roundBye ? teamMap.get(roundBye.teamId) : undefined;

            return (
              <div
                key={`round-${roundNum}`}
                className="glass-panel rounded-3xl p-5 flex flex-col gap-3 ifp-pop-card"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-extrabold text-slate-900">
                    {roundTitle}
                  </h3>
                  <span className="text-xs font-mono-num font-bold text-slate-500">
                    {roundMatches.filter((m) => m.status === 'completed').length}/
                    {roundMatches.length}
                  </span>
                </div>

                {byeTeam && (
                  <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamEmblem
                        emblem={byeTeam.theme.emblem}
                        color={byeTeam.theme.primary}
                        size="sm"
                      />
                      <span className="text-sm font-extrabold text-slate-900 truncate">
                        {byeTeam.name}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1 whitespace-nowrap">
                      Lolos Otomatis
                      <ArrowRight size={14} />
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5">
                  {roundMatches.map((m) => {
                    const teamA = m.teamAId ? teamMap.get(m.teamAId) : undefined;
                    const teamB = m.teamBId ? teamMap.get(m.teamBId) : undefined;
                    const readyToPlay = m.status === 'pending' && teamA && teamB;
                    const isNext = nextPlayableMatch?.id === m.id;

                    return (
                      <div
                        key={m.id}
                        className={`rounded-2xl border-2 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white ${
                          isNext ? 'border-sky-500 shadow-sm' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-[125px]">
                            {teamA && (
                              <>
                                <TeamEmblem
                                  emblem={teamA.theme.emblem}
                                  color={teamA.theme.primary}
                                  size="sm"
                                />
                                <span
                                  className={`text-sm font-extrabold truncate ${
                                    m.winnerId === teamA.id
                                      ? 'text-emerald-700'
                                      : m.status === 'completed'
                                      ? 'text-slate-400 line-through'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {teamA.name}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="font-mono-num text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-900 text-amber-300">
                            {m.status === 'completed' ? `${m.scoreA} : ${m.scoreB}` : 'VS'}
                          </div>

                          <div className="flex items-center gap-2 min-w-[125px]">
                            {teamB && (
                              <>
                                <TeamEmblem
                                  emblem={teamB.theme.emblem}
                                  color={teamB.theme.primary}
                                  size="sm"
                                />
                                <span
                                  className={`text-sm font-extrabold truncate ${
                                    m.winnerId === teamB.id
                                      ? 'text-emerald-700'
                                      : m.status === 'completed'
                                      ? 'text-slate-400 line-through'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {teamB.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {readyToPlay && (
                          <button
                            type="button"
                            onClick={() => onStartMatch(m.id)}
                            className={`ifp-pop-btn px-4 py-2.5 rounded-xl border-b-4 text-xs font-extrabold whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                              isNext
                                ? 'bg-sky-600 border-sky-800 text-white'
                                : 'bg-slate-900 border-slate-950 text-white'
                            }`}
                          >
                            <Play size={13} fill="currentColor" />
                            Mainkan
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};
