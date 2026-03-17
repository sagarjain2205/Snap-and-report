import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome, ${user.name}!`)
      navigate(user.role === 'citizen' ? '/citizen' : '/police')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1}/><div style={s.blob2}/>
      <div style={s.wrap} className="animate-fadeUp">

        <div style={s.logoRow}>
          <div style={s.logoBox}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#F97316"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#F97316" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <span style={s.logoText}>Snap<span style={{color:'#F97316'}}>&</span>Report</span>
        </div>
        <p style={s.tagline}>AI-Powered Illegal Parking Reporter</p>

        <div style={s.card}>
          <h2 style={s.title}>Welcome back</h2>
          <p style={s.sub}>Sign in to continue</p>

          <form onSubmit={handleSubmit} style={{marginTop:'24px'}}>
            <div style={s.field}>
              <label style={s.label}>Email Address</label>
              <div style={{position:'relative'}}>
                <span style={s.icon}><MailIcon/></span>
                <input className="input-dark" type="email" placeholder="your@email.com"
                  style={{paddingLeft:'38px'}}
                  value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={{position:'relative'}}>
                <span style={s.icon}><LockIcon/></span>
                <input className="input-dark" type={showPass?'text':'password'} placeholder="••••••••"
                  style={{paddingLeft:'38px', paddingRight:'40px'}}
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
                <button type="button" onClick={()=>setShowPass(!showPass)} style={s.eyeBtn}>
                  {showPass ? <EyeOffIcon/> : <EyeIcon/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-orange"
              style={{width:'100%',padding:'12px',fontSize:'15px',marginTop:'8px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              {loading ? <><span className="spinner"/>Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <p style={s.regText}>
            New here? <Link to="/register" style={{color:'#F97316',textDecoration:'none',fontWeight:'500'}}>Create account</Link>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-30px) scale(1.1)}}
        @keyframes float2{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,20px)}}
      `}</style>
    </div>
  )
}

const MailIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const LockIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const EyeIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const EyeOffIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#57534E" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>

const s = {
  page:    { minHeight:'100vh', background:'#0C0A09', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', position:'relative', overflow:'hidden' },
  blob1:   { position:'absolute', top:'-100px', right:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', animation:'float1 8s ease-in-out infinite', pointerEvents:'none' },
  blob2:   { position:'absolute', bottom:'-80px', left:'-60px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', animation:'float2 10s ease-in-out infinite', pointerEvents:'none' },
  wrap:    { width:'100%', maxWidth:'420px', position:'relative', zIndex:10 },
  logoRow: { display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'6px' },
  logoBox: { width:'44px', height:'44px', borderRadius:'10px', background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.25)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoText:{ fontSize:'26px', fontWeight:'700', color:'#FAFAF9' },
  tagline: { textAlign:'center', fontSize:'13px', color:'#57534E', marginBottom:'28px' },
  card:    { background:'#1C1917', border:'1px solid #292524', borderRadius:'16px', padding:'32px', marginBottom:'12px' },
  title:   { fontSize:'22px', fontWeight:'600', color:'#FAFAF9' },
  sub:     { fontSize:'13px', color:'#78716C', marginTop:'4px' },
  field:   { marginBottom:'16px' },
  label:   { display:'block', fontSize:'12px', fontWeight:'500', color:'#A8A29E', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' },
  icon:    { position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', display:'flex', pointerEvents:'none' },
  eyeBtn:  { position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', display:'flex' },
  regText: { textAlign:'center', fontSize:'13px', color:'#57534E', marginTop:'20px' },
}
