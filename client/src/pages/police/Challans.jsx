import { useEffect, useState } from 'react'
import { challanAPI } from '../../api/axios'
import Navbar from '../../components/common/Navbar'
import toast from 'react-hot-toast'

export default function Challans() {
  const [challans, setChallans]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [pagination, setPagination] = useState({})
  const [page, setPage]             = useState(1)
  const [filter, setFilter]         = useState('')

  const fetchData = () => {
    setLoading(true)
    challanAPI.getAll({page,limit:10,paymentStatus:filter})
      .then(r=>{setChallans(r.data.challans);setPagination(r.data.pagination)})
      .catch(console.error).finally(()=>setLoading(false))
  }

  useEffect(()=>{ fetchData() },[page,filter])

  const handlePDF = async c => {
    try {
      const r = await challanAPI.downloadPDF(c._id)
      const url = URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a'); a.href=url; a.download=`challan-${c.challanNumber}.pdf`; a.click()
      toast.success('PDF downloaded!')
    } catch { toast.error('Download failed') }
  }

  const handlePayment = async (id,status) => {
    try { await challanAPI.updatePayment(id,{paymentStatus:status}); toast.success('Updated!'); fetchData() }
    catch { toast.error('Failed') }
  }

  const totalAmt = challans.reduce((s,c)=>s+c.amount,0)
  const paidAmt  = challans.filter(c=>c.paymentStatus==='paid').reduce((s,c)=>s+c.amount,0)

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.wrap}>
        <div style={s.header} className="animate-fadeUp">
          <h1 style={s.title}>Challans</h1>
          <span style={s.count}>{pagination.total||0} total</span>
        </div>

        {/* Summary */}
        <div style={s.summGrid} className="animate-fadeUp delay-1">
          {[
            {label:'Total Challans',   value:pagination.total||0,                          color:'#F97316',bg:'rgba(249,115,22,0.08)' },
            {label:'Amount Collected', value:`₹${paidAmt.toLocaleString()}`,               color:'#4ADE80',bg:'rgba(74,222,128,0.08)' },
            {label:'Pending Amount',   value:`₹${(totalAmt-paidAmt).toLocaleString()}`,    color:'#EAB308',bg:'rgba(234,179,8,0.08)'  },
          ].map(c=>(
            <div key={c.label} style={{...s.summCard,background:c.bg,borderColor:c.color+'20'}}>
              <p style={{fontSize:'22px',fontWeight:'700',color:c.color,marginBottom:'4px'}}>{c.value}</p>
              <p style={{fontSize:'12px',color:'#78716C'}}>{c.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={s.filters} className="animate-fadeUp delay-2">
          {[{v:'',l:'All'},{v:'pending',l:'Pending'},{v:'paid',l:'Paid'},{v:'waived',l:'Waived'}].map(f=>(
            <button key={f.v} onClick={()=>{setFilter(f.v);setPage(1)}}
              style={{...s.pill,...(filter===f.v?s.pillActive:{})}}>
              {f.l}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.center}><div className="spinner-orange"/></div>
        ) : challans.length===0 ? (
          <div style={s.empty}><p style={{fontSize:'32px',marginBottom:'8px'}}>📋</p><p style={{color:'#78716C'}}>No challans found</p></div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {challans.map((c,i)=>{
              const isPaid   = c.paymentStatus==='paid'
              const isWaived = c.paymentStatus==='waived'
              const payStyle = isPaid
                ? {bg:'rgba(74,222,128,0.12)',color:'#4ADE80',label:'Paid'}
                : isWaived
                  ? {bg:'rgba(148,163,184,0.12)',color:'#94A3B8',label:'Waived'}
                  : {bg:'rgba(234,179,8,0.12)',color:'#EAB308',label:'Pending'}

              return (
                <div key={c._id} style={s.card} className={`animate-fadeUp delay-${Math.min(i+1,4)}`}>
                  <div style={s.cardLeft}>
                    {c.reportId?.imageUrl&&<img src={c.reportId.imageUrl} alt="" style={s.thumb}/>}
                    <div style={s.info}>
                      <div style={s.topRow}>
                        <div>
                          <span style={s.plate}>{c.plateNumber}</span>
                          <span style={s.challanNo}>#{c.challanNumber}</span>
                        </div>
                        <span style={{...s.payBadge,background:payStyle.bg,color:payStyle.color}}>{payStyle.label}</span>
                      </div>
                      <p style={s.owner}>{c.ownerName} · {c.vehicleType}</p>
                      <div style={s.meta}>
                        <span style={s.metaItem}>₹{c.amount} · {c.violationType}</span>
                        <span style={s.metaItem}>📍 {c.violationLocation?.slice(0,40)}</span>
                        <span style={s.metaItem}>🕐 {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div style={s.actions}>
                    <button onClick={()=>handlePDF(c)} style={s.pdfBtn}>⬇ PDF</button>
                    {!isPaid&&!isWaived&&(
                      <>
                        <button onClick={()=>handlePayment(c._id,'paid')} style={s.paidBtn}>Mark Paid</button>
                        <button onClick={()=>handlePayment(c._id,'waived')} style={s.waivedBtn}>Waive</button>
                      </>
                    )}
                  </div>
                </div>
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
  wrap:       {maxWidth:'1000px',margin:'0 auto',padding:'32px 20px'},
  header:     {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'},
  title:      {fontSize:'24px',fontWeight:'600',color:'#FAFAF9'},
  count:      {fontSize:'13px',color:'#57534E',background:'#1C1917',border:'1px solid #292524',padding:'4px 12px',borderRadius:'20px'},
  summGrid:   {display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'},
  summCard:   {border:'1px solid',borderRadius:'14px',padding:'20px',textAlign:'center'},
  filters:    {display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap'},
  pill:       {padding:'6px 14px',borderRadius:'20px',border:'1px solid #292524',background:'transparent',color:'#78716C',fontSize:'12px',fontWeight:'500',cursor:'pointer'},
  pillActive: {background:'rgba(249,115,22,0.12)',borderColor:'rgba(249,115,22,0.4)',color:'#F97316'},
  center:     {display:'flex',justifyContent:'center',padding:'80px 0'},
  empty:      {textAlign:'center',padding:'80px 20px'},
  card:       {background:'#1C1917',border:'1px solid #292524',borderRadius:'14px',padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'},
  cardLeft:   {display:'flex',alignItems:'center',gap:'14px',flex:1,minWidth:0},
  thumb:      {width:'80px',height:'64px',objectFit:'cover',borderRadius:'8px',flexShrink:0},
  info:       {flex:1,minWidth:0},
  topRow:     {display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px',marginBottom:'4px'},
  plate:      {fontSize:'18px',fontWeight:'700',color:'#FAFAF9',fontFamily:'monospace',letterSpacing:'1px'},
  challanNo:  {fontSize:'11px',color:'#57534E',marginLeft:'8px'},
  owner:      {fontSize:'12px',color:'#78716C',marginBottom:'4px'},
  meta:       {display:'flex',flexWrap:'wrap',gap:'8px'},
  metaItem:   {fontSize:'11px',color:'#78716C'},
  payBadge:   {fontSize:'11px',fontWeight:'600',padding:'3px 10px',borderRadius:'6px',whiteSpace:'nowrap'},
  actions:    {display:'flex',flexDirection:'column',gap:'6px',flexShrink:0},
  pdfBtn:     {padding:'6px 12px',background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'8px',color:'#F97316',fontSize:'12px',fontWeight:'500',cursor:'pointer'},
  paidBtn:    {padding:'6px 12px',background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.2)',borderRadius:'8px',color:'#4ADE80',fontSize:'12px',fontWeight:'500',cursor:'pointer'},
  waivedBtn:  {padding:'6px 12px',background:'#292524',border:'none',borderRadius:'8px',color:'#78716C',fontSize:'12px',fontWeight:'500',cursor:'pointer'},
  pagination: {display:'flex',justifyContent:'center',alignItems:'center',gap:'12px',marginTop:'16px'},
  pageBtn:    {background:'#1C1917',border:'1px solid #292524',color:'#A8A29E',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontSize:'13px'},
  pageInfo:   {fontSize:'13px',color:'#78716C'},
}
