import { TeamTheme } from '../types/game';

export const TEAM_THEMES: TeamTheme[] = [
  {
    id: 'theme-biru',
    name: 'Tim Garuda',
    primary: '#0284C7',
    lightBg: '#F0F9FF',
    border: '#BAE6FD',
    text: '#0369A1',
    badgeBg: '#E0F2FE',
    emblem: 'garuda',
  },
  {
    id: 'theme-merah',
    name: 'Tim Rajawali',
    primary: '#DC2626',
    lightBg: '#FEF2F2',
    border: '#FECACA',
    text: '#B91C1C',
    badgeBg: '#FEE2E2',
    emblem: 'rajawali',
  },
  {
    id: 'theme-hijau',
    name: 'Tim Komodo',
    primary: '#059669',
    lightBg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#047857',
    badgeBg: '#D1FAE5',
    emblem: 'komodo',
  },
  {
    id: 'theme-emas',
    name: 'Tim Cenderawasih',
    primary: '#D97706',
    lightBg: '#FFFBEB',
    border: '#FDE68A',
    text: '#B45309',
    badgeBg: '#FEF3C7',
    emblem: 'cenderawasih',
  },
  {
    id: 'theme-indigo',
    name: 'Tim Harimau',
    primary: '#4F46E5',
    lightBg: '#EEF2FF',
    border: '#C7D2FE',
    text: '#4338CA',
    badgeBg: '#E0E7FF',
    emblem: 'harimau',
  },
  {
    id: 'theme-teal',
    name: 'Tim Merpati',
    primary: '#0D9488',
    lightBg: '#F0FDFA',
    border: '#99F6E4',
    text: '#0F766E',
    badgeBg: '#CCFBF1',
    emblem: 'merpati',
  },
  {
    id: 'theme-rose',
    name: 'Tim Elang',
    primary: '#E11D48',
    lightBg: '#FFF1F2',
    border: '#FECDD3',
    text: '#BE123C',
    badgeBg: '#FFE4E6',
    emblem: 'elang',
  },
  {
    id: 'theme-slate',
    name: 'Tim Banteng',
    primary: '#334155',
    lightBg: '#F8FAFC',
    border: '#CBD5E1',
    text: '#1E293B',
    badgeBg: '#E2E8F0',
    emblem: 'banteng',
  },
];

export const GAME_MODE_META = [
  {
    id: 'campuran' as const,
    title: 'Estafet Campuran (5 Game)',
    shortTitle: 'Estafet Campuran',
    description:
      'Menggabungkan seluruh 5 jenis game secara acak termasuk Majas & Idiom dalam setiap sesi.',
  },
  {
    id: 'pilihan_cepat' as const,
    title: 'Kilat Kosakata & Pemahaman',
    shortTitle: 'Kilat Kosakata',
    description:
      'Jawab cepat pilihan ganda materi huruf, kata baku, pantun, unsur cerita, dan peribahasa.',
  },
  {
    id: 'rakit_kalimat' as const,
    title: 'Rakit Suku Kata & Kalimat',
    shortTitle: 'Rakit Kalimat',
    description:
      'Sentuh potongan kata atau suku kata secara berurutan menjadi kalimat efektif yang tepat.',
  },
  {
    id: 'detektif_ejaan' as const,
    title: 'Detektif Ejaan & Kalimat Efektif',
    shortTitle: 'Detektif Ejaan',
    description:
      'Temukan kalimat yang paling tepat sesuai kaidah EYD, tanda baca, dan kehematan kata.',
  },
  {
    id: 'padan_kata' as const,
    title: 'Padan Kata, Sinonim & Imbuhan',
    shortTitle: 'Padan Kata',
    description:
      'Tantangan cepat persamaan kata, lawan kata, imbuhan, dan pelengkap peribahasa.',
  },
  {
    id: 'majas_idiom' as const,
    title: 'Tantangan Majas & Idiom (Ungkapan)',
    shortTitle: 'Majas & Idiom',
    description:
      'Tebak jenis gaya bahasa (personifikasi, metafora, hiperbola, simile) serta arti idiom Nusantara.',
  },
];
