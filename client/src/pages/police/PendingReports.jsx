import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { reportAPI } from '../../api/axios'
import Navbar from '../../components/common/Navbar'

const FILTERS = [
  {v:'',label:'All'},{v:'pending',label:'Pending'},{v:'under_review',label:'Under Review'},
  {v:'verified',label:'Verified'},{v:'rejected',label:'Rejected'},{v:'challan_issued',label:'Challan Issued'}
]

const BADGE = {
  pending:        {label:'Pending',        bg:'rgba(234,179,8,0.12)',  color:'#EAB308'},
  under_review:   {label:'Under Review',   bg:'rgba(192,132,252,0.12)',color:'#C084FC'},
  verified:       {label:'Verified',       bg:'rgba(74,222,128,0.12)', color:'#4ADE80'},
  rejected:       {label:'Rejected',       bg:'rgba(248,113,113,0.12)',color:'#F87171'},
  challan_issued: {label:'Challan Issued', bg:'rgba(249,115,22,0.12)', color:'#F97316'},
}

export default function PendingReports() {
  const [reports, setReports]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [pagination, setPagination] = useState({})
  const [page, setPage]             = useState(1)
  const [searchParams]              = useSearchParams()
  const [filter, setFilter]         = useState(searchParams.get('status')||'')

  useEffect(() => {
    setLoading(true)
    reportAPI.getAll({page,limit:10,status:filter})
      .then(r=>{setReports(r.data.reports);setPagination(r.data.pagination)})
      .catch(console.error).finally(()=>setLoading(false))
  }, [page,filter])

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.wrap}>
        <div style={s.header} className="animate-fadeUp">
          <h1 style={s.title}>Reports</h1>
          <span style={s.count}>{pagination.total||0} total</span>
        </div>

        <div style={s.filters} className="animate-fadeUp delay-1">
          {FILTERS.map(f=>(
            <button key={f.v} onClick={()=>{setFilter(f.v);setPage(1)}}
              style={{...s.pill,...(filter===f.v?s.pillActive:{})}}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.center}><div className="spinner-orange"/></div>
        ) : reports.length===0 ? (
          <div style={s.empty} className="animate-fadeIn">
            <p style={{fontSize:'32px',marginBottom:'8px'}}>📋</p>
            <p style={{color:'#78716C'}}>No reports found</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {reports.map((r,i)=>{
              const badge = BADGE[r.status]||BADGE.pending
              return (
                <Link key={r._id} to={`/police/reports/${r._id}`} style={s.card}
                  className={`animate-fadeUp delay-${Math.min(i+1,4)}`}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(249,115,22,0.4)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='#292524'}>
                  <img src={r.imageUrl} alt="" style={s.thumb}/>
                  <div style={s.info}>
                    <div style={s.row}>
                      <div>
                        <p style={s.plate}>{r.detectedPlate&&r.detectedPlate!=='NOT_DETECTED'?r.detectedPlate:<span style={{color:'#57534E',fontStyle:'italic',fontWeight:'400',fontSize:'13px'}}>Not detected</span>}</p>
                        <p style={s.vehicle}>{r.vehicleType||'Unknown'}</p>
                      </div>
                      <span style={{...s.badge,background:badge.bg,color:badge.color}}>{badge.label}</span>
                    </div>
                    <div style={s.meta}>
                      {r.location?.address&&<span style={s.metaItem}>📍 {r.location.address.slice(0,60)}{r.location.address.length>60?'...':''}</span>}
                      <span style={s.metaItem}>🕐 {new Date(r.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                      {r.reportedBy&&<span style={s.metaItem}>👤 {r.reportedBy.name}</span>}
                    </div>
                    {r.confidence>0&&<span style={s.confBadge}>AI: {r.confidence}%</span>}
                  </div>
                  <span style={{fontSize:'18px',color:'#44403C',flexShrink:0}}>→</span>
                </Link>
              )
            })}

            {pagination.totalPages>1&&(
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
  page:       {minHeight:'100vh',background:'#0C0A09'},
  wrap:       {maxWidth:'900px',margin:'0 auto',padding:'32px 20px'},
  header:     {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'},
  title:      {fontSize:'24px',fontWeight:'600',color:'#FAFAF9'},
  count:      {fontSize:'13px',color:'#57534E',background:'#1C1917',border:'1px solid #292524',padding:'4px 12px',borderRadius:'20px'},
  filters:    {display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'20px'},
  pill:       {padding:'6px 14px',borderRadius:'20px',border:'1px solid #292524',background:'transparent',color:'#78716C',fontSize:'12px',fontWeight:'500',cursor:'pointer',transition:'all 0.15s'},
  pillActive: {background:'rgba(249,115,22,0.12)',borderColor:'rgba(249,115,22,0.4)',color:'#F97316'},
  center:     {display:'flex',justifyContent:'center',padding:'80px 0'},
  empty:      {textAlign:'center',padding:'80px 20px'},
  card:       {background:'#1C1917',border:'1px solid #292524',borderRadius:'14px',padding:'16px',display:'flex',gap:'14px',alignItems:'center',textDecoration:'none',transition:'border-color 0.2s'},
  thumb:      {width:'108px',height:'80px',objectFit:'cover',borderRadius:'10px',flexShrink:0},
  info:       {flex:1,minWidth:0},
  row:        {display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'8px',marginBottom:'8px'},
  plate:      {fontSize:'18px',fontWeight:'700',color:'#FAFAF9',marginBottom:'2px',fontFamily:'monospace',letterSpacing:'1px'},
  vehicle:    {fontSize:'12px',color:'#57534E',textTransform:'capitalize'},
  badge:      {fontSize:'11px',fontWeight:'600',padding:'3px 10px',borderRadius:'6px',whiteSpace:'nowrap'},
  meta:       {display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'6px'},
  metaItem:   {fontSize:'11px',color:'#78716C'},
  confBadge:  {fontSize:'11px',color:'#F97316',background:'rgba(249,115,22,0.1)',padding:'2px 8px',borderRadius:'4px'},
  pagination: {display:'flex',justifyContent:'center',alignItems:'center',gap:'12px',marginTop:'16px'},
  pageBtn:    {background:'#1C1917',border:'1px solid #292524',color:'#A8A29E',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontSize:'13px'},
  pageInfo:   {fontSize:'13px',color:'#78716C'},
}
