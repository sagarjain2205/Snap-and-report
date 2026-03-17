import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { statsAPI } from '../../api/axios'
import Navbar from '../../components/common/Navbar'

export default function CitizenHome() {
  const { user }  = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    statsAPI.citizen().then(r => setStats(r.data.stats)).catch(console.error)
  }, [])

  const cards = stats ? [
    { label:'Total',          value:stats.total,         color:'#F97316', bg:'rgba(249,115,22,0.1)'  },
    { label:'Pending',        value:stats.pending,       color:'#EAB308', bg:'rgba(234,179,8,0.1)'   },
    { label:'Verified',       value:stats.verified,      color:'#4ADE80', bg:'rgba(74,222,128,0.1)'  },
    { label:'Challan Issued', value:stats.challanIssued, color:'#C084FC', bg:'rgba(192,132,252,0.1)' },
  ] : []

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.wrap}>

        {/* Hero */}
        <div style={s.hero} className="animate-fadeUp">
          <div style={s.heroGlow}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={s.heroBadge}>
              <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4ADE80',display:'inline-block',marginRight:'6px'}}/>
              Live System Active
            </div>
            <h1 style={s.heroTitle}>Namaste, {user?.name?.split(' ')[0]}! 👋</h1>
            <p style={s.heroSub}>Help make our streets safer by reporting illegal parking near you.</p>
            <div style={{display:'flex',gap:'12px',marginTop:'24px',flexWrap:'wrap'}}>
              <Link to="/citizen/report" style={s.btnPrimary}>📷 Report Now</Link>
              <Link to="/citizen/my-reports" style={s.btnSecondary}>View My Reports</Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={s.statsGrid}>
            {cards.map(({label,value,color,bg},i) => (
              <div key={label} style={s.statCard} className={`animate-fadeUp delay-${i+1}`}>
                <p style={{fontSize:'28px',fontWeight:'700',color,margin:'0 0 4px'}}>{value}</p>
                <p style={{fontSize:'12px',color:'#57534E',margin:0,fontWeight:'500'}}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        <div style={s.section} className="animate-fadeUp delay-2">
          <h2 style={s.sectionTitle}>How It Works</h2>
          <div style={s.stepsGrid}>
            {[
              {n:'01',title:'Take a Photo',    desc:'Click a clear photo showing the number plate', color:'#F97316'},
              {n:'02',title:'AI Detects Plate',desc:'YOLOv8 AI automatically reads the number plate',color:'#EAB308'},
              {n:'03',title:'Police Reviews',  desc:'Officer verifies and takes appropriate action',  color:'#4ADE80'},
            ].map(step => (
              <div key={step.n} style={s.step}>
                <div style={{...s.stepNum,color:step.color,borderColor:step.color+'33'}}>{step.n}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={s.actionsGrid} className="animate-fadeUp delay-3">
          <Link to="/citizen/report" style={s.actionCard}
            onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(249,115,22,0.4)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#292524'}>
            <div style={{...s.actionIcon,background:'rgba(249,115,22,0.1)'}}>
              <span style={{fontSize:'28px'}}>📷</span>
            </div>
            <h3 style={s.actionTitle}>New Report</h3>
            <p style={s.actionDesc}>Upload a photo of illegal parking</p>
            <span style={s.arrow}>→</span>
          </Link>
          <Link to="/citizen/my-reports" style={s.actionCard}
            onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(74,222,128,0.4)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#292524'}>
            <div style={{...s.actionIcon,background:'rgba(74,222,128,0.1)'}}>
              <span style={{fontSize:'28px'}}>📋</span>
            </div>
            <h3 style={s.actionTitle}>My Reports</h3>
            <p style={s.actionDesc}>Track status of your reports</p>
            <span style={s.arrow}>→</span>
          </Link>
        </div>

      </div>
    </div>
  )
}

const s = {
  page:        { minHeight:'100vh', background:'#0C0A09' },
  wrap:        { maxWidth:'1100px', margin:'0 auto', padding:'32px 20px' },
  hero:        { background:'#1C1917', border:'1px solid #292524', borderRadius:'20px', padding:'40px', marginBottom:'20px', position:'relative', overflow:'hidden' },
  heroGlow:    { position:'absolute', top:'-60px', right:'-60px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents:'none' },
  heroBadge:   { display:'inline-flex', alignItems:'center', fontSize:'12px', fontWeight:'500', color:'#4ADE80', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', padding:'4px 12px', borderRadius:'20px', marginBottom:'16px' },
  heroTitle:   { fontSize:'32px', fontWeight:'700', color:'#FAFAF9', margin:'0 0 8px' },
  heroSub:     { fontSize:'15px', color:'#78716C', maxWidth:'480px', lineHeight:'1.6' },
  btnPrimary:  { display:'inline-flex', alignItems:'center', gap:'6px', background:'#F97316', color:'white', fontWeight:'600', fontSize:'14px', padding:'10px 20px', borderRadius:'10px', textDecoration:'none' },
  btnSecondary:{ display:'inline-flex', alignItems:'center', background:'#292524', color:'#A8A29E', fontWeight:'500', fontSize:'14px', padding:'10px 20px', borderRadius:'10px', textDecoration:'none' },
  statsGrid:   { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' },
  statCard:    { background:'#1C1917', border:'1px solid #292524', borderRadius:'14px', padding:'20px', textAlign:'center' },
  section:     { background:'#1C1917', border:'1px solid #292524', borderRadius:'16px', padding:'28px', marginBottom:'20px' },
  sectionTitle:{ fontSize:'18px', fontWeight:'600', color:'#FAFAF9', marginBottom:'20px' },
  stepsGrid:   { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' },
  step:        { padding:'4px' },
  stepNum:     { fontSize:'15px', fontWeight:'700', border:'1px solid', width:'44px', height:'44px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' },
  stepTitle:   { fontSize:'15px', fontWeight:'600', color:'#FAFAF9', margin:'0 0 6px' },
  stepDesc:    { fontSize:'13px', color:'#78716C', lineHeight:'1.5' },
  actionsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  actionCard:  { background:'#1C1917', border:'1px solid #292524', borderRadius:'16px', padding:'24px', textDecoration:'none', display:'block', position:'relative', transition:'border-color 0.2s' },
  actionIcon:  { width:'56px', height:'56px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px' },
  actionTitle: { fontSize:'16px', fontWeight:'600', color:'#FAFAF9', margin:'0 0 4px' },
  actionDesc:  { fontSize:'13px', color:'#78716C' },
  arrow:       { position:'absolute', top:'24px', right:'24px', fontSize:'20px', color:'#44403C' },
}
