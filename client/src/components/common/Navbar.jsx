import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const isActive = to => location.pathname === to

  const links = user?.role === 'citizen' ? [
    { to:'/citizen',            label:'Home'      },
    { to:'/citizen/report',     label:'Report'    },
    { to:'/citizen/my-reports', label:'My Reports'},
  ] : [
    { to:'/police',          label:'Dashboard'},
    { to:'/police/reports',  label:'Reports'  },
    { to:'/police/challans', label:'Challans' },
  ]

  return (
    <>
      <nav style={s.nav}>
        <div style={s.inner}>
          <Link to={user?.role==='citizen'?'/citizen':'/police'} style={s.logo}>
            <div style={s.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#F97316"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#F97316" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <span style={s.logoText}>Snap<span style={{color:'#F97316'}}>&</span>Report</span>
            {user?.role !== 'citizen' && <span style={s.badge}>Police</span>}
          </Link>

          <div style={s.links}>
            {links.map(({to,label}) => (
              <Link key={to} to={to} style={{...s.link, ...(isActive(to)?s.active:{})}}>
                {label}
              </Link>
            ))}
          </div>

          <div style={s.right}>
            <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={s.userInfo}>
              <p style={s.userName}>{user?.name}</p>
              <p style={s.userRole}>{user?.role}{user?.zone?` · ${user.zone}`:''}</p>
            </div>
            <button onClick={handleLogout} style={s.logoutBtn} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78716C" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>

          <button style={s.burger} onClick={() => setOpen(!open)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2">
              {open
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div style={s.mobile} className="animate-fadeIn">
          {links.map(({to,label}) => (
            <Link key={to} to={to} style={{...s.mobileLink,...(isActive(to)?s.mobileActive:{})}} onClick={()=>setOpen(false)}>
              {label}
            </Link>
          ))}
          <button onClick={handleLogout} style={s.mobileLogout}>Logout</button>
        </div>
      )}
    </>
  )
}

const s = {
  nav:        { background:'#1C1917', borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:100 },
  inner:      { maxWidth:'1280px', margin:'0 auto', padding:'0 20px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo:       { display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' },
  logoIcon:   { width:'34px', height:'34px', borderRadius:'8px', background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoText:   { fontSize:'18px', fontWeight:'700', color:'#FAFAF9' },
  badge:      { fontSize:'10px', fontWeight:'600', background:'rgba(249,115,22,0.15)', color:'#F97316', padding:'2px 8px', borderRadius:'4px' },
  links:      { display:'flex', alignItems:'center', gap:'4px' },
  link:       { padding:'6px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:'500', color:'#A8A29E', textDecoration:'none', transition:'all 0.15s' },
  active:     { background:'rgba(249,115,22,0.12)', color:'#F97316' },
  right:      { display:'flex', alignItems:'center', gap:'10px' },
  avatar:     { width:'32px', height:'32px', borderRadius:'50%', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'600', color:'#F97316' },
  userInfo:   { lineHeight:'1.2' },
  userName:   { fontSize:'13px', fontWeight:'500', color:'#FAFAF9' },
  userRole:   { fontSize:'11px', color:'#57534E', textTransform:'capitalize' },
  logoutBtn:  { background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', padding:'6px', borderRadius:'6px' },
  burger:     { background:'none', border:'none', cursor:'pointer', padding:'4px', display:'none' },
  mobile:     { background:'#1C1917', borderBottom:'1px solid #292524', padding:'12px 20px', display:'flex', flexDirection:'column', gap:'4px' },
  mobileLink: { padding:'10px 12px', borderRadius:'8px', fontSize:'14px', fontWeight:'500', color:'#A8A29E', textDecoration:'none' },
  mobileActive:{ background:'rgba(249,115,22,0.1)', color:'#F97316' },
  mobileLogout:{ display:'flex', alignItems:'center', padding:'10px 12px', background:'none', border:'none', color:'#EF4444', fontSize:'14px', fontWeight:'500', cursor:'pointer', borderRadius:'8px' },
}
