import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const REGIONS = ['ALL', 'Bắc', 'Trung', 'Nam']

// ── Custom markdown components — dark-theme styled ─────────────────────────
const MD_COMPONENTS = {
  p: ({ children }) => (
    <p className="text-slate-300 text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="text-white font-bold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-cyan-300 not-italic font-semibold">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="mt-1.5 mb-2 space-y-1.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-1.5 mb-2 space-y-1.5 list-none counter-reset-item">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex gap-2 text-slate-300 text-sm leading-relaxed">
      <span className="text-indigo-400 shrink-0 mt-0.5 select-none">▸</span>
      <span>{children}</span>
    </li>
  ),
  h1: ({ children }) => (
    <h1 className="text-white font-black text-base mt-4 mb-2 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-indigo-200 font-bold text-sm mt-3 mb-1.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-cyan-300 font-semibold text-sm mt-2 mb-1 first:mt-0">{children}</h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-indigo-500/40 pl-3 my-2 text-slate-400 italic text-sm">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-white/8 text-cyan-300 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
  ),
}

// ── Admission groups summary ─────────────────────────────────────────────────
function AdmissionSummary({ validGroups, groupError, isLoadingGroups, calculateGroupScore }) {
  return (
    <div className="glass-light p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Khối Xét Tuyển Hợp Lệ</h3>
        {isLoadingGroups && (
          <span className="text-[10px] text-indigo-400 font-semibold pulse-soft">Đang cập nhật...</span>
        )}
      </div>

      {groupError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{groupError}</p>
      )}
      {!groupError && !validGroups && (
        <p className="text-xs text-slate-600 italic">Chọn môn tự chọn để xem các khối xét tuyển.</p>
      )}
      {validGroups?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {validGroups.map(g => {
            const { total, isComplete } = calculateGroupScore(g)
            return (
              <div key={g.id} className="bg-white/4 border border-white/8 rounded-lg px-3 py-2 min-w-[110px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-indigo-300 text-sm">{g.code}</span>
                  <span className={`text-sm font-black ${isComplete ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {isComplete ? `${total}Đ` : '—'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5 truncate" title={g.description}>{g.description}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── AI result card ────────────────────────────────────────────────────────────
function AIResultCard({ aiResult, showDetailedAnalysis, setShowDetailedAnalysis }) {
  const tags = aiResult?.ui_tags || []
  const summary = aiResult?.summary
  const detailedAnalysis = aiResult?.detailed_analysis
  const suggestedMajors = aiResult?.suggested_majors || []

  return (
    <div className="glass-light p-5 fade-up">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/30 to-indigo-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Góc Nhìn Từ AI</h3>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((t, i) => (
            <span key={i} className="tag bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Summary — render markdown */}
      {summary && (
        <div className="bg-white/3 border border-white/6 rounded-xl px-4 py-3 mb-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
            {summary}
          </ReactMarkdown>
        </div>
      )}

      {/* Toggle detailed analysis */}
      {detailedAnalysis && (
        <button
          onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 mb-3 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetailedAnalysis ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
          {showDetailedAnalysis ? 'Ẩn phân tích chi tiết' : 'Xem phân tích chi tiết'}
        </button>
      )}

      {/* Detailed analysis — render markdown với full styling */}
      {showDetailedAnalysis && detailedAnalysis && (
        <div className="border-t border-white/5 pt-4 mb-4 fade-up space-y-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
            {detailedAnalysis}
          </ReactMarkdown>
        </div>
      )}

      {/* Suggested majors list */}
      {suggestedMajors.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">5 Ngành Đề Xuất</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedMajors.map((m, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-300 bg-white/3 border border-white/6 p-2.5 rounded-xl text-xs font-medium">
                <span className="w-5 h-5 rounded-lg bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-black shrink-0">
                  {i + 1}
                </span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── University list ───────────────────────────────────────────────────────────
function UniversityList({ groupedUniversities, region, handleFindUniversities }) {
  return (
    <div className="fade-up">
      {/* Region filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trường Đại Học Phù Hợp</h3>
        </div>
        <div className="flex bg-white/4 border border-white/8 p-1 rounded-xl gap-1">
          {REGIONS.map(r => (
            <button key={r} onClick={() => handleFindUniversities(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                region === r
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}>
              {r === 'ALL' ? 'Toàn Quốc' : `Miền ${r}`}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(groupedUniversities).length === 0 ? (
        <div className="glass-light p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-amber-400 text-lg">!</span>
          </div>
          <p className="font-bold text-amber-300 mb-1">Chưa tìm thấy trường phù hợp</p>
          <p className="text-slate-500 text-xs">Điểm của bạn chưa đạt mức chuẩn, hoặc ngành này chưa xét khối bạn chọn.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
          {Object.keys(groupedUniversities).map((majorName, mIdx) => (
            <div key={mIdx} className="glass-light overflow-hidden">
              {/* Major header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 bg-indigo-500/5">
                <span className="text-lg">🎯</span>
                <h4 className="font-bold text-white text-sm">{majorName}</h4>
              </div>
              {/* University rows */}
              <div className="divide-y divide-white/4">
                {Object.values(groupedUniversities[majorName]).map((uni, uIdx) => (
                  <div key={uIdx} className="px-4 py-3 hover:bg-white/2 transition-colors">
                    <h5 className="font-bold text-indigo-300 text-sm mb-0.5">{uni.uni_name}</h5>
                    <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-2">
                      {uni.uni_code}{uni.admission_code && ` · Mã ngành: ${uni.admission_code}`}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {uni.details.map((d, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-1.5 bg-white/4 border border-white/8 px-2.5 py-1 rounded-lg text-xs">
                          <span className="font-bold text-slate-300">{d.group}</span>
                          <span className="text-white/15">|</span>
                          <span className="text-emerald-400 font-black">{d.score}</span>
                          <span className="text-slate-600 text-[10px]">({d.year})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── University search prompt ──────────────────────────────────────────────────
function UniversitySearchPrompt({ hasValidGroups, hasCompleteAdmissionProfile, uniError, handleFindUniversities }) {
  const canSearch = hasValidGroups && hasCompleteAdmissionProfile
  const steps = [
    { done: hasValidGroups, readyLabel: 'Đã có khối xét tuyển', actionLabel: 'Chọn 1-2 môn tự chọn' },
    { done: hasCompleteAdmissionProfile, readyLabel: 'Đã đủ điểm cho một khối', actionLabel: 'Nhập đủ điểm cho một khối' },
  ]
  const missing = steps.filter(s => !s.done).map(s => s.actionLabel.toLowerCase())

  return (
    <div className="glass-light p-5 fade-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-white text-base">Xem trường phù hợp với điểm của bạn</h3>
          <p className="text-slate-500 text-xs mt-1">Bước này không bắt buộc. Chọn khu vực để lọc danh sách trường.</p>
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">
          Tùy chọn
        </span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {steps.map(step => (
          <div key={step.readyLabel}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold flex items-center gap-1.5 ${
              step.done
                ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400'
                : 'border-amber-500/20 bg-amber-500/8 text-amber-400'
            }`}
          >
            <span>{step.done ? '✓' : '!'}</span>
            <span>{step.done ? step.readyLabel : step.actionLabel}</span>
          </div>
        ))}
      </div>

      {!canSearch && missing.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400">
          <p className="font-semibold mb-1">Bạn còn thiếu: {missing.join(', ')}.</p>
          <a href="#admission-profile" className="text-amber-300 underline underline-offset-2 font-bold">
            Cập nhật hồ sơ xét tuyển →
          </a>
        </div>
      )}

      {canSearch && (
        <p className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-2.5 text-xs font-semibold text-emerald-400">
          ✓ Hồ sơ đã đủ — chọn khu vực để tìm trường ngay!
        </p>
      )}

      {uniError && (
        <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-400">{uniError}</p>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {REGIONS.map(r => (
          <button key={r} onClick={() => handleFindUniversities(r)} disabled={!canSearch}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              canSearch
                ? 'bg-indigo-500/15 border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400/40'
                : 'bg-white/3 border-white/6 text-slate-600 cursor-not-allowed'
            }`}>
            {r === 'ALL' ? 'Toàn Quốc' : `Miền ${r}`}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Result panel (main export) ────────────────────────────────────────────────
export default function ResultPanel({ subjectGroups, personality, uniSearch }) {
  // Destructure từ grouped hook objects
  const {
    validGroups, groupError, isLoadingGroups, calculateGroupScore,
    hasValidGroups, hasCompleteAdmissionProfile,
  } = subjectGroups

  const {
    aiResult, aiError, isLoadingAi,
    showDetailedAnalysis, setShowDetailedAnalysis,
    showUniPrompt,
  } = personality

  const {
    universitiesResult, groupedUniversities, region,
    uniError, isLoadingUni, handleFindUniversities,
  } = uniSearch

  const admissionSummary = (
    <AdmissionSummary
      validGroups={validGroups}
      groupError={groupError}
      isLoadingGroups={isLoadingGroups}
      calculateGroupScore={calculateGroupScore}
    />
  )

  return (
    <div className="glass p-6 h-full flex flex-col min-h-[480px]">
      <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
        <div className="w-2 h-6 rounded-full bg-gradient-to-b from-indigo-400 to-cyan-400"></div>
        <h2 className="text-lg font-black text-white">Kết Quả Phân Tích</h2>
      </div>

      {/* Pre-analysis state */}
      {!aiResult && <div className="mb-5">{admissionSummary}</div>}

      {/* Error */}
      {aiError && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
          {aiError}
        </div>
      )}

      {/* Loading AI */}
      {isLoadingAi && (
        <div className="flex-grow flex flex-col items-center justify-center py-16 gap-4 fade-up">
          <div className="relative">
            <div className="spinner"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl"></div>
          </div>
          <div className="text-center">
            <p className="text-slate-300 font-bold text-sm">Trí tuệ nhân tạo đang phân tích...</p>
            <p className="text-slate-600 text-xs mt-1">Gemini đang xử lý hồ sơ của bạn</p>
          </div>
        </div>
      )}

      {/* AI results */}
      {aiResult && !isLoadingAi && (
        <div className="flex-grow space-y-5">
          <AIResultCard
            aiResult={aiResult}
            showDetailedAnalysis={showDetailedAnalysis}
            setShowDetailedAnalysis={setShowDetailedAnalysis}
          />

          {admissionSummary}

          {showUniPrompt && !universitiesResult && !isLoadingUni && (
            <UniversitySearchPrompt
              hasValidGroups={hasValidGroups}
              hasCompleteAdmissionProfile={hasCompleteAdmissionProfile}
              uniError={uniError}
              handleFindUniversities={handleFindUniversities}
            />
          )}

          {isLoadingUni && (
            <div className="py-10 text-center fade-up">
              <div className="spinner mx-auto mb-3"></div>
              <p className="text-indigo-400 text-sm font-medium pulse-soft">
                Đang quét điểm chuẩn từ cơ sở dữ liệu...
              </p>
            </div>
          )}

          {universitiesResult && (
            <UniversityList
              groupedUniversities={groupedUniversities}
              region={region}
              handleFindUniversities={handleFindUniversities}
            />
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoadingAi && !aiResult && !aiError && (
        <div className="flex-grow flex flex-col items-center justify-center text-center px-6 py-12">
          <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Nhập chia sẻ của bạn bên trái để nhận gợi ý ngành.
            <br />
            <span className="text-slate-600 text-xs">Hồ sơ xét tuyển chỉ cần khi muốn lọc trường theo điểm.</span>
          </p>
        </div>
      )}
    </div>
  )
}
