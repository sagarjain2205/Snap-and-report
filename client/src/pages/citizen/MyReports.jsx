import { useEffect, useState } from 'react'
import { reportAPI } from '../../api/axios'
import Navbar from '../../components/common/Navbar'

const BADGE = {
  pending:        { label:'Pending',        bg:'rgba(234,179,8,0.12)',  color:'#EAB308' },
  under_review:   { label:'Under Review',   bg:'rgba(192,132,252,0.12)',color:'#C084FC' },
  verified:       { label:'Verified',       bg:'rgba(74,222,128,0.12)', color:'#4ADE80' },
  rejected:       { label:'Rejected',       bg:'rgba(248,113,113,0.12)',color:'#F87171' },
  challan_issued: { label:'Challan Issued', bg:'rgba(249,115,22,0.12)', color:'#F97316' },
}

export default function MyReports() {
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [pagination, setPagination] = useState({})
  const [page, setPage]           = useState(1)

  useEffect(() => {
    setLoading(true)
    reportAPI.getMyReports({ page, limit:10 })
      .then(r => { setReports(r.data.reports); setPagination(r.data.pagination) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.wrap}>
        <div style={s.header} className="animate-fadeUp">
          <h1 style={s.title}>My Reports</h1>
          <p style={s.sub}>{pagination.total||0} reports submitted</p>
        </div>

        {loading ? (
          <div style={s.center}><div className="spinner-orange"/></div>
        ) : reports.length === 0 ? (
          <div style={s.empty} className="animate-fadeIn">
            <p style={{fontSize:'48px',marginBottom:'12px'}}>📋</p>
            <p style={{fontSize:'16px',color:'#FAFAF9',fontWeight:'500',marginBottom:'4px'}}>No reports yet</p>
            <p style={{fontSize:'13px',color:'#57534E'}}>Start by reporting illegal parking!</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {reports.map((r,i) => {
              const badge = BADGE[r.status] || BADGE.pending
              const plate = r.detectedPlate && !['NOT_DETECTED','PLATE_NOT_READABLE','pending'].includes(r.detectedPlate)
              return (
                <div key={r._id} style={s.card} className={`animate-fadeUp delay-${Math.min(i+1,4)}`}>
                  <img src={r.imageUrl} alt="" style={s.thumb}/>
                  <div style={s.info}>
                    <div style={s.row}>
                      <div>
                        <p style={s.plate}>
                          {plate ? r.detectedPlate : <span style={{color:'#57534E',fontStyle:'italic',fontWeight:'400',fontSize:'13px'}}>Detecting plate...</span>}
                        </p>
                        <p style={s.vehicle}>{r.vehicleType||'Vehicle'}</p>
                      </div>
                      <span style={{...s.badge,background:badge.bg,color:badge.color}}>{badge.label}</span>
                    </div>

                    <div style={s.meta}>
                      {r.location?.address && <span style={s.metaItem}>📍 {r.location.address.slice(0,60)}{r.location.address.length>60?'...':''}</span>}
                      <span style={s.metaItem}>🕐 {new Date(r.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                    </div>

                    {r.confidence > 0 && (
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'6px'}}>
                        <div style={s.confBar}><div style={{...s.confFill,width:`${r.confidence}%`}}/></div>
                        <span style={{fontSize:'11px',color:'#78716C'}}>AI: {r.confidence}%</span>
                      </div>
                    )}
                    {r.reviewNote && <p style={s.note}>"{r.reviewNote}"</p>}
                  </div>
                </div>
              )
            })}

            {pagination.totalPages > 1 && (
              <div style={s.pagination}>
                <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{...s.pageBtn,opacity:page<=1?0.4:1}}>← Prev</button>
                <span style={s.pageInfo}>{page} / {pagination.totalPages}</span>
                <button disabled={page>=pagination.totalPages} onClick={()=>setPage(p=>p+1)} style={{...s.pageBtn,opacity:page>=pagination.totalPages?0.4:1}}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page:       { minHeight:'100vh', background:'#0C0A09' },
  wrap:       { maxWidth:'800px', margin:'0 auto', padding:'32px 20px' },
  header:     { marginBottom:'24px' },
  title:      { fontSize:'24px', fontWeight:'600', color:'#FAFAF9', marginBottom:'4px' },
  sub:        { fontSize:'13px', color:'#57534E' },
  center:     { display:'flex', justifyContent:'center', padding:'80px 0' },
  empty:      { textAlign:'center', padding:'80px 20px' },
  card:       { background:'#1C1917', border:'1px solid #292524', borderRadius:'14px', padding:'16px', display:'flex', gap:'14px' },
  thumb:      { width:'96px', height:'80px', objectFit:'cover', borderRadius:'10px', flexShrink:0 },
  info:       { flex:1, minWidth:0 },
  row:        { display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px', marginBottom:'8px' },
  plate:      { fontSize:'18px', fontWeight:'700', color:'#FAFAF9', marginBottom:'2px', fontFamily:'monospace', letterSpacing:'1px' },
  vehicle:    { fontSize:'12px', color:'#57534E', textTransform:'capitalize' },
  badge:      { fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'6px', whiteSpace:'nowrap' },
  meta:       { display:'flex', flexDirection:'column', gap:'4px' },
  metaItem:   { fontSize:'12px', color:'#78716C' },
  confBar:    { width:'80px', height:'4px', background:'#292524', borderRadius:'2px' },
  confFill:   { height:'4px', background:'#F97316', borderRadius:'2px' },
  note:       { fontSize:'12px', color:'#78716C', fontStyle:'italic', marginTop:'4px' },
  pagination: { display:'flex', justifyContent:'center', alignItems:'center', gap:'12px', marginTop:'16px' },
  pageBtn:    { background:'#1C1917', border:'1px solid #292524', color:'#A8A29E', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
  pageInfo:   { fontSize:'13px', color:'#78716C' },
}
