import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reportAPI, challanAPI } from '../../api/axios'
import Navbar from '../../components/common/Navbar'
import toast from 'react-hot-toast'

const getStatusStyle = s => {
  const m = {pending:{bg:'rgba(234,179,8,0.12)',color:'#EAB308'},under_review:{bg:'rgba(192,132,252,0.12)',color:'#C084FC'},verified:{bg:'rgba(74,222,128,0.12)',color:'#4ADE80'},rejected:{bg:'rgba(248,113,113,0.12)',color:'#F87171'},challan_issued:{bg:'rgba(249,115,22,0.12)',color:'#F97316'}}
  return m[s]||m.pending
}

export default function ReportDetail() {
  const {id} = useParams()
  const navigate = useNavigate()
  const [report, setReport]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [challanLoading, setChallanLoading] = useState(false)
  const [note, setNote]                 = useState('')
  const [showChallan, setShowChallan]   = useState(false)
  const [cf, setCf] = useState({plateNumber:'',violationType:'Illegal Parking',amount:500,notes:'',violationLocation:''})

  useEffect(()=>{
    reportAPI.getById(id).then(r=>{
      const rep = r.data.report
      setReport(rep)
      setCf(prev=>({...prev,plateNumber:rep.detectedPlate!=='NOT_DETECTED'?rep.detectedPlate:'',violationLocation:rep.location?.address||''}))
    }).catch(()=>toast.error('Report not found')).finally(()=>setLoading(false))
  },[id])

  const handleReview = async status => {
    setReviewLoading(true)
    try {
      const res = await reportAPI.review(id,{status,reviewNote:note})
      setReport(res.data.report)
      toast.success(`Report ${status.replace('_',' ')}!`)
      if(status==='verified') setShowChallan(true)
    } catch(err){ toast.error(err.response?.data?.message||'Failed') }
    finally { setReviewLoading(false) }
  }

  const handleChallan = async e => {
    e.preventDefault()
    if(!cf.plateNumber){ toast.error('Enter plate number'); return }
    setChallanLoading(true)
    try {
      const res = await challanAPI.issue({...cf,reportId:id})
      toast.success(`Challan issued! #${res.data.challan.challanNumber}`)
      try {
        const pdf = await challanAPI.downloadPDF(res.data.challan._id)
        const url = URL.createObjectURL(new Blob([pdf.data]))
        const a = document.createElement('a'); a.href=url; a.download=`challan-${res.data.challan.challanNumber}.pdf`; a.click()
      } catch{}
      navigate('/police/challans')
    } catch(err){ toast.error(err.response?.data?.message||'Failed') }
    finally{ setChallanLoading(false) }
  }

  if(loading) return <div style={{minHeight:'100vh',background:'#0C0A09'}}><Navbar/><div style={{display:'flex',justifyContent:'center',padding:'80px'}}><div className="spinner-orange"/></div></div>
  if(!report) return null

  const canReview  = ['pending','under_review'].includes(report.status)
  const canChallan = report.status==='verified'
  const pct = report.confidence||0
  const confColor = pct>70?'#4ADE80':pct>40?'#EAB308':'#F87171'
  const badge = getStatusStyle(report.status)

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.wrap}>
        <button onClick={()=>navigate(-1)} style={s.backBtn}>← Back to Reports</button>

        <div style={s.grid}>
          {/* Left */}
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={s.card} className="animate-fadeUp">
              <img src={report.imageUrl} alt="Evidence" style={s.evidence}/>
              <div style={s.detBox}>
                <div style={s.detRow}><span style={s.detLabel}>Plate Number</span><span style={s.detPlate}>{report.detectedPlate!=='NOT_DETECTED'?report.detectedPlate:'—'}</span></div>
                <div style={s.detRow}><span style={s.detLabel}>Vehicle Type</span><span style={{fontSize:'13px',color:'#A8A29E',textTransform:'capitalize'}}>{report.vehicleType||'Unknown'}</span></div>
                {pct>0&&(
                  <div style={s.detRow}>
                    <span style={s.detLabel}>AI Confidence</span>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={s.confBar}><div style={{...s.confFill,width:`${pct}%`,background:confColor}}/></div>
                      <span style={{fontSize:'13px',fontWeight:'600',color:confColor}}>{pct}%</span>
                    </div>
                  </div>
                )}
                <div style={s.detRow}><span style={s.detLabel}>Status</span><span style={{...s.statusBadge,background:badge.bg,color:badge.color}}>{report.status?.replace('_',' ')}</span></div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={s.card} className="animate-fadeUp delay-1">
              <h2 style={s.cardTitle}>Report Details</h2>
              <div style={{marginTop:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
                {[
                  {icon:'📍',val:report.location?.address||'No location'},
                  {icon:'🕐',val:new Date(report.createdAt).toLocaleString('en-IN')},
                  {icon:'👤',val:`${report.reportedBy?.name} (${report.reportedBy?.email})`},
                ].map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'10px'}}>
                    <span style={{fontSize:'14px',flexShrink:0}}>{item.icon}</span>
                    <span style={{fontSize:'13px',color:'#A8A29E',lineHeight:'1.4'}}>{item.val}</span>
                  </div>
                ))}
                {report.description&&<div style={s.descBox}>"{report.description}"</div>}
              </div>
            </div>

            {canReview&&(
              <div style={s.card} className="animate-fadeUp delay-2">
                <h2 style={s.cardTitle}>Review Report</h2>
                <textarea className="input-dark" rows={2} style={{resize:'none',marginTop:'12px',marginBottom:'12px'}}
                  placeholder="Add review note (optional)..." value={note} onChange={e=>setNote(e.target.value)}/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                  {[
                    {status:'under_review',label:'Review',  bg:'rgba(192,132,252,0.1)',color:'#C084FC',border:'rgba(192,132,252,0.2)'},
                    {status:'verified',    label:'✓ Verify',bg:'rgba(74,222,128,0.1)', color:'#4ADE80',border:'rgba(74,222,128,0.2)'},
                    {status:'rejected',    label:'✗ Reject',bg:'rgba(248,113,113,0.1)',color:'#F87171',border:'rgba(248,113,113,0.2)'},
                  ].map(btn=>(
                    <button key={btn.status} onClick={()=>handleReview(btn.status)} disabled={reviewLoading}
                      style={{padding:'8px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',background:btn.bg,color:btn.color,border:`1px solid ${btn.border}`,transition:'opacity 0.15s'}}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(canChallan||showChallan)&&(
              <div style={{...s.card,borderColor:'rgba(249,115,22,0.3)'}} className="animate-fadeUp delay-2">
                <h2 style={{...s.cardTitle,color:'#F97316'}}>Issue Challan Notice</h2>
                <form onSubmit={handleChallan} style={{marginTop:'14px',display:'flex',flexDirection:'column',gap:'12px'}}>
                  <div>
                    <label style={s.fLabel}>Plate Number *</label>
                    <input className="input-dark" type="text" placeholder="MH12AB1234" required
                      style={{fontFamily:'monospace',textTransform:'uppercase'}}
                      value={cf.plateNumber} onChange={e=>setCf({...cf,plateNumber:e.target.value.toUpperCase()})}/>
                  </div>
                  <div>
                    <label style={s.fLabel}>Violation Location</label>
                    <input className="input-dark" type="text" placeholder="Location of violation"
                      value={cf.violationLocation} onChange={e=>setCf({...cf,violationLocation:e.target.value})}/>
                  </div>
                  <div>
                    <label style={s.fLabel}>Violation Type</label>
                    <select className="input-dark" value={cf.violationType} onChange={e=>setCf({...cf,violationType:e.target.value})}>
                      {['Illegal Parking','Parking on Footpath','Blocking Traffic','No Parking Zone','Double Parking'].map(v=><option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.fLabel}>Fine Amount (₹)</label>
                    <input className="input-dark" type="number" min={100} max={5000}
                      value={cf.amount} onChange={e=>setCf({...cf,amount:parseInt(e.target.value)})}/>
                  </div>
                  <button type="submit" disabled={challanLoading} className="btn-orange"
                    style={{padding:'12px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                    {challanLoading?<><span className="spinner"/>Issuing...</>:'📄 Issue Challan & Download PDF'}
                  </button>
                </form>
                <p style={{fontSize:'11px',color:'#44403C',marginTop:'10px',textAlign:'center'}}>
                  Owner details from mock DB · Real deployment needs Vahan API
                </p>
              </div>
            )}

            {report.status==='challan_issued'&&(
              <div style={{...s.card,background:'rgba(74,222,128,0.05)',borderColor:'rgba(74,222,128,0.2)'}}>
                <p style={{color:'#4ADE80',fontWeight:'600',fontSize:'14px'}}>✓ Challan has been issued for this report</p>
              </div>
            )}

            {report.status==='rejected'&&(
              <div style={{...s.card,background:'rgba(248,113,113,0.05)',borderColor:'rgba(248,113,113,0.2)'}}>
                <p style={{color:'#F87171',fontWeight:'600',fontSize:'14px'}}>✗ This report was rejected</p>
                {report.reviewNote&&<p style={{color:'#78716C',fontSize:'13px',marginTop:'6px'}}>Reason: {report.reviewNote}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page:       {minHeight:'100vh',background:'#0C0A09'},
  wrap:       {maxWidth:'1000px',margin:'0 auto',padding:'32px 20px'},
  backBtn:    {background:'none',border:'none',color:'#78716C',cursor:'pointer',fontSize:'13px',fontWeight:'500',marginBottom:'24px',padding:0},
  grid:       {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',alignItems:'start'},
  card:       {background:'#1C1917',border:'1px solid #292524',borderRadius:'16px',padding:'24px'},
  cardTitle:  {fontSize:'16px',fontWeight:'600',color:'#FAFAF9'},
  evidence:   {width:'100%',borderRadius:'10px',objectFit:'cover',maxHeight:'260px',marginBottom:'16px'},
  detBox:     {background:'#0C0A09',borderRadius:'10px',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'},
  detRow:     {display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px'},
  detLabel:   {fontSize:'12px',color:'#57534E',fontWeight:'500'},
  detPlate:   {fontSize:'20px',fontWeight:'700',color:'#FAFAF9',fontFamily:'monospace',letterSpacing:'1px'},
  confBar:    {width:'80px',height:'4px',background:'#292524',borderRadius:'2px'},
  confFill:   {height:'4px',borderRadius:'2px'},
  statusBadge:{fontSize:'11px',fontWeight:'600',padding:'3px 10px',borderRadius:'6px',textTransform:'capitalize'},
  descBox:    {background:'#0C0A09',borderRadius:'8px',padding:'12px',fontSize:'13px',color:'#78716C',fontStyle:'italic',lineHeight:'1.5'},
  fLabel:     {display:'block',fontSize:'12px',fontWeight:'500',color:'#78716C',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.04em'},
}
