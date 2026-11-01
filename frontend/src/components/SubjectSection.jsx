import { SUBJECT_LIST } from '../constants'

export default function SubjectSection({
  optionalSubjects,
  toggleSubject,
  subjectScores,
  handleScoreChange,
  subjectNotice,
}) {
  const activeSubjects = SUBJECT_LIST.filter(
    s => s.id === 1 || s.id === 2 || optionalSubjects.includes(s.id)
  )

  return (
    <div id="admission-profile" className="glass p-6 scroll-mt-6 fade-up" style={{ animationDelay: '0.1s' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-white">2. Hồ Sơ Xét Tuyển</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">
              Tùy chọn
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Nhập khi bạn muốn lọc trường theo khối thi & điểm</p>
        </div>
      </div>

      {/* Compulsory subjects */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Môn Bắt Buộc</p>
        <div className="flex gap-2">
          {SUBJECT_LIST.filter(s => s.isCompulsory).map(sub => (
            <span
              key={sub.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 bg-white/4 border border-white/6 cursor-not-allowed"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              {sub.name}
            </span>
          ))}
        </div>
      </div>

      {/* Optional subjects */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Môn Tự Chọn <span className="normal-case font-normal text-slate-600">(tối đa 2)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_LIST.filter(s => !s.isCompulsory).map(sub => {
            const isSelected = optionalSubjects.includes(sub.id)
            return (
              <button
                key={sub.id}
                onClick={() => toggleSubject(sub.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                  isSelected
                    ? 'bg-violet-500/20 text-violet-200 border-violet-500/40 shadow-sm shadow-violet-500/10'
                    : 'bg-white/4 text-slate-400 border-white/8 hover:border-violet-500/30 hover:text-slate-300 hover:bg-white/7'
                }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {sub.name}
              </button>
            )
          })}
        </div>
        {subjectNotice && (
          <p className="mt-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            {subjectNotice}
          </p>
        )}
      </div>

      {/* Score input grid */}
      <div className="border-t border-white/5 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Điểm Thi Từng Môn</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {activeSubjects.map(sub => (
            <div key={sub.id} className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 text-center truncate" title={sub.name}>
                {sub.name}
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="10"
                value={subjectScores[sub.id] || ''}
                onChange={e => handleScoreChange(sub.id, e.target.value)}
                placeholder="0.0"
                className="input-dark text-center font-bold text-indigo-300 !py-2 !text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
