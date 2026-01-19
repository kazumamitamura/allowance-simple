'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

const ADMIN_EMAILS = [
  'mitamuraka@haguroko.ed.jp',
  'tomonoem@haguroko.ed.jp'
].map(email => email.toLowerCase())

export default function ExportPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
        alert('管理者権限がありません')
        router.push('/')
        return
      }
      setIsAdmin(true)
      fetchUsers()
    }
    checkAdmin()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('user_profiles').select('*').order('full_name')
    setUsers(data || [])
  }

  // 個人月次レポート（帳票形式）
  const exportIndividualMonthly = async () => {
    if (!selectedUser) {
      alert('職員を選択してください')
      return
    }

    setLoading(true)
    const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
    
    // データ取得
    const { data: allowances } = await supabase
      .from('allowances')
      .select('*')
      .eq('user_id', selectedUser)
      .gte('date', `${yearMonth}-01`)
      .lte('date', `${yearMonth}-31`)
      .order('date', { ascending: true })

    const user = users.find(u => u.email === selectedUser)
    
    // 合計計算
    const total = allowances?.reduce((sum, item) => sum + item.amount, 0) || 0
    const campDays = allowances?.filter(a => a.activity_type.includes('合宿')).length || 0
    const expeditionDays = allowances?.filter(a => a.activity_type.includes('遠征')).length || 0
    
    // 【帳票レイアウト】1〜3行目: 重要サマリーエリア
    const ws: any = {}
    
    // 1行目: 氏名と支給合計額
    ws['A1'] = { t: 's', v: '氏名' }
    ws['B1'] = { t: 's', v: `${user?.full_name || selectedUser} 様` }
    ws['C1'] = { t: 's', v: '支給合計額' }
    ws['D1'] = { t: 's', v: `¥${total.toLocaleString()}` }
    
    // 2行目: 対象月と合宿/遠征計
    ws['A2'] = { t: 's', v: '対象月' }
    ws['B2'] = { t: 's', v: `${selectedYear}年${selectedMonth}月` }
    ws['C2'] = { t: 's', v: '合宿/遠征計' }
    ws['D2'] = { t: 's', v: `合宿: ${campDays}日 / 遠征: ${expeditionDays}日` }
    
    // 3行目: 空行（データなし）
    
    // 4行目: 空行
    
    // 5行目: 明細ヘッダー
    ws['A5'] = { t: 's', v: '日付' }
    ws['B5'] = { t: 's', v: '手当区分' }
    ws['C5'] = { t: 's', v: '業務内容/備考' }
    ws['D5'] = { t: 's', v: '単価' }
    ws['E5'] = { t: 's', v: '金額' }
    
    // 6行目以降: 明細データ
    let rowIndex = 6
    allowances?.forEach((item) => {
      ws[`A${rowIndex}`] = { t: 's', v: item.date }
      ws[`B${rowIndex}`] = { t: 's', v: item.activity_type }
      
      // 業務内容/備考（詳細、運転、宿泊を結合）
      const remarks = []
      if (item.destination_detail) remarks.push(item.destination_detail)
      if (item.is_driving) remarks.push('運転')
      if (item.is_accommodation) remarks.push('宿泊')
      ws[`C${rowIndex}`] = { t: 's', v: remarks.join(' / ') || '-' }
      
      ws[`D${rowIndex}`] = { t: 'n', v: item.amount }
      ws[`E${rowIndex}`] = { t: 'n', v: item.amount }
      rowIndex++
    })
    
    // 合計行
    ws[`A${rowIndex}`] = { t: 's', v: '合計' }
    ws[`B${rowIndex}`] = { t: 's', v: '' }
    ws[`C${rowIndex}`] = { t: 's', v: '' }
    ws[`D${rowIndex}`] = { t: 's', v: '' }
    ws[`E${rowIndex}`] = { t: 'n', v: total }
    
    // シート範囲設定
    ws['!ref'] = `A1:E${rowIndex}`
    
    // 列幅設定（見やすく）
    ws['!cols'] = [
      { wch: 12 },  // A: 日付
      { wch: 25 },  // B: 手当区分
      { wch: 30 },  // C: 業務内容/備考
      { wch: 12 },  // D: 単価
      { wch: 12 }   // E: 金額
    ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '手当申請書')
    
    // ファイル名: YYYY-MM_手当申請書_[氏名].xlsx
    const fileName = `${yearMonth}_手当申請書_${user?.full_name || selectedUser}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    setLoading(false)
    alert('✅ ダウンロードしました！\n\n帳票形式で出力されています。')
  }

  // 個人年次レポート（帳票形式）
  const exportIndividualYearly = async () => {
    if (!selectedUser) {
      alert('職員を選択してください')
      return
    }

    setLoading(true)
    
    // データ取得
    const { data: allowances } = await supabase
      .from('allowances')
      .select('*')
      .eq('user_id', selectedUser)
      .gte('date', `${selectedYear}-01-01`)
      .lte('date', `${selectedYear}-12-31`)
      .order('date', { ascending: true })

    const user = users.find(u => u.email === selectedUser)
    
    // 月別集計
    const monthlyTotals: Record<number, number> = {}
    allowances?.forEach(item => {
      const month = parseInt(item.date.split('-')[1])
      monthlyTotals[month] = (monthlyTotals[month] || 0) + item.amount
    })

    // 合計計算
    const total = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0)
    const campDays = allowances?.filter(a => a.activity_type.includes('合宿')).length || 0
    const expeditionDays = allowances?.filter(a => a.activity_type.includes('遠征')).length || 0

    // 【帳票レイアウト】1〜3行目: 重要サマリーエリア
    const ws: any = {}
    
    // 1行目: 氏名と支給合計額
    ws['A1'] = { t: 's', v: '氏名' }
    ws['B1'] = { t: 's', v: `${user?.full_name || selectedUser} 様` }
    ws['C1'] = { t: 's', v: '年間支給合計額' }
    ws['D1'] = { t: 's', v: `¥${total.toLocaleString()}` }
    
    // 2行目: 対象年と合宿/遠征計
    ws['A2'] = { t: 's', v: '対象年' }
    ws['B2'] = { t: 's', v: `${selectedYear}年` }
    ws['C2'] = { t: 's', v: '合宿/遠征計' }
    ws['D2'] = { t: 's', v: `合宿: ${campDays}日 / 遠征: ${expeditionDays}日` }
    
    // 5行目: 明細ヘッダー
    ws['A5'] = { t: 's', v: '月' }
    ws['B5'] = { t: 's', v: '件数' }
    ws['C5'] = { t: 's', v: '金額' }
    
    // 6行目以降: 月別データ
    let rowIndex = 6
    for (let i = 0; i < 12; i++) {
      const month = i + 1
      const count = allowances?.filter(a => parseInt(a.date.split('-')[1]) === month).length || 0
      ws[`A${rowIndex}`] = { t: 's', v: `${month}月` }
      ws[`B${rowIndex}`] = { t: 'n', v: count }
      ws[`C${rowIndex}`] = { t: 'n', v: monthlyTotals[month] || 0 }
      rowIndex++
    }
    
    // 合計行
    ws[`A${rowIndex}`] = { t: 's', v: '年間合計' }
    ws[`B${rowIndex}`] = { t: 'n', v: allowances?.length || 0 }
    ws[`C${rowIndex}`] = { t: 'n', v: total }
    
    // シート範囲設定
    ws['!ref'] = `A1:D${rowIndex}`
    
    // 列幅設定
    ws['!cols'] = [
      { wch: 12 },  // A: 月
      { wch: 12 },  // B: 件数
      { wch: 15 },  // C: 金額
      { wch: 20 }   // D: (サマリー用)
    ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '年間集計')
    
    // ファイル名: YYYY_手当年間集計_[氏名].xlsx
    const fileName = `${selectedYear}_手当年間集計_${user?.full_name || selectedUser}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    setLoading(false)
    alert('✅ ダウンロードしました！\n\n帳票形式で出力されています。')
  }

  // 全体月次レポート（帳票形式）
  const exportAllMonthly = async () => {
    setLoading(true)
    const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
    
    // データ取得
    const { data: allowances } = await supabase
      .from('allowances')
      .select('*')
      .gte('date', `${yearMonth}-01`)
      .lte('date', `${yearMonth}-31`)
      .order('user_email')

    // ユーザー別集計
    const userTotals: Record<string, { name: string, count: number, amount: number, camp: number, expedition: number }> = {}
    allowances?.forEach(item => {
      if (!userTotals[item.user_email]) {
        const user = users.find(u => u.email === item.user_email)
        userTotals[item.user_email] = {
          name: user?.full_name || item.user_email,
          count: 0,
          amount: 0,
          camp: 0,
          expedition: 0
        }
      }
      userTotals[item.user_email].count++
      userTotals[item.user_email].amount += item.amount
      if (item.activity_type.includes('合宿')) userTotals[item.user_email].camp++
      if (item.activity_type.includes('遠征')) userTotals[item.user_email].expedition++
    })

    // 合計計算
    const totalCount = Object.values(userTotals).reduce((sum, data) => sum + data.count, 0)
    const totalAmount = Object.values(userTotals).reduce((sum, data) => sum + data.amount, 0)
    const totalCamp = Object.values(userTotals).reduce((sum, data) => sum + data.camp, 0)
    const totalExpedition = Object.values(userTotals).reduce((sum, data) => sum + data.expedition, 0)

    // 【帳票レイアウト】1〜3行目: 重要サマリーエリア
    const ws: any = {}
    
    // 1行目: タイトルと支給合計額
    ws['A1'] = { t: 's', v: '手当全体集計（月次）' }
    ws['C1'] = { t: 's', v: '支給合計額' }
    ws['D1'] = { t: 's', v: `¥${totalAmount.toLocaleString()}` }
    
    // 2行目: 対象月と合宿/遠征計
    ws['A2'] = { t: 's', v: '対象月' }
    ws['B2'] = { t: 's', v: `${selectedYear}年${selectedMonth}月` }
    ws['C2'] = { t: 's', v: '合宿/遠征計' }
    ws['D2'] = { t: 's', v: `合宿: ${totalCamp}日 / 遠征: ${totalExpedition}日` }
    
    // 5行目: 明細ヘッダー
    ws['A5'] = { t: 's', v: '職員名' }
    ws['B5'] = { t: 's', v: '件数' }
    ws['C5'] = { t: 's', v: '金額' }
    ws['D5'] = { t: 's', v: '合宿日数' }
    ws['E5'] = { t: 's', v: '遠征日数' }
    
    // 6行目以降: 職員別データ
    let rowIndex = 6
    Object.entries(userTotals).forEach(([email, data]) => {
      ws[`A${rowIndex}`] = { t: 's', v: data.name }
      ws[`B${rowIndex}`] = { t: 'n', v: data.count }
      ws[`C${rowIndex}`] = { t: 'n', v: data.amount }
      ws[`D${rowIndex}`] = { t: 'n', v: data.camp }
      ws[`E${rowIndex}`] = { t: 'n', v: data.expedition }
      rowIndex++
    })
    
    // 合計行
    ws[`A${rowIndex}`] = { t: 's', v: '合計' }
    ws[`B${rowIndex}`] = { t: 'n', v: totalCount }
    ws[`C${rowIndex}`] = { t: 'n', v: totalAmount }
    ws[`D${rowIndex}`] = { t: 'n', v: totalCamp }
    ws[`E${rowIndex}`] = { t: 'n', v: totalExpedition }
    
    // シート範囲設定
    ws['!ref'] = `A1:E${rowIndex}`
    
    // 列幅設定
    ws['!cols'] = [
      { wch: 20 },  // A: 職員名
      { wch: 10 },  // B: 件数
      { wch: 15 },  // C: 金額
      { wch: 12 },  // D: 合宿日数
      { wch: 12 }   // E: 遠征日数
    ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '全体集計')
    
    // ファイル名: YYYY-MM_全体集計.xlsx
    XLSX.writeFile(wb, `${yearMonth}_全体集計.xlsx`)
    
    setLoading(false)
    alert('✅ ダウンロードしました！\n\n帳票形式で出力されています。')
  }

  // 全体年次レポート（帳票形式）
  const exportAllYearly = async () => {
    setLoading(true)
    
    // データ取得
    const { data: allowances } = await supabase
      .from('allowances')
      .select('*')
      .gte('date', `${selectedYear}-01-01`)
      .lte('date', `${selectedYear}-12-31`)
      .order('user_email')

    // ユーザー別集計
    const userTotals: Record<string, { name: string, count: number, amount: number, camp: number, expedition: number }> = {}
    allowances?.forEach(item => {
      if (!userTotals[item.user_email]) {
        const user = users.find(u => u.email === item.user_email)
        userTotals[item.user_email] = {
          name: user?.full_name || item.user_email,
          count: 0,
          amount: 0,
          camp: 0,
          expedition: 0
        }
      }
      userTotals[item.user_email].count++
      userTotals[item.user_email].amount += item.amount
      if (item.activity_type.includes('合宿')) userTotals[item.user_email].camp++
      if (item.activity_type.includes('遠征')) userTotals[item.user_email].expedition++
    })

    // 合計計算
    const totalCount = Object.values(userTotals).reduce((sum, data) => sum + data.count, 0)
    const totalAmount = Object.values(userTotals).reduce((sum, data) => sum + data.amount, 0)
    const totalCamp = Object.values(userTotals).reduce((sum, data) => sum + data.camp, 0)
    const totalExpedition = Object.values(userTotals).reduce((sum, data) => sum + data.expedition, 0)

    // 【帳票レイアウト】1〜3行目: 重要サマリーエリア
    const ws: any = {}
    
    // 1行目: タイトルと支給合計額
    ws['A1'] = { t: 's', v: '手当年間全体集計' }
    ws['C1'] = { t: 's', v: '年間支給合計額' }
    ws['D1'] = { t: 's', v: `¥${totalAmount.toLocaleString()}` }
    
    // 2行目: 対象年と合宿/遠征計
    ws['A2'] = { t: 's', v: '対象年' }
    ws['B2'] = { t: 's', v: `${selectedYear}年` }
    ws['C2'] = { t: 's', v: '合宿/遠征計' }
    ws['D2'] = { t: 's', v: `合宿: ${totalCamp}日 / 遠征: ${totalExpedition}日` }
    
    // 5行目: 明細ヘッダー
    ws['A5'] = { t: 's', v: '職員名' }
    ws['B5'] = { t: 's', v: '件数' }
    ws['C5'] = { t: 's', v: '金額' }
    ws['D5'] = { t: 's', v: '合宿日数' }
    ws['E5'] = { t: 's', v: '遠征日数' }
    
    // 6行目以降: 職員別データ
    let rowIndex = 6
    Object.entries(userTotals).forEach(([email, data]) => {
      ws[`A${rowIndex}`] = { t: 's', v: data.name }
      ws[`B${rowIndex}`] = { t: 'n', v: data.count }
      ws[`C${rowIndex}`] = { t: 'n', v: data.amount }
      ws[`D${rowIndex}`] = { t: 'n', v: data.camp }
      ws[`E${rowIndex}`] = { t: 'n', v: data.expedition }
      rowIndex++
    })
    
    // 合計行
    ws[`A${rowIndex}`] = { t: 's', v: '合計' }
    ws[`B${rowIndex}`] = { t: 'n', v: totalCount }
    ws[`C${rowIndex}`] = { t: 'n', v: totalAmount }
    ws[`D${rowIndex}`] = { t: 'n', v: totalCamp }
    ws[`E${rowIndex}`] = { t: 'n', v: totalExpedition }
    
    // シート範囲設定
    ws['!ref'] = `A1:E${rowIndex}`
    
    // 列幅設定
    ws['!cols'] = [
      { wch: 20 },  // A: 職員名
      { wch: 10 },  // B: 件数
      { wch: 15 },  // C: 金額
      { wch: 12 },  // D: 合宿日数
      { wch: 12 }   // E: 遠征日数
    ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '年間全体集計')
    
    // ファイル名: YYYY_年間全体集計.xlsx
    XLSX.writeFile(wb, `${selectedYear}_年間全体集計.xlsx`)
    
    setLoading(false)
    alert('✅ ダウンロードしました！\n\n帳票形式で出力されています。')
  }

  if (!isAdmin) return <div className="p-10 text-center">確認中...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* ヘッダー */}
      <div className="bg-green-600 text-white p-4 shadow-md sticky top-0 z-20 flex justify-between items-center">
        <h1 className="font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">📊</span> Excel出力センター
        </h1>
        <button onClick={() => router.push('/admin')} className="text-xs bg-green-700 px-4 py-2 rounded hover:bg-green-800 font-bold border border-green-500">
            ← ダッシュボードへ
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        
        {/* 重要なお知らせ */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>📊 帳票形式で出力されます</strong><br />
            ※出力されるExcelには、氏名・合計金額・合宿/遠征日数がヘッダーに自動で記載されます。<br />
            ※経理担当者がそのまま確認・決済に使用できる帳票レイアウトです。
          </p>
        </div>

        {/* 出力条件設定 */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">出力条件</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">職員（個人レポート用）</label>
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-3 border rounded-lg font-bold text-sm"
              >
                <option value="">選択してください</option>
                {users.map(user => (
                  <option key={user.email} value={user.email}>
                    {user.full_name || user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">年</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full p-3 border rounded-lg font-bold text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">月</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full p-3 border rounded-lg font-bold text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}月</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 出力ボタン */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 個人月次 */}
          <button 
            onClick={exportIndividualMonthly}
            disabled={loading || !selectedUser}
            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-left group border-2 border-transparent hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition">
              個人月次レポート
            </h3>
            <p className="text-slate-500 text-sm mb-3">
              選択した職員の指定月の手当明細を出力
            </p>
            <div className="text-xs text-slate-400">
              {selectedUser ? users.find(u => u.email === selectedUser)?.full_name : '職員未選択'} / {selectedYear}年{selectedMonth}月
            </div>
          </button>

          {/* 個人年次 */}
          <button 
            onClick={exportIndividualYearly}
            disabled={loading || !selectedUser}
            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-left group border-2 border-transparent hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition">
              個人年次レポート
            </h3>
            <p className="text-slate-500 text-sm mb-3">
              選択した職員の年間手当を月別集計
            </p>
            <div className="text-xs text-slate-400">
              {selectedUser ? users.find(u => u.email === selectedUser)?.full_name : '職員未選択'} / {selectedYear}年
            </div>
          </button>

          {/* 全体月次 */}
          <button 
            onClick={exportAllMonthly}
            disabled={loading}
            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-left group border-2 border-transparent hover:border-green-500"
          >
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-green-600 transition">
              全体月次レポート
            </h3>
            <p className="text-slate-500 text-sm mb-3">
              全職員の指定月の手当を集計
            </p>
            <div className="text-xs text-slate-400">
              全職員 / {selectedYear}年{selectedMonth}月
            </div>
          </button>

          {/* 全体年次 */}
          <button 
            onClick={exportAllYearly}
            disabled={loading}
            className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-left group"
          >
            <div className="text-5xl mb-4 text-white">📈</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              全体年次レポート
            </h3>
            <p className="text-green-50 text-sm mb-3">
              全職員の年間手当を集計
            </p>
            <div className="text-xs text-green-100">
              全職員 / {selectedYear}年
            </div>
          </button>

        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-lg font-bold text-slate-800">処理中...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
