import { useState, useMemo } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000/api'

/**
 * useUniversitySearch — tìm kiếm trường ĐH theo ngành AI + điểm thi + khu vực.
 *
 * @param {object} deps
 * @param {object|null} deps.aiResult     - Kết quả AI từ usePersonalityAnalysis
 * @param {array|null}  deps.validGroups  - Danh sách khối thi từ useSubjectGroups
 * @param {function}    deps.calculateGroupScore - Hàm tính điểm từ useSubjectGroups
 */
export function useUniversitySearch({ aiResult, validGroups, calculateGroupScore }) {
  const [universitiesResult, setUniversitiesResult] = useState(null)
  const [region, setRegion]                         = useState('ALL')
  const [uniError, setUniError]                     = useState('')
  const [isLoadingUni, setIsLoadingUni]             = useState(false)

  const handleFindUniversities = async (selectedRegion) => {
    setUniError('')

    if (!validGroups || validGroups.length === 0) {
      setUniError('Vui lòng chọn môn thi ở cột trái để hệ thống xác định khối xét tuyển.')
      return
    }

    const validUserGroups = validGroups
      .map(g => ({ group_id: g.id, code: g.code, ...calculateGroupScore(g) }))
      .filter(g => g.isComplete)

    if (validUserGroups.length === 0) {
      setUniError('Vui lòng nhập điểm hợp lệ cho ít nhất 1 khối thi (đủ 3 môn).')
      return
    }

    if (!aiResult?.suggested_majors?.length) {
      setUniError('Chưa có ngành học đề xuất. Vui lòng phân tích tính cách trước.')
      return
    }

    setRegion(selectedRegion)
    setIsLoadingUni(true)
    try {
      const res  = await fetch(`${API_BASE}/find-universities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_majors:   aiResult.suggested_majors,
          region:      selectedRegion,
          user_groups: validUserGroups.map(g => ({ group_id: g.group_id, score: g.total })),
        }),
      })
      const data = await res.json()
      if (data.status === 'success') setUniversitiesResult(data.data)
      else setUniError(data.message || 'Lỗi không xác định từ server.')
    } catch {
      setUniError('Lỗi khi kết nối với cơ sở dữ liệu tuyển sinh!')
    } finally {
      setIsLoadingUni(false)
    }
  }

  // Gom nhóm kết quả theo ngành → trường (dùng useMemo tránh tính lại không cần thiết)
  const groupedUniversities = useMemo(() => {
    if (!universitiesResult) return null
    const grouped = {}
    universitiesResult.forEach(item => {
      if (!grouped[item.major_name]) grouped[item.major_name] = {}
      const key = `${item.university_code}-${item.university_name}`
      if (!grouped[item.major_name][key]) {
        grouped[item.major_name][key] = {
          uni_name:       item.university_name,
          uni_code:       item.university_code,
          admission_code: item.admission_code,
          details:        [],
        }
      }
      grouped[item.major_name][key].details.push({
        group: item.subject_group,
        score: item.required_score,
        year:  item.year,
      })
    })
    return grouped
  }, [universitiesResult])

  return {
    universitiesResult,
    groupedUniversities,
    region,
    uniError,
    isLoadingUni,
    handleFindUniversities,
  }
}
