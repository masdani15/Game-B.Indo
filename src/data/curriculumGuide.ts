import { GradeLevel } from '../types/game';

export interface CurriculumTopicGuide {
  level: GradeLevel;
  gradeLabel: string;
  phaseLabel: string;
  difficultyLabel: string;
  summary: string;
  topics: { title: string; example: string }[];
}

export const CURRICULUM_GUIDE: CurriculumTopicGuide[] = [
  {
    level: 1,
    gradeLabel: 'Kelas 1 SD',
    phaseLabel: 'Fase A · Permulaan',
    difficultyLabel: 'Sangat Mudah',
    summary:
      'Pengenalan huruf vokal & konsonan, pemenggalan suku kata sederhana, benda di sekitar, dan tanda titik/tanya dasar.',
    topics: [
      { title: 'Suku Kata Dasar', example: 'bu-ku, bo-la, me-ja, se-ko-lah' },
      { title: 'Huruf Vokal & Konsonan', example: 'Huruf vokal: a, i, u, e, o' },
      { title: 'Kalimat Sederhana & Tanda Baca', example: 'Ibu memasak nasi. / Siapa namamu?' },
    ],
  },
  {
    level: 2,
    gradeLabel: 'Kelas 2 SD',
    phaseLabel: 'Fase A · Lanjutan',
    difficultyLabel: 'Mudah',
    summary:
      'Huruf kapital pada nama orang dan awal kalimat, kata tanya (apa, siapa, di mana), dan lawan kata dasar.',
    topics: [
      { title: 'Huruf Kapital Nama & Awal Kalimat', example: 'Budi bermain di halaman sekolah.' },
      { title: 'Kata Tanya Dasar', example: 'Di mana rumah Rani? / Siapa yang piket hari ini?' },
      { title: 'Lawan Kata Sederhana', example: 'besar >< kecil, tinggi >< rendah, rajin >< malas' },
    ],
  },
  {
    level: 3,
    gradeLabel: 'Kelas 3 SD',
    phaseLabel: 'Fase B · Awal',
    difficultyLabel: 'Menengah Awal',
    summary:
      'Awalan ber- dan me-, tanda koma dalam perincian, sinonim & antonim umum, serta pengenalan ungkapan/idiom ringan.',
    topics: [
      { title: 'Imbuhan Awal (ber-, me-, di-)', example: 'bermain, membaca, menulis, disiram' },
      { title: 'Tanda Koma untuk Perincian', example: 'Ibu membeli apel, jeruk, dan mangga.' },
      { title: 'Idiom / Ungkapan Dasar', example: 'buah tangan (oleh-oleh), kutu buku (gemar membaca)' },
    ],
  },
  {
    level: 4,
    gradeLabel: 'Kelas 4 SD',
    phaseLabel: 'Fase B · Lanjutan',
    difficultyLabel: 'Menengah Lanjut',
    summary:
      'Kata depan (di, ke, dari) vs imbuhan, kalimat efektif sederhana, struktur pantun, serta majas personifikasi & idiom populer.',
    topics: [
      { title: 'Kata Depan vs Imbuhan', example: 'di rumah (dipisah) vs ditulis (digabung)' },
      { title: 'Pantun Anak', example: 'Baris 1–2 sampiran, baris 3–4 isi (sajak a-b-a-b)' },
      { title: 'Majas & Idiom Awal', example: 'Ombak menari di pantai (personifikasi) · rendah hati (tidak sombong)' },
    ],
  },
  {
    level: 5,
    gradeLabel: 'Kelas 5 SD',
    phaseLabel: 'Fase C · Awal',
    difficultyLabel: 'Menantang',
    summary:
      'Kata baku sesuai KBBI, kalimat langsung dengan tanda petik, konfiks, serta ragam majas (personifikasi, metafora, hiperbola, simile) dan idiom.',
    topics: [
      { title: 'Kata Baku & Tidak Baku', example: 'apotek (baku), bukan apotik · jadwal, bukan jadual' },
      { title: 'Majas (Gaya Bahasa)', example: 'Angin berbisik (personifikasi) · Ia bintang kelas (metafora)' },
      { title: 'Idiom / Ungkapan', example: 'banting tulang (kerja keras), gulung tikar (bangkrut)' },
    ],
  },
  {
    level: 6,
    gradeLabel: 'Kelas 6 SD',
    phaseLabel: 'Fase C · Akhir',
    difficultyLabel: 'Juara / HOTS',
    summary:
      'Peribahasa Nusantara, analisis majas (hiperbola, simile, litotes, ironi), idiom lanjutan, serta kalimat efektif pidato dan laporan.',
    topics: [
      { title: 'Peribahasa Indonesia', example: 'Berat sama dipikul, ringan sama dijinjing.' },
      { title: 'Majas Lanjutan', example: 'Suaranya membelah angkasa (hiperbola) · Mampirlah ke gubuk kami (litotes)' },
      { title: 'Idiom Lanjutan', example: 'kambing hitam (pihak yang disalahkan), meja hijau (pengadilan)' },
    ],
  },
];
