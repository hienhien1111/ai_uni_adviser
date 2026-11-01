import { SUGGESTION_CHIPS } from '../constants'

const CHIP_COLOR = {
  indigo:  'bg-indigo-500/10 border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/50',
  emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/50',
  violet:  'bg-violet-500/10 border-violet-500/25 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400/50',
}

export default function PersonalitySection({ userText, setUserText, handleAnalyzeAI, isLoadingAi }) {
  const appendChip = chip => setUserText(prev => prev ? `${prev.trimEnd()}, ${chip}` : chip)
  const isDisabled = isLoadingAi || !userText.trim()

  return (
    <div className="glass p-6 fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-white">1. Hồ Sơ Tính Cách</h2>
          <p className="text-xs text-slate-500 mt-0.5">AI phân tích để đề xuất ngành học phù hợp</p>
        </div>
      </div>

      {/* Tip box */}
      <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-xl px-4 py-3 mb-5 space-y-1.5">
        <p className="text-xs font-semibold text-indigo-300 mb-1">💡 Gợi ý để AI phân tích chính xác hơn:</p>
        <p className="text-xs text-slate-400">• Môn học bạn <strong className="text-slate-300">tự tin nhất</strong> và <strong className="text-slate-300">kém nhất</strong> là gì?</p>
        <p className="text-xs text-slate-400">• Trong nhóm bạn, bạn thường <em className="text-slate-300">thuyết trình, lên ý tưởng hay làm kỹ thuật</em>?</p>
        <p className="text-xs text-slate-400">• Bạn thích làm việc với <strong className="text-slate-300">con người</strong>, <strong className="text-slate-300">số liệu</strong>, hay <strong className="text-slate-300">sáng tạo</strong>?</p>
      </div>

      {/* Suggestion chips */}
      <div className="space-y-3 mb-5">
        {SUGGESTION_CHIPS.map(group => (
          <div key={group.label}>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{group.label}</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {group.chips.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => appendChip(chip)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${CHIP_COLOR[group.color]}`}
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300">Chia sẻ của bạn</label>
          <span className={`text-xs font-medium transition-colors ${userText.length > 50 ? 'text-emerald-400' : 'text-slate-600'}`}>
            {userText.length} ký tự
          </span>
        </div>
        <textarea
          value={userText}
          onChange={e => setUserText(e.target.value)}
          rows={6}
          className="input-dark resize-none leading-relaxed !rounded-xl"
          placeholder="Ví dụ: Mình thích công nghệ và hay mày mò lập trình. Mình tỉ mỉ, kiên nhẫn và giỏi tính toán. Môn tự tin nhất là Toán và Vật lí, kém nhất là Văn..."
        />
        <p className="text-xs text-slate-600 mt-1.5">Viết càng chi tiết, AI phân tích càng chính xác.</p>
      </div>

      {/* CTA button */}
      <button
        onClick={handleAnalyzeAI}
        disabled={isDisabled}
        className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
      >
        {isLoadingAi ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            AI đang phân tích...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Phân Tích Tính Cách Của Tôi
          </>
        )}
      </button>
    </div>
  )
}
