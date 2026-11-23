import React, { useEffect } from 'react';
import { Award, Maximize2, Minimize2, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import trophyChampionImg from '../assets/images/trophy_champion_emblem_1795397636306.jpg';
import { TeamRecord } from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { sortTeamsForLeaderboard } from '../utils/tournamentEngine';
import { TeamEmblem } from './TeamEmblem';

interface ChampionScreenProps {
  teams: TeamRecord[];
  championTeamId: string | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onBackToHub: () => void;
  onStartNewTournament: () => void;
}

export const ChampionScreen: React.FC<ChampionScreenProps> = ({
  teams,
  championTeamId,
  isFullscreen,
  onToggleFullscreen,
  onBackToHub,
  onStartNewTournament,
}) => {
  const sorted = sortTeamsForLeaderboard(teams);
  const champion =
    (championTeamId ? teams.find((t) => t.id === championTeamId) : undefined) ?? sorted[0];
  const runnersUp = sorted.filter((t) => t.id !== champion?.id);

  useEffect(() => {
    soundEngine.playChampionFanfare();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden tv-stage-grid text-white flex flex-col">
      {/* Golden TV Finale Spotlights */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber-400/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-sky-400/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Minimalist Studio Top Bar */}
      <header className="relative z-20 px-6 pt-4">
        <div className="max-w-6xl mx-auto glass-studio rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
          <span className="font-display text-base md:text-lg font-extrabold tracking-tight text-amber-300 flex items-center gap-2">
            <Trophy size={18} />
            GRAND FINAL · PODIUM JUARA
          </span>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`ifp-pop-btn px-3.5 py-2 rounded-xl border-2 border-b-4 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              isFullscreen
                ? 'bg-amber-400 border-amber-600 text-slate-950'
                : 'bg-white/10 border-white/20 border-b-slate-950/60 text-white'
            }`}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            {isFullscreen ? 'Keluar Penuh' : 'Layar Penuh'}
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Hero Award TV Stage Banner */}
        <section className="glass-studio rounded-3xl border border-amber-300/40 ifp-pop-card p-7 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex justify-center">
            <div className="w-60 h-60 md:w-72 md:h-72 rounded-3xl overflow-hidden border-2 border-amber-300/60 ring-4 ring-amber-400/20 bg-slate-900 shadow-2xl">
              <img
                src={trophyChampionImg}
                alt="Piala Juara 1 Kompetisi Bahasa Indonesia SD Anugerah Abadi 1 Bengalon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-300">
              <Sparkles size={15} />
              Juara Utama Estafet Bahasa Indonesia
            </div>

            <div className="flex items-center gap-4">
              {champion && (
                <TeamEmblem
                  emblem={champion.theme.emblem}
                  color={champion.theme.primary}
                  size="lg"
                />
              )}
              <div>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
                  {champion?.name ?? 'Juara Kelas'}
                </h1>
                <p className="text-sm text-sky-200 mt-1.5 flex flex-wrap items-center gap-2">
                  <span>
                    Total Skor:{' '}
                    <span className="font-mono-num font-extrabold text-amber-300">
                      {champion?.totalPoints ?? 0} poin
                    </span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num font-bold text-white">
                    {champion?.wins ?? 0} menang
                  </span>
                </p>
                {champion && champion.members.length > 0 && (
                  <p className="text-xs font-semibold text-slate-300 mt-1.5">
                    Anggota: {champion.members.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3.5 text-xs font-semibold text-sky-100">
              SD Anugerah Abadi 1 Bengalon · Pembina Kompetisi: Afri Dani Saputra
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onStartNewTournament}
                className="ifp-pop-btn px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 border-b-4 border-amber-600 text-slate-950 text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <RotateCcw size={17} />
                Mulai Turnamen Baru
              </button>
              <button
                type="button"
                onClick={onBackToHub}
                className="ifp-pop-btn px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 border-b-4 border-b-slate-950/70 text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <Trophy size={17} />
                Lihat Bagan &amp; Skor Akhir
              </button>
            </div>
          </div>
        </section>

        {/* Final Scoreboard (Score & Wins Only) */}
        <section className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Award size={20} className="text-amber-600" />
              Rekapitulasi Peringkat
            </h2>
            <span className="text-xs font-semibold text-slate-600">
              SD Anugerah Abadi 1 Bengalon
            </span>
          </div>

          <div className="divide-y divide-slate-200/60 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-900 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              <span className="col-span-2">Peringkat</span>
              <span className="col-span-6">Kelompok</span>
              <span className="col-span-2 text-right">Menang</span>
              <span className="col-span-2 text-right">Total Skor</span>
            </div>

            {[champion, ...runnersUp].filter(Boolean).map((team, idx) => {
              if (!team) return null;
              return (
                <div
                  key={team.id}
                  className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center ${
                    idx === 0 ? 'bg-amber-50' : 'bg-white'
                  }`}
                >
                  <div className="col-span-2 font-mono-num text-base font-extrabold text-slate-800">
                    #{idx + 1}
                  </div>
                  <div className="col-span-6 flex items-center gap-3 min-w-0">
                    <TeamEmblem emblem={team.theme.emblem} color={team.theme.primary} size="sm" />
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-slate-900 truncate">
                        {team.name}
                      </div>
                      {team.members.length > 0 && (
                        <div className="text-[11px] font-medium text-slate-500 truncate">
                          {team.members.join(', ')}
                        </div>
                      )}
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
      </main>
    </div>
  );
};
