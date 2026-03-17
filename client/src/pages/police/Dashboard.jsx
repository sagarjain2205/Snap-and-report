import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { statsAPI } from '../../api/axios'
import Navbar from '../../components/common/Navbar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{background:'#1C1917',border:'1px solid #292524',borderRadius:'8px',padding:'10px 14px'}}>
      <p style={{color:'#78716C',fontSize:'12px',margin:'0 0 4px'}}>{label}</p>
      <p style={{color:'#F97316',fontWeight:'600',margin:0}}>{payload[0].value} reports</p>
    </div>
  )
}

const getBadge = s => {
  const m = { pending:{bg:'rgba(234,179,8,0.12)',color:'#EAB308'}, verified:{bg:'rgba(74,222,128,0.12)',color:'#4ADE80'}, rejected:{bg:'rgba(248,113,113,0.12)',color:'#F87171'}, challan_issued:{bg:'rgba(249,115,22,0.12)',color:'#F97316'}, under_review:{bg:'rgba(192,132,252,0.12)',color:'#C084FC'} }
  return m[s] || m.pending
}

export default function PoliceDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsAPI.dashboard().then(r => setStats(r.data.stats)).catch(console.error).finally(()=>setLoading(false))
  }, [])

  const chartData = stats?.monthlyReports?.map(item => ({ month: MONTHS[item._id.month-1], reports: item.count })) || []

  if (loading) return <div style={{minHeight:'100vh',background:'#0C0A09'}}><Navbar/><div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}><div className="spinner-orange"/></div></div>

  const statCards = [
    { label:'Total Reports',   value:stats?.totalReports,    color:'#F97316', bg:'rgba(249,115,22,0.1)'  },
    { label:'Pending',         value:stats?.pendingReports,  color:'#EAB308', bg:'rgba(234,179,8,0.1)'   },
    { label:'Verified',        value:stats?.verifiedReports, color:'#4ADE80', bg:'rgba(74,222,128,0.1)'  },
    { label:'Challans Issued', value:stats?.challanIssued,   color:'#C084FC', bg:'rgba(192,132,252,0.1)' },
  ]

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.wrap}>

        <div style={s.header} className="animate-fadeUp">
          <div>
            <h1 style={s.title}>Dashboard</h1>
            <p style={s.sub}>Officer: {user?.name} · Badge: {user?.badgeNumber} · {user?.zone}</p>
          </div>
          <div style={s.onlineBadge}>
            <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4ADE80',display:'inline-block',marginRight:'6px'}}/>
            System Online
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {statCards.map(({label,value,color,bg},i) => (
            <div key={label} style={s.statCard} className={`animate-fadeUp delay-${i+1}`}>
              <div style={{...s.statIcon,background:bg}}>
                <span style={{fontSize:'22px',fontWeight:'700',color}}>{value}</span>
              </div>
              <p style={s.statLabel}>{label}</p>
            </div>
          ))}
        </div>

        <div style={s.mainGrid}>
          {/* Chart */}
          <div style={s.chartCard} className="animate-fadeUp delay-2">
            <h2 style={s.cardTitle}>Reports Trend</h2>
            <p style={{fontSize:'12px',color:'#57534E',marginBottom:'16px'}}>Last 6 months</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{top:5,right:0,left:-20,bottom:0}}
                  barSize={chartData.length<=2?40:chartData.length<=4?32:undefined}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false}/>
                  <XAxis dataKey="month" tick={{fill:'#57534E',fontSize:12}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'#57534E',fontSize:12}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="reports" fill="#F97316" radius={[4,4,0,0]} maxBarSize={52}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'#57534E',fontSize:'13px'}}>No data yet</div>
            )}
          </div>

          {/* Quick actions */}
          <div style={s.actionsCard} className="animate-fadeUp delay-3">
            <h2 style={s.cardTitle}>Quick Actions</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'16px'}}>
              {[
                { to:'/police/reports?status=pending',  label:'Pending Reports',   count:stats?.pendingReports,  color:'#EAB308', bg:'rgba(234,179,8,0.08)'   },
                { to:'/police/reports?status=verified', label:'Ready for Challan', count:stats?.verifiedReports, color:'#4ADE80', bg:'rgba(74,222,128,0.08)'  },
                { to:'/police/challans',                label:'All Challans',      count:stats?.challanIssued,   color:'#F97316', bg:'rgba(249,115,22,0.08)'  },
              ].map(item => (
                <Link key={item.to} to={item.to} style={{...s.actionLink,background:item.bg,borderColor:item.color+'22'}}>
                  <span style={{fontSize:'13px',fontWeight:'500',color:item.color}}>{item.label}</span>
                  <span style={{fontSize:'13px',fontWeight:'700',color:item.color,background:item.color+'15',padding:'2px 10px',borderRadius:'6px'}}>{item.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent */}
        {stats?.recentReports?.length > 0 && (
          <div style={s.recentCard} className="animate-fadeUp delay-4">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
              <h2 style={s.cardTitle}>Recent Reports</h2>
              <Link to="/police/reports" style={{fontSize:'13px',color:'#F97316',textDecoration:'none',fontWeight:'500'}}>View all →</Link>
            </div>
            {stats.recentReports.map(r => {
              const badge = getBadge(r.status)
              return (
                <Link key={r._id} to={`/police/reports/${r._id}`} style={s.recentItem}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(249,115,22,0.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <img src={r.imageUrl} alt="" style={s.recentThumb}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={s.recentPlate}>{r.detectedPlate!=='NOT_DETECTED'?r.detectedPlate:'Detecting...'}</p>
                    <p style={{fontSize:'11px',color:'#57534E',margin:0}}>{r.location?.address?.slice(0,50)||'No location'}</p>
                  </div>
                  <span style={{fontSize:'10px',fontWeight:'600',padding:'3px 8px',borderRadius:'5px',whiteSpace:'nowrap',background:badge.bg,color:badge.color}}>
                    {r.status?.replace('_',' ')}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page:       { minHeight:'100vh', background:'#0C0A09' },
  wrap:       { maxWidth:'1200px', margin:'0 auto', padding:'32px 20px' },
  header:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' },
  title:      { fontSize:'24px', fontWeight:'600', color:'#FAFAF9', marginBottom:'4px' },
  sub:        { fontSize:'13px', color:'#57534E' },
  onlineBadge:{ display:'flex', alignItems:'center', fontSize:'12px', fontWeight:'500', color:'#4ADE80', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.15)', padding:'6px 14px', borderRadius:'20px' },
  statsGrid:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' },
  statCard:   { background:'#1C1917', border:'1px solid #292524', borderRadius:'14px', padding:'20px', textAlign:'center' },
  statIcon:   { width:'56px', height:'56px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' },
  statLabel:  { fontSize:'12px', color:'#57534E', fontWeight:'500' },
  mainGrid:   { display:'grid', gridTemplateColumns:'1fr 320px', gap:'16px', marginBottom:'16px' },
  chartCard:  { background:'#1C1917', border:'1px solid #292524', borderRadius:'16px', padding:'24px' },
  actionsCard:{ background:'#1C1917', border:'1px solid #292524', borderRadius:'16px', padding:'24px' },
  cardTitle:  { fontSize:'16px', fontWeight:'600', color:'#FAFAF9' },
  actionLink: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:'10px', border:'1px solid', textDecoration:'none' },
  recentCard: { background:'#1C1917', border:'1px solid #292524', borderRadius:'16px', padding:'24px' },
  recentItem: { display:'flex', alignItems:'center', gap:'12px', padding:'10px', borderRadius:'10px', textDecoration:'none', transition:'background 0.15s', cursor:'pointer' },
  recentThumb:{ width:'44px', height:'40px', objectFit:'cover', borderRadius:'8px', flexShrink:0 },
  recentPlate:{ fontSize:'14px', fontWeight:'600', color:'#FAFAF9', marginBottom:'2px', fontFamily:'monospace' },
}
