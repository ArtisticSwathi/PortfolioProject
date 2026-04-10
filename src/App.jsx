import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ScrollControls, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import PortfolioDesk from './components/PortfolioDesk'

const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent)

// Desktop uses innerWidth (browser viewport) — no gray bars
// Mobile uses screen dimensions — unaffected by browser chrome
const INIT_W = isMobileDevice
  ? Math.max(window.screen.width, window.screen.height)
  : window.innerWidth
const INIT_H = isMobileDevice
  ? Math.min(window.screen.width, window.screen.height)
  : window.innerHeight

const PROJECTS = [
  { title: 'Stefan Sea Foods', desc: 'Premium seafood e-commerce with WhatsApp cart integration.', image: '/images/project-stefan.jpg', github: 'https://github.com/ArtisticSwathi/stefan-seafoods', extras: ['/images/project-stefan.jpg', '/images/stefan-2.jpg', '/images/stefan-3.jpg'] },
  { title: '3D Ear Pods', desc: 'Realistic AirPods model designed and rendered in Blender.', image: '/images/project-earpods.jpg', github: 'https://github.com/ArtisticSwathi/EarPodsModel', extras: ['/images/project-earpods.jpg', '/images/earpods-2.jpg'] },
  { title: 'Traditional House', desc: '3D architectural model of a traditional house built in Blender.', image: '/images/project-house.jpg', github: 'https://github.com/ArtisticSwathi/TraditionalHouseModel/tree/main', extras: ['/images/project-house.jpg', '/images/house-2.jpg', '/images/house-3.jpg', '/images/house-4.jpg', '/images/house-5.jpg'] },
  { title: 'Donut Collection', desc: 'Classic Blender donut tutorial taken to the next level.', image: '/images/project-donut.jpg', github: 'https://github.com/ArtisticSwathi/DonutModel/tree/main', extras: ['/images/project-donut.jpg', '/images/donut-2.jpg'] },
{
  title: 'Stylized Isometric Interior',
  desc: 'A 3D room study featuring custom toon-shading and hand-drawn aesthetics to blend 2D art with 3D depth.',
  image: '/images/stylized-room.jpg', 
  github: 'https://github.com/ArtisticSwathi/stylizedInterior',
  extras: ['/images/stylized-room-2.jpg', '/images/stylized-room-3.jpg', '/images/stylized-room.jpg']
},
]

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
// Flow: loading bar fills → popup shows 3 sec → auto enters portfolio
function LoadingScreen({ onEnter }) {
  const [phase, setPhase]     = useState('tap')     // 'tap' | 'loading' | 'tip'
  const [progress, setProgress] = useState(0)

const handleTap = () => {
  // Only request fullscreen on mobile — desktop doesn't need it
  if (isMobileDevice && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {})
  }
  setPhase('loading')
}
  useEffect(() => {
    if (phase !== 'loading') return
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setPhase('tip')
          setTimeout(() => onEnter(), 2000)  // tip shows 2 sec then enters
          return 100
        }
        return p + 2
      })
    }, 35)
    return () => clearInterval(interval)
  }, [phase])

  const bg = {
    position: 'fixed', top: 0, left: 0,
    width: '100vw', height: '100dvh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 100%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Inter", sans-serif',
    zIndex: 1000, cursor: phase === 'tap' ? 'pointer' : 'default',
  }

  // ── TAP TO START ──
  if (phase === 'tap') return (
    <div style={bg} onClick={handleTap}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(187,134,252,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: '6px', border: '2px solid rgba(187,134,252,0.25)', borderRadius: '50%', animation: 'spin 3s linear infinite' }} />
          <div style={{ position: 'absolute', inset: '14px', border: '2px solid rgba(187,134,252,0.4)', borderRadius: '50%', animation: 'spin 2s linear infinite reverse' }} />
          <div style={{ position: 'absolute', inset: '22px', background: 'linear-gradient(135deg, #7c3aed, #bb86fc)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🖥️</div>
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: '0 0 4px' }}>
            Swathi's <span style={{ color: '#bb86fc' }}>3D Portfolio</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Frontend Dev · 3D Artist</p>
        </div>
        <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: '600' }}>
            Tap anywhere to start
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0', textAlign: 'center' }}>
            🖥️ Best experienced on laptop · 📱 Use landscape on mobile
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )

  // ── LOADING ──
  if (phase === 'loading') return (
    <div style={bg}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(187,134,252,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: '6px', border: '2px solid rgba(187,134,252,0.25)', borderRadius: '50%', animation: 'spin 3s linear infinite' }} />
          <div style={{ position: 'absolute', inset: '14px', border: '2px solid rgba(187,134,252,0.4)', borderRadius: '50%', animation: 'spin 2s linear infinite reverse' }} />
          <div style={{ position: 'absolute', inset: '22px', background: 'linear-gradient(135deg, #7c3aed, #bb86fc)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🖥️</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '0 0 4px' }}>
            Swathi's <span style={{ color: '#bb86fc' }}>3D Portfolio</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Frontend Dev · 3D Artist</p>
        </div>
        <div style={{ width: '200px' }}>
          <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #bb86fc)', borderRadius: '2px', width: `${progress}%`, transition: 'width 0.06s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Loading 3D scene...</span>
            <span style={{ fontSize: '10px', color: '#bb86fc', fontWeight: '700' }}>{progress}%</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── TIP (2 seconds, plain text only, no card) ──
  return (
    <div style={bg}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(187,134,252,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: '6px', border: '2px solid rgba(187,134,252,0.25)', borderRadius: '50%', animation: 'spin 3s linear infinite' }} />
          <div style={{ position: 'absolute', inset: '14px', border: '2px solid rgba(187,134,252,0.4)', borderRadius: '50%', animation: 'spin 2s linear infinite reverse' }} />
          <div style={{ position: 'absolute', inset: '22px', background: 'linear-gradient(135deg, #7c3aed, #bb86fc)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🖥️</div>
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '0 0 4px' }}>
            Swathi's <span style={{ color: '#bb86fc' }}>3D Portfolio</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Frontend Dev · 3D Artist</p>
        </div>
        {/* Plain text only — no card */}
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0, fontWeight: '500', animation: 'fadeIn 0.4s ease' }}>
          💻 For better experience, use a laptop
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: '400' }}>
          📱 Keep in landscape mode on mobile
        </p>
      </div>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  )
}
// ─── ROTATE SCREEN ────────────────────────────────────────────────────────────
function RotateScreen() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh',
      background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1060 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Inter", sans-serif', gap: '20px',
      padding: '32px', boxSizing: 'border-box', textAlign: 'center',
    }}>
      <div style={{ animation: 'rotateAnim 2s ease-in-out infinite' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#bb86fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <style>{`@keyframes rotateAnim{0%,40%{transform:rotate(0deg)}60%,100%{transform:rotate(-90deg)}}`}</style>
        </svg>
      </div>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 8px' }}>Rotate Your Device</h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.65', margin: 0, maxWidth: '240px' }}>
          Please rotate your phone sideways to landscape for the full 3D experience.
        </p>
      </div>
      <div style={{ background: 'rgba(187,134,252,0.12)', border: '1px solid rgba(187,134,252,0.25)', borderRadius: '12px', padding: '12px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', maxWidth: '240px' }}>
        💻 Best viewed on laptop or desktop
      </div>
    </div>
  )
}

function FullscreenBtn() { return null }

function AboutCard({ isDarkMode, aboutRef }) {
  const [slide, setSlide] = useState(0)
  const accent = isDarkMode ? '#bb86fc' : '#7c3aed'
  const cardW  = isMobileDevice ? 210 : 270

  const skills = [
    { name: 'Blender',        icon: '🎨', level: 90 },
    { name: 'React',          icon: '⚛️', level: 85 },
    { name: 'Three.js',       icon: '🌐', level: 80 },
    { name: 'JavaScript ES6', icon: '⚡', level: 88 },
    { name: 'HTML & CSS',     icon: '🖥️', level: 92 },
  ]

  return (
    <div ref={aboutRef} style={{
      position: 'absolute',
      top: '32%',
      left: isMobileDevice ? '28%' : '38%',
      transform: 'translateY(-50%)',
      width: `${cardW}px`,
      fontFamily: '"Inter", sans-serif',
      background: isDarkMode ? 'rgba(20,20,20,0.96)' : 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(16px)',
      borderRadius: '16px',
      color: isDarkMode ? '#fff' : '#111',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'}`,
      boxShadow: '0 20px 48px rgba(0,0,0,0.3)',
      opacity: 0, pointerEvents: 'none', zIndex: 10,
      overflow: 'hidden',   // ← keeps border radius
      transition: 'background 0.3s, border 0.3s, color 0.3s',
    }}>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', padding: '10px 0 2px' }}>
        {[0,1].map(i => (
          <div key={i} style={{
            width: i === slide ? '16px' : '6px', height: '6px',
            borderRadius: '3px',
            background: i === slide ? accent : 'rgba(128,128,128,0.25)',
            transition: 'all 0.3s',
          }}/>
        ))}
      </div>

      {/* Slider — width = 2 × cardW, slides by cardW */}
      <div style={{
        display: 'flex',
        width: `${cardW * 2}px`,
        transform: `translateX(${slide * -cardW}px)`,
        transition: 'transform 0.35s ease',
      }}>

        {/* ── About slide ── */}
        <div style={{
          width: `${cardW}px`,
          padding: isMobileDevice ? '8px 14px 14px' : '10px 22px 18px',
          flexShrink: 0, boxSizing: 'border-box',
        }}>
          <h1 style={{ fontSize: isMobileDevice ? '15px' : '20px', margin: '0 0 8px', fontWeight: '800' }}>
            Hi, I'm <span style={{ color: accent }}>Swathi</span>
          </h1>
          <p style={{ fontSize: isMobileDevice ? '10px' : '12.5px', lineHeight: '1.6', margin: '0 0 12px', fontWeight: '500' }}>
            3rd-year Engineering student specialising in full-stack development and immersive 3D web experiences. Aspiring to work abroad.
          </p>
          <button onClick={() => setSlide(1)} style={{
            background: accent, color: '#fff', border: 'none',
            padding: isMobileDevice ? '5px 12px' : '7px 16px',
            borderRadius: '20px',
            fontSize: isMobileDevice ? '9px' : '11px',
            fontWeight: '700', cursor: 'pointer',
            fontFamily: '"Inter", sans-serif',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            My Skills →
          </button>
        </div>

        {/* ── Skills slide ── */}
        <div style={{
          width: `${cardW}px`,
          padding: isMobileDevice ? '8px 14px 14px' : '10px 22px 18px',
          flexShrink: 0, boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <button onClick={() => setSlide(0)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: accent, fontSize: '16px', padding: 0, lineHeight: 1,
            }}>←</button>
            <h2 style={{ fontSize: isMobileDevice ? '13px' : '16px', fontWeight: '800', margin: 0 }}>
              My <span style={{ color: accent }}>Skills</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobileDevice ? '7px' : '9px' }}>
            {skills.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: isMobileDevice ? '9px' : '11px', fontWeight: '700' }}>{s.icon} {s.name}</span>
                  <span style={{ fontSize: isMobileDevice ? '8px' : '10px', color: accent, fontWeight: '700' }}>{s.level}%</span>
                </div>
                <div style={{ height: '3px', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    background: `linear-gradient(90deg, ${accent}, #a855f7)`,
                    width: `${s.level}%`,
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── SIDE CARD ────────────────────────────────────────────────────────────────
function SideCard({ isDarkMode, sideRef, projectIndex }) {
  const [activeImg, setActiveImg] = useState(0)
  const [imgFade, setImgFade]     = useState(true)
  const accent  = isDarkMode ? '#bb86fc' : '#7c3aed'
  const project = PROJECTS[projectIndex]

  useEffect(() => { setActiveImg(0); setImgFade(true) }, [projectIndex])
  useEffect(() => {
    if (project.extras.length <= 1) return
    const timer = setInterval(() => {
      setImgFade(false)
      setTimeout(() => { setActiveImg(i => (i + 1) % project.extras.length); setImgFade(true) }, 200)
    }, 2000)
    return () => clearInterval(timer)
  }, [projectIndex, project.extras.length])

  return (
    <div ref={sideRef} style={{
      position: 'absolute', top: '8%', left: '12%', width: '26%', height: '38%',
      fontFamily: '"Inter", sans-serif',
      background: isDarkMode ? 'rgba(15,10,25,0.97)' : 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(16px)', borderRadius: '12px',
      border: `1px solid ${isDarkMode ? 'rgba(187,134,252,0.2)' : 'rgba(124,58,237,0.15)'}`,
      boxShadow: '0 16px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', opacity: 0, pointerEvents: 'none', zIndex: 10,
    }}>
      <div style={{ padding: '6px 10px', background: isDarkMode ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)', borderBottom: `1px solid ${isDarkMode ? 'rgba(187,134,252,0.15)' : 'rgba(124,58,237,0.12)'}`, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '9px', fontWeight: '700', color: isDarkMode ? '#e9d5ff' : '#3b0764' }}>{project.title}</div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {project.extras.map((_, i) => (
            <div key={i} style={{ width: i === activeImg ? '12px' : '4px', height: '4px', borderRadius: '2px', background: i === activeImg ? accent : (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(124,58,237,0.2)'), transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img src={project.extras[activeImg]} alt="screenshot" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: imgFade ? 1 : 0, transition: 'opacity 0.2s ease' }} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.25)', pointerEvents: 'none' }} />
      </div>
      <div style={{ display: 'flex', gap: '3px', padding: '5px', background: isDarkMode ? 'rgba(0,0,0,0.35)' : 'rgba(245,245,245,0.9)', flexShrink: 0 }}>
        {project.extras.map((img, i) => (
          <div key={i} onClick={() => { setImgFade(false); setTimeout(() => { setActiveImg(i); setImgFade(true) }, 200) }}
            style={{ flex: 1, height: '28px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', border: i === activeImg ? `2px solid ${accent}` : '2px solid transparent', transition: 'border 0.2s' }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MONITOR OVERLAY ──────────────────────────────────────────────────────────
function MonitorOverlay({ isDarkMode, monitorRef, sideRef }) {
  const [index, setIndex] = useState(0)
  const [fade, setFade]   = useState(true)
  const accent  = isDarkMode ? '#bb86fc' : '#7c3aed'
  const project = PROJECTS[index]

  const go = (dir) => {
    setFade(false)
    setTimeout(() => { setIndex(i => (i + dir + PROJECTS.length) % PROJECTS.length); setFade(true) }, 180)
  }

  return (
    <>
      <SideCard isDarkMode={isDarkMode} sideRef={sideRef} projectIndex={index} />
      <div ref={monitorRef} style={{
        position: 'absolute', top: '28%', left: '40.3%', width: '21%', height: '28%',
        fontFamily: '"Inter", sans-serif',
        background: isDarkMode ? '#0a0a0f' : '#f0ebff',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        opacity: 0, pointerEvents: 'none', zIndex: 10,
      }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', opacity: fade ? 1 : 0, transition: 'opacity 0.18s ease' }}>
          <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '30px', left: '10px', right: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff', marginBottom: '2px', lineHeight: 1.2 }}>{project.title}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, fontWeight: '500' }}>{project.desc}</div>
          </div>
          <a href={project.github} target="_blank" rel="noopener noreferrer"
            style={{ position: 'absolute', top: '7px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '8px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            View on GitHub
          </a>
          <button onClick={() => go(-1)} style={{ position: 'absolute', bottom: '6px', left: '8px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '3px 9px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}>← Back</button>
          <button onClick={() => go(1)}  style={{ position: 'absolute', bottom: '6px', right: '8px', background: accent, border: 'none', color: '#fff', padding: '3px 9px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}>Next →</button>
        </div>
      </div>
    </>
  )
}

// ─── PHONE CONTACT CARD ───────────────────────────────────────────────────────
function PhoneCard({ isDarkMode, phoneRef }) {
  const links = [
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a73e8"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>, label: 'Email', value: 'swathi.s.3dartist@gmail.com', href: 'mailto:swathi.s.3dartist@gmail.com' },
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#0077b5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>, label: 'LinkedIn', value: 'linkedin.com/swathi-sudhakar', href: 'https://www.linkedin.com/swathi-sudhakar' },
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#333"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>, label: 'GitHub', value: 'github.com/ArtisticSwathi', href: 'https://github.com/ArtisticSwathi' },
    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#34a853"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>, label: 'Phone', value: '+91 9363622272', href: 'tel:+919363622272' },
  ]
  return (
    <div ref={phoneRef} style={{
      position: 'absolute', top: '36%', left: '43.4%', width: '12.5%', height: '54.5%',
      fontFamily: '"Inter", sans-serif', opacity: 0, pointerEvents: 'none', zIndex: 10,
      overflow: 'hidden', background: 'transparent',
      transform: 'perspective(300px) rotateY(-2.3deg) rotateZ(2.6deg)',
    }}>
      <div style={{ width: '100%', height: '100%', background: '#f5f5f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#1a73e8', padding: '8px 10px 6px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '7px', fontWeight: '800', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)' }}>CONTACT ME</div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#fff', marginTop: '1px' }}>Swathi S</div>
          <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.75)', marginTop: '1px', fontWeight: '500' }}>Frontend Dev · 3D Artist</div>
        </div>
<div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflow: 'hidden', justifyContent: 'flex-start', marginTop: '6px' }}>

{links.map((link, i) => {
  const isTel = link.href.startsWith('tel')
  const isMail = link.href.startsWith('mailto')
  
  return (
    <a key={i} href={link.href}
      target={isTel || isMail ? '_self' : '_blank'}
      rel="noopener noreferrer"
      // ── On mobile, re-request fullscreen after link tap ──
      onClick={() => {
        if (isMobileDevice && (isTel || isMail)) {
          setTimeout(() => {
            document.documentElement.requestFullscreen?.().catch(() => {})
          }, 1000)
        }
      }}
  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 6px', background: '#fff', borderRadius: '6px', textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer' }}
    >
      <div style={{ flexShrink: 0 }}>{link.icon}</div>
      <div style={{ overflow: 'hidden', minWidth: 0 }}>
        <div style={{ fontSize: '6px', fontWeight: '700', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{link.label}</div>
        <div style={{ fontSize: '7px', fontWeight: '600', color: '#111', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.value}</div>
      </div>
    </a>
  )
})}
        </div>
        <div style={{ padding: '5px 8px 8px', textAlign: 'center', fontSize: '6px', color: '#999', fontWeight: '500', flexShrink: 0 }}>
          Open to internships · Available for work abroad
        </div>
      </div>
    </div>
  )
}

// ─── CAMERA MANAGER ───────────────────────────────────────────────────────────
function CameraManager() {
  const scroll = useScroll()
  useFrame((state) => {
    const startPos    = new THREE.Vector3(0.20,   1.03,  0.37)
    const startLook   = new THREE.Vector3(0.19,   0.86, -0.10)
    const bookPos     = new THREE.Vector3(-0.374, 0.850, -0.300)
    const bookLook    = new THREE.Vector3(-0.374, 0.504, -1.536)
    const monitorPos  = new THREE.Vector3(0.150,  0.850, -0.400)
    const monitorLook = new THREE.Vector3(0.129,  0.580, -1.400)
    const phonePos    = new THREE.Vector3(0.176,  0.614, -1.278)
    const phoneLook   = new THREE.Vector3(1.018,  0.314, -1.726)
    const targetPos  = new THREE.Vector3()
    const targetLook = new THREE.Vector3()
    const o = scroll.offset
    if (o < 0.12) {
      const p = THREE.MathUtils.smoothstep(o / 0.12, 0, 1)
      targetPos.lerpVectors(startPos, bookPos, p); targetLook.lerpVectors(startLook, bookLook, p)
    } else if (o < 0.45) {
      targetPos.copy(bookPos); targetLook.copy(bookLook)
    } else if (o < 0.57) {
      const p = THREE.MathUtils.smoothstep((o - 0.45) / 0.12, 0, 1)
      targetPos.lerpVectors(bookPos, monitorPos, p); targetLook.lerpVectors(bookLook, monitorLook, p)
    } else if (o < 0.80) {
      targetPos.copy(monitorPos); targetLook.copy(monitorLook)
    } else if (o < 0.92) {
      const p = THREE.MathUtils.smoothstep((o - 0.80) / 0.12, 0, 1)
      targetPos.lerpVectors(monitorPos, phonePos, p); targetLook.lerpVectors(monitorLook, phoneLook, p)
    } else {
      targetPos.copy(phonePos); targetLook.copy(phoneLook)
    }
    state.camera.position.copy(targetPos)
    state.camera.lookAt(targetLook)
  })
  return null
}

// ─── SCROLL HINT ──────────────────────────────────────────────────────────────
function ScrollHint() {
  return (
    <div style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 20, pointerEvents: 'none', animation: 'fadeInUp 1.2s ease forwards' }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}`}</style>
      <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(0,0,0,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Scroll to explore</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" style={{ animation: 'bounce 1.4s ease-in-out infinite' }}><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [isDarkMode, setIsDarkMode]   = useState(false)
  const [isPortrait, setIsPortrait]   = useState(() => window.innerWidth < window.innerHeight)
  const [showLoading, setShowLoading] = useState(true)
    const [transitioning, setTransitioning] = useState(false) 
    const [needsFs, setNeedsFs] = useState(false)

  const aboutRef   = useRef()
  const monitorRef = useRef()
  const sideRef    = useRef()
  const phoneRef   = useRef()
  const innerRef   = useRef()

useEffect(() => {
  const update = () => {
    const portrait = window.innerWidth < window.innerHeight
    setIsPortrait(portrait)
    if (!innerRef.current || portrait) return
    const scale = Math.max(
      window.innerWidth  / INIT_W,
      window.innerHeight / INIT_H
    )
    innerRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`
  }
  update()
  window.addEventListener('resize', update)
  window.addEventListener('orientationchange', () => setTimeout(update, 200))
  document.addEventListener('fullscreenchange', () => setTimeout(update, 100))

  if (isMobileDevice) {
    const goFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {})
      }
    }

    // Fires when tab becomes visible again
 document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !document.fullscreenElement) {
      // Show overlay instantly — first touch anywhere restores fullscreen
      setNeedsFs(true)
    }
    })

    // Fires on ANY touch — catches Cancel dismiss instantly
    document.addEventListener('touchstart', goFullscreen, { passive: true })
    document.addEventListener('touchend',   goFullscreen, { passive: true })

    window.addEventListener('focus',    () => setTimeout(goFullscreen, 100))
    window.addEventListener('pageshow', () => setTimeout(goFullscreen, 100))
  }

  return () => {
    window.removeEventListener('resize', update)
    window.removeEventListener('orientationchange', update)
    document.removeEventListener('fullscreenchange', update)
  }
}, [])
  if (showLoading) return <LoadingScreen onEnter={() => setShowLoading(false)} />
  if (isPortrait)  return <RotateScreen />

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      overflow: 'hidden',
      background: isDarkMode ? '#050505' : '#c2b2a0',
    }}>

{needsFs && (
  <div
    onTouchStart={() => {
      document.documentElement.requestFullscreen?.()
        .then(() => setNeedsFs(false))
        .catch(() => setNeedsFs(false))
    }}
    style={{
      position: 'fixed', inset: 0,
      zIndex: 9999,
      background: 'transparent',
    }}
  />
)}
      <style>{`::-webkit-scrollbar{display:none}*{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div ref={innerRef} style={{
        position: 'absolute', top: '50%', left: '50%',
        width: `${INIT_W}px`, height: `${INIT_H}px`,
        transformOrigin: 'center center',
        transform: 'translate(-50%, -50%) scale(1)',
      }}>
        <AboutCard      isDarkMode={isDarkMode} aboutRef={aboutRef} />
        <MonitorOverlay isDarkMode={isDarkMode} monitorRef={monitorRef} sideRef={sideRef} />
        <PhoneCard      isDarkMode={isDarkMode} phoneRef={phoneRef} />
        <ScrollHint />
        <FullscreenBtn />

        <button onClick={() => setIsDarkMode(!isDarkMode)} style={{
          position: 'absolute', top: '20px', left: '20px', zIndex: 20,
          padding: '10px 20px', background: 'transparent',
          color: isDarkMode ? 'white' : 'black',
          border: `2px solid ${isDarkMode ? 'white' : 'black'}`,
          borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer',
          fontSize: '13px', fontFamily: '"Inter", sans-serif',
        }}>
          {isDarkMode ? '☀ Light mode' : '☾ Dark mode'}
        </button>
   <a     
href="/resume.pdf"
  download="Swathi_Resume.pdf"
  style={{
    position: 'absolute', top: '20px', right: '20px', zIndex: 20,
    padding: '10px 20px', background: '#7c3aed',
    color: 'white', textDecoration: 'none',
    borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer',
    fontSize: '13px', fontFamily: '"Inter", sans-serif',
    display: 'flex', alignItems: 'center', gap: '6px',
  }}
>
  📄 Get CV
</a>

        <Canvas shadows dpr={[1, 2]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
          camera={{ position: [0.20, 1.03, 0.37], fov: 32 }}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: `${INIT_W}px`, height: `${INIT_H}px`,
            background: isDarkMode ? '#050505' : '#c2b2a0',
            touchAction: 'none',
          }}
        >
          <ScrollControls pages={6} damping={0.6}>
            <CameraManager />
            <ambientLight intensity={isDarkMode ? 0.05 : 0.5} />
            <directionalLight position={[-3, 4, 3]} intensity={isDarkMode ? 0.1 : 1.2} />
            <Environment preset={isDarkMode ? 'night' : 'apartment'} />
            <PortfolioDesk isDarkMode={isDarkMode} aboutRef={aboutRef} monitorRef={monitorRef} sideRef={sideRef} phoneRef={phoneRef} />
          </ScrollControls>
        </Canvas>
      </div>
    </div>
  )
}