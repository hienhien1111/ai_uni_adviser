import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000/api'

/**
 * usePersonalityAnalysis — quản lý văn bản nhập, gọi AI và kết quả phân tích.
 */
export function usePersonalityAnalysis() {
  const [userText, setUserText]               = useState('')
  const [aiResult, setAiResult]               = useState(null)
  const [aiError, setAiError]                 = useState('')
  const [isLoadingAi, setIsLoadingAi]         = useState(false)
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)
  const [showUniPrompt, setShowUniPrompt]     = useState(false)

  const handleAnalyzeAI = async () => {
    setAiError('')
    setAiResult(null)
    setShowUniPrompt(false)
    setShowDetailedAnalysis(false)

    if (!userText.trim()) {
      setAiError('Vui lòng chia sẻ một chút về bản thân để AI có thể phân tích!')
      return
    }
    setIsLoadingAi(true)
    try {
      const res  = await fetch(`${API_BASE}/analyze-personality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        const advice = data.advice || {}
        setAiResult({
          ui_tags:          data.ui_tags || [],
          summary:          typeof advice === 'object' ? (advice.summary || '') : (advice || ''),
          detailed_analysis: typeof advice === 'object' ? (advice.detailed_analysis || '') : '',
          suggested_majors:  data.ai_majors_list || [],
        })
        setShowUniPrompt(true)
      } else {
        setAiError(data.message || 'Lỗi không xác định từ server.')
      }
    } catch {
      setAiError('Lỗi kết nối đến Server AI!')
    } finally {
      setIsLoadingAi(false)
    }
  }

  return {
    userText,
    setUserText,
    aiResult,
    aiError,
    isLoadingAi,
    showDetailedAnalysis,
    setShowDetailedAnalysis,
    showUniPrompt,
    handleAnalyzeAI,
  }
}
