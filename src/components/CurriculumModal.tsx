import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { CURRICULUM_GUIDE } from '../data/curriculumGuide';

interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="curriculum-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden animate-pop-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 id="curriculum-modal-title" className="text-lg font-bold text-slate-900">
                Referensi Materi Bahasa Indonesia SD (Kelas 1–6)
              </h2>
              <p className="text-xs text-slate-500">
                Kurikulum Merdeka · Disusun untuk Pembelajaran Interaktif oleh Afri Dani Saputra
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ifp-button p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Tutup panduan materi"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {CURRICULUM_GUIDE.map((item) => (
            <section
              key={item.level}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col gap-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Level {item.level} · {item.gradeLabel}
                </h3>
                <span className="text-xs font-medium text-sky-700 whitespace-nowrap">
                  {item.phaseLabel} · {item.difficultyLabel}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
              <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
                {item.topics.map((t) => (
                  <div key={t.title} className="text-xs leading-relaxed">
                    <span className="font-semibold text-slate-800">{t.title}: </span>
                    <span className="text-slate-600">{t.example}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Bank soal berisi 480 butir soal (80 soal khusus di setiap level 1–6, termasuk Majas &amp; Idiom) tanpa menabrak antarlevel.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="ifp-button px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
