import PersonalitySection from './components/PersonalitySection'
import SubjectSection from './components/SubjectSection'
import ResultPanel from './components/ResultPanel'
import { useSubjectGroups } from './hooks/useSubjectGroups'
import { usePersonalityAnalysis } from './hooks/usePersonalityAnalysis'
import { useUniversitySearch } from './hooks/useUniversitySearch'

export default function App() {
  const subjectGroups = useSubjectGroups()
  const personality   = usePersonalityAnalysis()
  const uniSearch     = useUniversitySearch({
    aiResult:            personality.aiResult,
    validGroups:         subjectGroups.validGroups,
    calculateGroupScore: subjectGroups.calculateGroupScore,
  })

  return (
    <div className="min-h-screen pb-16">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-extrabold text-white tracking-tight text-lg">AI Career Navigator</span>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-white/5 border border-white/8 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Hệ thống đang hoạt động
          </span>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="text-center pt-14 pb-10 px-4">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          Powered by Gemini 2.5 Flash + Groq + pgvector RAG
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
          <span className="gradient-text">Khám phá tiềm năng</span>
          <br />
          <span className="text-white">Định hướng tương lai</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Chia sẻ câu chuyện của bạn — AI sẽ phân tích tính cách, đề xuất ngành học
          và tìm trường đại học phù hợp theo điểm thi.
        </p>
      </section>

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column — inputs */}
          <div className="lg:col-span-5 space-y-5">
            <PersonalitySection
              userText={personality.userText}
              setUserText={personality.setUserText}
              handleAnalyzeAI={personality.handleAnalyzeAI}
              isLoadingAi={personality.isLoadingAi}
            />
            <SubjectSection
              optionalSubjects={subjectGroups.optionalSubjects}
              toggleSubject={subjectGroups.toggleSubject}
              subjectScores={subjectGroups.subjectScores}
              handleScoreChange={subjectGroups.handleScoreChange}
              subjectNotice={subjectGroups.subjectNotice}
            />
          </div>

          {/* Right column — results */}
          <div className="lg:col-span-7">
            <ResultPanel
              subjectGroups={subjectGroups}
              personality={personality}
              uniSearch={uniSearch}
            />
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-20 border-t border-white/5 py-8 text-center">
        <p className="text-slate-500 text-sm">
          © 2026 <span className="text-slate-400 font-semibold">AI Career Navigator</span>. Hệ thống định hướng nghề nghiệp thông minh.
        </p>
        <p className="text-slate-600 text-xs mt-1.5">
          Tô Minh Hiến · Nguyễn Thành Duy · Bùi Tuệ Mẫn &nbsp;|&nbsp; Dữ liệu tham khảo từ Bộ GD&ĐT
        </p>
      </footer>
    </div>
  )
}

