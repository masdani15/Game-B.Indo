import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Clock,
  GraduationCap,
  Layers,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Shuffle,
  SlidersHorizontal,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { CURRICULUM_GUIDE } from '../data/curriculumGuide';
import { GAME_MODE_META, TEAM_THEMES } from '../data/teamThemes';
import {
  GameModeId,
  LevelSelection,
  QuestionFormatSelection,
  TournamentConfig,
} from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { shuffleArray } from '../utils/tournamentEngine';
import { TeamEmblem } from './TeamEmblem';

interface AdminSettingsModalProps {
  isOpen: boolean;
  config: TournamentConfig;
  customTeamNames: string[];
  teamMembers: string[][];
  isFullscreen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onChangeConfig: (next: Partial<TournamentConfig>) => void;
  onChangeTeamName: (index: number, name: string) => void;
  onResetTeamNames: () => void;
  onSetTeamMembers: (membersByTeam: string[][]) => void;
  onOpenCurriculum: () => void;
}

const PRESET_TEAM_COUNTS = [2, 3, 4, 5, 6, 7, 8, 10, 12];
const SESSION_DURATIONS = [30, 45, 60, 90, 120];
const QUESTION_FORMAT_OPTIONS: Array<{
  id: QuestionFormatSelection;
  label: string;
  hint: string;
}> = [
  { id: 'all', label: 'Semua Bentuk', hint: 'Campur acak semua format' },
  { id: 'pilihan_ganda', label: 'Pilihan Ganda', hint: '4 pilihan A / B / C / D' },
  { id: 'benar_salah', label: 'Benar / Salah', hint: '2 tombol cepat pernyataan' },
  { id: 'lengkapi_kalimat', label: 'Lengkapi Kalimat', hint: 'Isi kata rumpang' },
  { id: 'susun_kata', label: 'Susun Kata', hint: 'Rakit urutan kata/kalimat' },
];

const SAMPLE_STUDENTS = [
  'Ahmad Fauzan',
  'Aisyah Putri',
  'Bagas Pratama',
  'Bunga Lestari',
  'Cahyo Nugroho',
  'Dina Maharani',
  'Edo Saputra',
  'Fitri Handayani',
  'Galih Permana',
  'Hana Salsabila',
  'Indra Wijaya',
  'Jihan Azzahra',
  'Kevin Kurniawan',
  'Laila Rahmawati',
  'Muhammad Rizky',
  'Nadia Kartika',
  'Oki Setiawan',
  'Putri Melati',
  'Rafi Ramadhan',
  'Siti Aminah',
  'Taufik Hidayat',
  'Umi Kalsum',
  'Vino Bastian',
  'Wulan Sari',
  'Yusuf Hakim',
  'Zahra Amelia',
  'Arif Rahman',
  'Bella Safitri',
  'Daffa Alfarizi',
  'Elsa Damayanti',
];

function parseStudentNames(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  config,
  customTeamNames,
  teamMembers,
  isFullscreen,
  onClose,
  onToggleFullscreen,
  onChangeConfig,
  onChangeTeamName,
  onResetTeamNames,
  onSetTeamMembers,
  onOpenCurriculum,
}) => {
  const [studentInput, setStudentInput] = useState('');
  const [generatorNotice, setGeneratorNotice] = useState('');

  const parsedStudents = useMemo(() => parseStudentNames(studentInput), [studentInput]);

  if (!isOpen) return null;

  const distributeStudents = (names: string[], groupCount: number) => {
    if (names.length === 0) return;
    const shuffled = shuffleArray(names);
    const buckets: string[][] = Array.from({ length: groupCount }, () => []);
    shuffled.forEach((studentName, idx) => {
      buckets[idx % groupCount].push(studentName);
    });
    onSetTeamMembers(buckets);
    setGeneratorNotice(`${shuffled.length} siswa diacak ke ${groupCount} kelompok.`);
  };

  const handleTeamCountChange = (nextCount: number) => {
    const clamped = Math.max(2, Math.min(16, nextCount));
    onChangeConfig({ teamCount: clamped });
    if (parsedStudents.length > 0) {
      distributeStudents(parsedStudents, clamped);
    }
  };

  const handleGenerateGroups = () => {
    if (parsedStudents.length === 0) return;
    soundEngine.playAnswerSubmit();
    distributeStudents(parsedStudents, config.teamCount);
  };

  const handleFillSample = () => {
    soundEngine.playTap();
    setStudentInput(SAMPLE_STUDENTS.join('\n'));
    distributeStudents(SAMPLE_STUDENTS, config.teamCount);
  };

  const handleClearStudents = () => {
    soundEngine.playTap();
    setStudentInput('');
    onSetTeamMembers([]);
    setGeneratorNotice('');
  };

  const hasCustomNames = customTeamNames.some(
    (name, idx) => name.trim().length > 0 && name.trim() !== `Kelompok ${idx + 1}`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-settings-title"
    >
      <div className="glass-panel rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-white/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 id="admin-settings-title" className="font-display text-lg font-extrabold text-slate-900">
                Panel Pengaturan Kompetisi
              </h2>
              <p className="text-xs text-slate-500">Afri Dani Saputra · SD Anugerah Abadi 1 Bengalon</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCurriculum}
              className="ifp-pop-btn px-3.5 py-2 rounded-xl bg-white border-2 border-b-4 border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={15} />
              Materi SD
            </button>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`ifp-pop-btn px-3.5 py-2 rounded-xl border-2 border-b-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-400 border-amber-600 text-slate-950'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              {isFullscreen ? 'Keluar Penuh' : 'Layar Penuh'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ifp-pop-btn px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border-b-4 border-slate-950 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={15} />
              Selesai
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Game & Level */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="rounded-2xl bg-white/80 border border-white p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-display text-sm font-extrabold text-slate-900">
                <Layers size={17} className="text-sky-600" />
                Kumpulan Game (Materi)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GAME_MODE_META.map((mode) => {
                  const selected = config.gameMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        const nextMode = mode.id as GameModeId;
                        if (nextMode === 'rakit_kalimat') {
                          onChangeConfig({ gameMode: nextMode, questionFormat: 'susun_kata' });
                        } else if (config.questionFormat === 'susun_kata') {
                          onChangeConfig({ gameMode: nextMode, questionFormat: 'all' });
                        } else {
                          onChangeConfig({ gameMode: nextMode });
                        }
                      }}
                      className={`ifp-pop-btn text-left p-3.5 rounded-2xl border-2 border-b-4 cursor-pointer ${
                        selected
                          ? 'bg-sky-50 border-sky-500 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-display text-sm font-extrabold">{mode.shortTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {mode.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 border border-white p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-display text-sm font-extrabold text-slate-900">
                <ShieldCheck size={17} className="text-indigo-600" />
                Bentuk Soal
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {QUESTION_FORMAT_OPTIONS.map((fmt) => {
                  const selected = config.questionFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => {
                        if (fmt.id === 'susun_kata') {
                          onChangeConfig({ questionFormat: fmt.id, gameMode: 'rakit_kalimat' });
                        } else if (config.gameMode === 'rakit_kalimat' && fmt.id !== 'all') {
                          onChangeConfig({ questionFormat: fmt.id, gameMode: 'campuran' });
                        } else {
                          onChangeConfig({ questionFormat: fmt.id });
                        }
                      }}
                      className={`ifp-pop-btn text-left p-3 rounded-2xl border-2 border-b-4 cursor-pointer ${
                        selected
                          ? 'bg-indigo-50 border-indigo-500 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-display text-xs font-extrabold">{fmt.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {fmt.hint}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 border border-white p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-display text-sm font-extrabold text-slate-900">
                <GraduationCap size={17} className="text-amber-600" />
                Level Materi (Kelas 1–6 SD)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ levelSelection: 'progressive' })}
                  className={`ifp-pop-btn text-left p-3.5 rounded-2xl border-2 border-b-4 cursor-pointer flex items-center justify-between ${
                    config.levelSelection === 'progressive'
                      ? 'bg-amber-50 border-amber-500 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-display text-sm font-extrabold">Berjenjang (1 → 6)</div>
                    <div className="text-[11px] text-slate-500">Naik level tiap babak</div>
                  </div>
                  <span className="text-xs font-bold text-amber-700">
                    {config.levelSelection === 'progressive' ? 'Aktif' : 'Pilih'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeConfig({ levelSelection: 'all' })}
                  className={`ifp-pop-btn text-left p-3.5 rounded-2xl border-2 border-b-4 cursor-pointer flex items-center justify-between ${
                    config.levelSelection === 'all'
                      ? 'bg-indigo-50 border-indigo-500 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-display text-sm font-extrabold">Semua Level</div>
                    <div className="text-[11px] text-slate-500">Campur acak Kelas 1–6</div>
                  </div>
                  <span className="text-xs font-bold text-indigo-700">
                    {config.levelSelection === 'all' ? 'Aktif' : 'Pilih'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {CURRICULUM_GUIDE.map((lvl) => {
                  const selected = config.levelSelection === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() =>
                        onChangeConfig({ levelSelection: lvl.level as LevelSelection })
                      }
                      className={`ifp-pop-btn text-left p-3 rounded-2xl border-2 border-b-4 cursor-pointer ${
                        selected
                          ? 'bg-sky-50 border-sky-500 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-display text-sm font-extrabold">Level {lvl.level}</div>
                      <div className="text-[11px] text-slate-500">{lvl.gradeLabel}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 border border-white p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-display text-sm font-extrabold text-slate-900">
                  <Clock size={17} className="text-emerald-600" />
                  Atur Waktu Tiap Sesi
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig({
                        sessionSeconds: Math.max(15, config.sessionSeconds - 5),
                      })
                    }
                    disabled={config.sessionSeconds <= 15}
                    className="ifp-pop-btn px-2.5 h-8 rounded-lg bg-white border-2 border-b-3 border-slate-200 text-xs font-extrabold text-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    -5d
                  </button>
                  <input
                    type="number"
                    min={15}
                    max={300}
                    step={5}
                    value={config.sessionSeconds}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val)) {
                        onChangeConfig({
                          sessionSeconds: Math.max(15, Math.min(300, Math.round(val))),
                        });
                      }
                    }}
                    aria-label="Durasi sesi dalam detik"
                    className="w-16 text-center font-mono-num text-sm font-extrabold bg-white border-2 border-slate-200 rounded-lg py-1 text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-500">dtk</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeConfig({
                        sessionSeconds: Math.min(300, config.sessionSeconds + 5),
                      })
                    }
                    disabled={config.sessionSeconds >= 300}
                    className="ifp-pop-btn px-2.5 h-8 rounded-lg bg-white border-2 border-b-3 border-slate-200 text-xs font-extrabold text-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    +5d
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {SESSION_DURATIONS.map((sec) => {
                  const active = config.sessionSeconds === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => onChangeConfig({ sessionSeconds: sec })}
                      className={`ifp-pop-btn py-2.5 rounded-2xl border-2 border-b-4 text-xs font-extrabold cursor-pointer ${
                        active
                          ? 'bg-sky-600 border-sky-800 text-white'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {sec}d
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Teams & Student Generator */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="rounded-2xl bg-white/80 border border-white p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Users size={17} className="text-emerald-600" />
                  Jumlah Kelompok
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTeamCountChange(config.teamCount - 1)}
                    disabled={config.teamCount <= 2}
                    className="ifp-pop-btn w-8 h-8 rounded-lg bg-white border-2 border-b-3 border-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                    aria-label="Kurangi kelompok"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono-num text-sm font-extrabold px-2">
                    {config.teamCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTeamCountChange(config.teamCount + 1)}
                    disabled={config.teamCount >= 16}
                    className="ifp-pop-btn w-8 h-8 rounded-lg bg-white border-2 border-b-3 border-slate-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                    aria-label="Tambah kelompok"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEAM_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleTeamCountChange(cnt)}
                    className={`ifp-pop-btn px-3 py-1.5 rounded-xl border-2 border-b-3 text-xs font-extrabold cursor-pointer ${
                      config.teamCount === cnt
                        ? 'bg-slate-900 border-slate-950 text-white'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 border border-white p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <UserPlus size={16} className="text-sky-600" />
                  Generator Siswa
                </span>
                <span className="font-mono-num font-bold text-slate-500">
                  {parsedStudents.length} siswa
                </span>
              </div>

              <textarea
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                rows={3}
                placeholder="Tempel daftar nama siswa (per baris / koma)..."
                className="w-full rounded-xl border-2 border-slate-200 bg-white p-2.5 text-sm focus:outline-none focus:border-sky-500"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateGroups}
                  className="ifp-pop-btn flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shuffle size={14} />
                  Acak Siswa
                </button>
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="ifp-pop-btn py-2.5 px-3 rounded-xl bg-white border-2 border-b-4 border-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Contoh 30
                </button>
                {(studentInput.length > 0 || teamMembers.length > 0) && (
                  <button
                    type="button"
                    onClick={handleClearStudents}
                    className="ifp-pop-btn py-2.5 px-2.5 rounded-xl bg-white border-2 border-b-4 border-slate-200 text-rose-600 cursor-pointer"
                    aria-label="Hapus siswa"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              {generatorNotice && (
                <p className="text-xs font-semibold text-emerald-700">{generatorNotice}</p>
              )}
            </div>

            <div className="rounded-2xl bg-white/80 border border-white p-5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display text-sm font-extrabold text-slate-900">
                  Nama Kelompok
                </span>
                {hasCustomNames && (
                  <button
                    type="button"
                    onClick={onResetTeamNames}
                    className="text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 max-h-[210px] overflow-y-auto pr-1">
                {Array.from({ length: config.teamCount }).map((_, idx) => {
                  const theme = TEAM_THEMES[idx % TEAM_THEMES.length];
                  const members = teamMembers[idx] ?? [];
                  const defaultName = `Kelompok ${idx + 1}`;
                  return (
                    <div
                      key={`admin-team-${idx + 1}`}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200"
                    >
                      <TeamEmblem emblem={theme.emblem} color={theme.primary} size="sm" />
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={customTeamNames[idx] ?? defaultName}
                          onChange={(e) => onChangeTeamName(idx, e.target.value)}
                          placeholder={defaultName}
                          maxLength={24}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                        {members.length > 0 && (
                          <p className="text-[11px] text-slate-500 mt-1 truncate">
                            {members.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
