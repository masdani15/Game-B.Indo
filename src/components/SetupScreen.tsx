import React from 'react';
import {
  Lock,
  Maximize2,
  Minimize2,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GAME_MODE_META, TEAM_THEMES } from '../data/teamThemes';
import { TournamentConfig } from '../types/game';
import { TeamEmblem } from './TeamEmblem';

interface SetupScreenProps {
  config: TournamentConfig;
  customTeamNames: string[];
  teamMembers: string[][];
  isMuted: boolean;
  isFullscreen: boolean;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onOpenAdminSettings: () => void;
  onStartTournament: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  config,
  customTeamNames,
  teamMembers,
  isMuted,
  isFullscreen,
  onToggleMute,
  onToggleFullscreen,
  onOpenAdminSettings,
  onStartTournament,
}) => {
  const modeMeta = GAME_MODE_META.find((g) => g.id === config.gameMode);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Subtle Luminous Ambient Glows for Glassmorphism */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 w-[460px] h-[460px] rounded-full bg-sky-300/35 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-indigo-300/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-32 left-1/3 w-[420px] h-[420px] rounded-full bg-emerald-200/35 blur-3xl"
        aria-hidden="true"
      />

      {/* Minimalist Glass Top Bar */}
      <header className="relative z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto glass-panel rounded-2xl px-5 py-3 flex items-center justify-between gap-6">
          <span className="font-display text-base md:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Arena Bahasa Indonesia
          </span>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleMute}
              className="ifp-pop-btn px-3.5 py-2 rounded-xl bg-white/85 border-2 border-b-4 border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              aria-label={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              {isMuted ? 'Bisukan' : 'Suara'}
            </button>

            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`ifp-pop-btn px-3.5 py-2 rounded-xl border-2 border-b-4 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-400 border-amber-600 text-slate-950'
                  : 'bg-white/85 border-slate-200 text-slate-800'
              }`}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              {isFullscreen ? 'Keluar Penuh' : 'Layar Penuh'}
            </button>

            <button
              type="button"
              onClick={onOpenAdminSettings}
              className="ifp-pop-btn px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border-b-4 border-slate-950 text-white text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Lock size={14} />
              Panel Pengaturan
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Minimalist Glass Stage */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-6 md:py-10 flex flex-col justify-center gap-6">
        <section className="glass-panel rounded-3xl p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ifp-pop-card">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="text-xs font-bold text-sky-700 flex flex-wrap items-center gap-2">
              <span>SD Anugerah Abadi 1 Bengalon</span>
              <span aria-hidden="true">·</span>
              <span>Afri Dani Saputra</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12] text-balance">
              Estafet Cerdas Bahasa Indonesia
            </h1>

            {/* Compact 4-Metric Glass Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="rounded-2xl bg-white/80 border border-white p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">Kelompok</div>
                <div className="font-display text-lg font-extrabold text-slate-900 font-mono-num">
                  {config.teamCount} Tim
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">Permainan</div>
                <div className="font-display text-sm font-extrabold text-slate-900 truncate">
                  {modeMeta?.shortTitle}
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">Level</div>
                <div className="font-display text-sm font-extrabold text-slate-900">
                  {config.levelSelection === 'progressive'
                    ? 'Berjenjang'
                    : `Kelas ${config.levelSelection}`}
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-3.5 shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500">Waktu</div>
                <div className="font-display text-lg font-extrabold text-slate-900 font-mono-num">
                  {config.sessionSeconds}d
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartTournament}
                className="ifp-pop-btn px-8 py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-lg font-extrabold flex items-center gap-3 whitespace-nowrap cursor-pointer shadow-md"
              >
                <Play size={20} fill="currentColor" />
                Mulai Kompetisi
              </button>

              <button
                type="button"
                onClick={onOpenAdminSettings}
                className="ifp-pop-btn px-5 py-4 rounded-2xl bg-white/90 hover:bg-white border-2 border-b-4 border-slate-200 text-slate-800 text-sm font-extrabold flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Lock size={16} />
                Pengaturan Admin
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl overflow-hidden border-2 border-white shadow-md bg-sky-50 aspect-16/10 lg:aspect-4/3">
            <img
              src="/src/assets/images/arena_hero_classroom_1795397636381.jpg"
              alt="Siswa SD Anugerah Abadi 1 Bengalon bermain kuis Bahasa Indonesia di layar sentuh IFP"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Compact Glass Roster Preview */}
        <section className="glass-panel rounded-3xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span>Peserta Terdaftar ({config.teamCount} Kelompok)</span>
            <span>{config.teamCount % 2 === 1 ? 'Ganjil · 1 Bye Otomatis' : 'Genap'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {Array.from({ length: config.teamCount }).map((_, idx) => {
              const theme = TEAM_THEMES[idx % TEAM_THEMES.length];
              const name = (customTeamNames[idx] ?? '').trim() || `Kelompok ${idx + 1}`;
              const members = teamMembers[idx] ?? [];
              return (
                <div
                  key={`lobby-team-${idx + 1}`}
                  className="rounded-2xl bg-white/80 border border-white px-3 py-2.5 flex items-center gap-2.5 shadow-xs"
                >
                  <TeamEmblem emblem={theme.emblem} color={theme.primary} size="sm" />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-900 truncate">{name}</div>
                    {members.length > 0 && (
                      <div className="text-[11px] text-slate-500 font-mono-num">
                        {members.length} siswa
                      </div>
                    )}
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
