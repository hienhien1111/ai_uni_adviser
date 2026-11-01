import { useState, useEffect, useCallback } from 'react'
import { SUBJECT_LIST } from '../constants'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000/api'

/**
 * useSubjectGroups — quản lý môn thi, điểm số và khối xét tuyển hợp lệ.
 *
 * Fix bug cũ: calculateGroupScore dùng subject_ids từ API (int)
 * thay vì parse chuỗi "Toán, Vật lí, ..." — tránh vỡ khi DB thay đổi format.
 */
export function useSubjectGroups() {
  const [optionalSubjects, setOptionalSubjects] = useState([])
  const [subjectScores, setSubjectScores]       = useState({ 1: '', 2: '' })
  const [validGroups, setValidGroups]           = useState(null)
  const [groupError, setGroupError]             = useState('')
  const [isLoadingGroups, setIsLoadingGroups]   = useState(false)
  const [subjectNotice, setSubjectNotice]       = useState('')

  // Re-sync scores khi danh sách môn thay đổi
  useEffect(() => {
    const ids = [1, 2, ...optionalSubjects]
    setSubjectScores(prev => {
      const next = { ...prev }
      ids.forEach(id => { if (next[id] === undefined) next[id] = '' })
      Object.keys(next).forEach(id => { if (!ids.includes(parseInt(id))) delete next[id] })
      return next
    })
    if (optionalSubjects.length >= 1) fetchValidGroups(ids)
    else { setValidGroups(null); setGroupError('') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionalSubjects])

  const fetchValidGroups = async (ids) => {
    setIsLoadingGroups(true)
    setGroupError('')
    try {
      const res  = await fetch(`${API_BASE}/get-valid-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_ids: ids }),
      })
      const data = await res.json()
      if (data.status === 'success') setValidGroups(data.valid_groups)
      else setGroupError(data.message || 'Lỗi không xác định từ server.')
    } catch {
      setGroupError('Không thể kết nối với server. Hãy kiểm tra lại backend đang chạy chưa.')
    } finally {
      setIsLoadingGroups(false)
    }
  }

  const toggleSubject = useCallback((id) => {
    if (optionalSubjects.includes(id)) {
      setSubjectNotice('')
      setOptionalSubjects(prev => prev.filter(s => s !== id))
    } else if (optionalSubjects.length < 2) {
      setSubjectNotice('')
      setOptionalSubjects(prev => [...prev, id])
    } else {
      setSubjectNotice('Bạn chỉ có thể chọn tối đa 2 môn tự chọn. Hãy bỏ chọn một môn trước.')
    }
  }, [optionalSubjects])

  const handleScoreChange = useCallback((id, value) => {
    if (value === '' || (Number(value) >= 0 && Number(value) <= 10)) {
      setSubjectScores(prev => ({ ...prev, [id]: value }))
    }
  }, [])

  /**
   * Tính tổng điểm cho một khối thi.
   * Dùng group.subject_ids (mảng số nguyên từ API) thay vì parse chuỗi description.
   * @param {object} group - Đối tượng khối thi có trường subject_ids: number[]
   */
  const calculateGroupScore = useCallback((group) => {
    const subjectIds = group?.subject_ids ?? []
    if (subjectIds.length === 0) return { total: 0, isComplete: false }

    let total = 0
    let entered = 0
    subjectIds.forEach(id => {
      const s = subjectScores[id]
      if (s !== '' && s !== undefined) {
        total += parseFloat(s)
        entered++
      }
    })
    return {
      total: parseFloat(total.toFixed(2)),
      isComplete: entered === subjectIds.length,
    }
  }, [subjectScores])

  const hasValidGroups = Boolean(validGroups?.length)
  const hasCompleteAdmissionProfile = hasValidGroups && validGroups.some(g => calculateGroupScore(g).isComplete)

  return {
    optionalSubjects,
    subjectScores,
    validGroups,
    groupError,
    isLoadingGroups,
    subjectNotice,
    toggleSubject,
    handleScoreChange,
    calculateGroupScore,
    hasValidGroups,
    hasCompleteAdmissionProfile,
  }
}
