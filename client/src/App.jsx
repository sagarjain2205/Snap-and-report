import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login    from './pages/Login'
import Register from './pages/Register'

import CitizenHome   from './pages/citizen/Home'
import ReportUpload  from './pages/citizen/ReportUpload'
import MyReports     from './pages/citizen/MyReports'

import PoliceDashboard  from './pages/police/Dashboard'
import PendingReports   from './pages/police/PendingReports'
import ReportDetail     from './pages/police/ReportDetail'
import Challans         from './pages/police/Challans'

const Guard = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0C0A09',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="spinner-orange"/>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role==='citizen'?'/citizen':'/police'} replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  const home = user ? (user.role==='citizen' ? '/citizen' : '/police') : '/login'

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to={home}/> : <Login/>}    />
      <Route path="/register" element={user ? <Navigate to="/citizen"/> : <Register/>} />

      <Route path="/citizen"            element={<Guard roles={['citizen']}><CitizenHome/></Guard>}  />
      <Route path="/citizen/report"     element={<Guard roles={['citizen']}><ReportUpload/></Guard>} />
      <Route path="/citizen/my-reports" element={<Guard roles={['citizen']}><MyReports/></Guard>}   />

      <Route path="/police"             element={<Guard roles={['officer','admin']}><PoliceDashboard/></Guard>}  />
      <Route path="/police/reports"     element={<Guard roles={['officer','admin']}><PendingReports/></Guard>}   />
      <Route path="/police/reports/:id" element={<Guard roles={['officer','admin']}><ReportDetail/></Guard>}    />
      <Route path="/police/challans"    element={<Guard roles={['officer','admin']}><Challans/></Guard>}         />

      <Route path="/" element={<Navigate to={home}/>} />
      <Route path="*" element={<Navigate to={home}/>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
        <Toaster position="top-right" toastOptions={{duration:3000,style:{background:'#1C1917',color:'#FAFAF9',border:'1px solid #292524'}}}/>
      </BrowserRouter>
    </AuthProvider>
  )
}
