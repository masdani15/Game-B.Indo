import React from 'react';
import {
  Maximize2,
  Minimize2,
  Play,
  SlidersHorizontal,
  Sparkles,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-react';
import arenaHeroImg from '../assets/images/arena_hero_classroom_1795397636381.jpg';
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

  const formatDisplayMap: Record<TournamentConfig['questionFormat'], string> = {
    all: 'Semua Bentuk',
    pilihan_ganda: 'Pilihan Ganda',
    benar_salah: 'Benar / Salah',
    lengkapi_kalimat: 'Isian Rumpang',
    susun_kata: 'Susun Kata',
  };
  const formatDisplay = formatDisplayMap[config.questionFormat];

  const levelDisplay =
    config.levelSelection === 'all'
      ? 'Semua (1–6)'
      : config.levelSelection === 'progressive'
      ? 'Berjenjang'
      : `Kelas ${config.levelSelection}`;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col tv-stage-grid text-white">
      {/* TV Studio Spotlights */}
      <div
        className="pointer-events-none fixed -top-40 -left-24 w-[520px] h-[520px] rounded-full bg-sky-500/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -top-32 right-0 w-[520px] h-[520px] rounded-full bg-amber-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/25 blur-3xl"
        aria-hidden="true"
      />

      {/* TV Broadcast Top Bar */}
      <header className="relative z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto glass-studio rounded-2xl px-5 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Tv size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm md:text-base font-extrabold tracking-tight text-white truncate">
                KUIS ESTAFET TV · BAHASA INDONESIA
              </div>
              <div className="text-[11px] font-semibold text-sky-300 truncate">
                SD Anugerah Abadi 1 Bengalon · Afri Dani Saputra
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleMute}
              className="ifp-pop-btn px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 border-b-4 border-b-slate-950/60 text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              aria-label={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              {isMuted ? 'Bisukan' : 'Suara'}
            </button>

            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`ifp-pop-btn px-3.5 py-2 rounded-xl border-2 border-b-4 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-400 border-amber-600 text-slate-950'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 border-b-slate-950/60 text-white'
              }`}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              {isFullscreen ? 'Keluar Penuh' : 'Layar Penuh'}
            </button>

            <button
              type="button"
              onClick={onOpenAdminSettings}
              className="ifp-pop-btn px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              Panel Pengaturan
            </button>
          </div>
        </div>
      </header>

      {/* Main TV Show Opening Stage */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-5 md:py-8 flex flex-col justify-center gap-6">
        <section className="glass-studio rounded-3xl p-6 md:p-10 border border-amber-300/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ifp-pop-card">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-amber-300">
              <Sparkles size={15} />
              Panggung Kompetisi Layar Sentuh IFP
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
              Estafet Cerdas{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-sky-300">
                Bahasa Indonesia
              </span>
            </h1>

            {/* Compact 5-Metric TV Stage Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                <div className="text-[11px] font-semibold text-sky-200">Kelompok</div>
                <div className="font-display text-base font-extrabold text-white font-mono-num">
                  {config.teamCount} Tim
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                <div className="text-[11px] font-semibold text-sky-200">Materi</div>
                <div className="font-display text-xs font-extrabold text-white truncate">
                  {modeMeta?.shortTitle}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                <div className="text-[11px] font-semibold text-sky-200">Bentuk</div>
                <div className="font-display text-xs font-extrabold text-sky-300 truncate">
                  {formatDisplay}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                <div className="text-[11px] font-semibold text-sky-200">Level</div>
                <div className="font-display text-xs font-extrabold text-amber-300 truncate">
                  {levelDisplay}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-3 col-span-2 sm:col-span-1">
                <div className="text-[11px] font-semibold text-sky-200">Waktu</div>
                <div className="font-display text-base font-extrabold text-white font-mono-num">
                  {config.sessionSeconds}d
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartTournament}
                className="ifp-pop-btn px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 border-b-4 border-amber-600 text-slate-950 text-lg font-extrabold flex items-center gap-3 whitespace-nowrap cursor-pointer shadow-lg"
              >
                <Play size={20} fill="currentColor" />
                Mulai Kompetisi
              </button>

              <button
                type="button"
                onClick={onOpenAdminSettings}
                className="ifp-pop-btn px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 border-b-4 border-b-slate-950/70 text-white text-sm font-extrabold flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <SlidersHorizontal size={16} />
                Pengaturan &amp; Waktu
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl overflow-hidden border-2 border-amber-300/40 ring-4 ring-white/10 shadow-2xl bg-slate-900 aspect-16/10 lg:aspect-4/3">
            <img
              src={arenaHeroImg}
              alt="Siswa SD Anugerah Abadi 1 Bengalon bermain kuis Bahasa Indonesia di layar sentuh IFP"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Studio Contestant Lineup */}
        <section className="glass-studio rounded-3xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-sky-200 px-1">
            <span>Kontestan Terdaftar ({config.teamCount} Kelompok)</span>
            <span className="text-amber-300">
              {config.teamCount % 2 === 1 ? 'Ganjil · 1 Bye Otomatis' : 'Genap'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {Array.from({ length: config.teamCount }).map((_, idx) => {
              const theme = TEAM_THEMES[idx % TEAM_THEMES.length];
              const name = (customTeamNames[idx] ?? '').trim() || `Kelompok ${idx + 1}`;
              const members = teamMembers[idx] ?? [];
              return (
                <div
                  key={`lobby-team-${idx + 1}`}
                  className="rounded-2xl bg-white/95 border border-white px-3 py-2.5 flex items-center gap-2.5 shadow-sm text-slate-900"
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
