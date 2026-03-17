import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { reportAPI } from '../../api/axios'
import Navbar from '../../components/common/Navbar'
import toast from 'react-hot-toast'

export default function ReportUpload() {
  const [image, setImage]           = useState(null)
  const [preview, setPreview]       = useState(null)
  const [location, setLocation]     = useState({ address:'', lat:'', lng:'' })
  const [description, setDescription] = useState('')
  const [loading, setLoading]       = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [dragOver, setDragOver]     = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const handleFile = file => {
    if (!file?.type.startsWith('image/')) { toast.error('Only image files!'); return }
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const getGPS = () => {
    if (!navigator.geolocation) { toast.error('GPS not supported'); return }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        const d = await r.json()
        setLocation({ address: d.display_name || 'Location detected', lat, lng })
        toast.success('Location detected!')
      } catch {
        setLocation({ address:`${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng })
      }
      setGpsLoading(false)
    }, () => { toast.error('Could not get GPS'); setGpsLoading(false) })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!image) { toast.error('Please select an image!'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', image)
      fd.append('address', location.address)
      fd.append('lat', location.lat)
      fd.append('lng', location.lng)
      fd.append('description', description)
      await reportAPI.submit(fd)
      toast.success('Report submitted! AI is analyzing...')
      navigate('/citizen/my-reports')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.wrap}>
        <div style={s.header} className="animate-fadeUp">
          <h1 style={s.title}>Report Illegal Parking</h1>
          <p style={s.sub}>Upload a photo — AI will detect the number plate automatically</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.grid}>

            {/* Left */}
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

              {/* Upload */}
              <div style={s.card} className="animate-fadeUp delay-1">
                <p style={s.cardTitle}>📷 Photo Evidence</p>
                {!preview ? (
                  <div style={{...s.dropzone,...(dragOver?s.dropActive:{})}}
                    onClick={()=>fileRef.current.click()}
                    onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                    onDragLeave={()=>setDragOver(false)}
                    onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0])}}>
                    <div style={s.uploadIcon}>⬆️</div>
                    <p style={s.dropText}>Drop image here or <span style={{color:'#F97316'}}>browse</span></p>
                    <p style={s.dropSub}>JPG, PNG up to 10MB</p>
                  </div>
                ) : (
                  <div style={{position:'relative'}}>
                    <img src={preview} alt="Preview" style={s.preview}/>
                    <button type="button" onClick={()=>{setImage(null);setPreview(null)}} style={s.removeBtn}>✕</button>
                    <p style={{fontSize:'12px',color:'#4ADE80',marginTop:'8px',display:'flex',alignItems:'center',gap:'4px'}}>
                      ✓ {image.name}
                    </p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
                {!preview && (
                  <button type="button" onClick={()=>fileRef.current.click()} style={s.ghostBtn}>
                    Choose File
                  </button>
                )}
              </div>

              {/* Description */}
              <div style={s.card} className="animate-fadeUp delay-2">
                <p style={s.cardTitle}>📝 Additional Notes</p>
                <textarea className="input-dark" rows={3} style={{resize:'none'}}
                  placeholder="Any additional details... (e.g. blocking footpath, no parking zone)"
                  value={description} onChange={e=>setDescription(e.target.value)} maxLength={500}/>
                <p style={{fontSize:'11px',color:'#57534E',textAlign:'right',marginTop:'4px'}}>{description.length}/500</p>
              </div>
            </div>

            {/* Right */}
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

              {/* Location */}
              <div style={s.card} className="animate-fadeUp delay-2">
                <p style={s.cardTitle}>📍 Location</p>
                <button type="button" onClick={getGPS} disabled={gpsLoading}
                  style={{...s.gpsBtn,opacity:gpsLoading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  {gpsLoading ? <><span className="spinner"/>Detecting...</> : '📡 Use GPS Location'}
                </button>
                <p style={{textAlign:'center',fontSize:'11px',color:'#57534E',margin:'8px 0'}}>or enter manually</p>
                <input className="input-dark" type="text" placeholder="Enter area / address"
                  value={location.address} onChange={e=>setLocation({...location,address:e.target.value})}/>
                {location.lat && (
                  <p style={{fontSize:'12px',color:'#4ADE80',marginTop:'6px'}}>
                    ✓ GPS: {parseFloat(location.lat).toFixed(4)}, {parseFloat(location.lng).toFixed(4)}
                  </p>
                )}
              </div>

              {/* Tips */}
              <div style={s.tipsCard}>
                <p style={s.tipsTitle}>Tips for better detection</p>
                {['Take photo in daylight','Number plate must be visible','Avoid blurry images','Include full vehicle in frame'].map(t=>(
                  <div key={t} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                    <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'#F97316',flexShrink:0}}/>
                    <span style={{fontSize:'12px',color:'#A8A29E'}}>{t}</span>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading||!image} className="btn-orange"
                style={{padding:'14px',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',opacity:(!image||loading)?0.6:1}}>
                {loading ? <><span className="spinner"/>Submitting...</> : '🚀 Submit Report'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const s = {
  page:     { minHeight:'100vh', background:'#0C0A09' },
  wrap:     { maxWidth:'1000px', margin:'0 auto', padding:'32px 20px' },
  header:   { marginBottom:'28px' },
  title:    { fontSize:'24px', fontWeight:'600', color:'#FAFAF9', marginBottom:'4px' },
  sub:      { fontSize:'14px', color:'#78716C' },
  grid:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', alignItems:'start' },
  card:     { background:'#1C1917', border:'1px solid #292524', borderRadius:'16px', padding:'24px' },
  cardTitle:{ fontSize:'15px', fontWeight:'600', color:'#FAFAF9', marginBottom:'16px' },
  dropzone: { border:'2px dashed #292524', borderRadius:'12px', padding:'40px 20px', textAlign:'center', cursor:'pointer', transition:'all 0.2s' },
  dropActive:{ borderColor:'#F97316', background:'rgba(249,115,22,0.05)' },
  uploadIcon:{ fontSize:'36px', marginBottom:'12px' },
  dropText: { fontSize:'14px', color:'#A8A29E', marginBottom:'4px' },
  dropSub:  { fontSize:'12px', color:'#57534E' },
  preview:  { width:'100%', borderRadius:'10px', objectFit:'cover', maxHeight:'220px' },
  removeBtn:{ position:'absolute', top:'8px', right:'8px', background:'rgba(220,38,38,0.8)', border:'none', borderRadius:'6px', width:'28px', height:'28px', color:'white', cursor:'pointer', fontSize:'12px' },
  ghostBtn: { width:'100%', padding:'10px', background:'#292524', border:'none', borderRadius:'8px', color:'#A8A29E', fontSize:'13px', fontWeight:'500', cursor:'pointer', marginTop:'12px' },
  gpsBtn:   { width:'100%', padding:'10px', background:'#F97316', border:'none', borderRadius:'8px', color:'white', fontSize:'13px', fontWeight:'600', cursor:'pointer', marginBottom:'4px' },
  tipsCard: { background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:'14px', padding:'20px' },
  tipsTitle:{ fontSize:'13px', fontWeight:'600', color:'#F97316', marginBottom:'12px' },
}
