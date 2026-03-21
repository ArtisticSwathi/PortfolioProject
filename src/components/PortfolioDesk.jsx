import { useEffect } from 'react'
import { useGLTF, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function ScrollWatcher({ aboutRef, monitorRef, sideRef, phoneRef }) {
  const scroll = useScroll()

useFrame(() => {
  const o = scroll.offset

  // About: shows only at book stop (0.12 - 0.45)
  const aboutIn    = Math.max(0, Math.min(1, (o - 0.10) / 0.06))
  const aboutOut   = Math.max(0, Math.min(1, 1 - (o - 0.42) / 0.05))
  const aboutAlpha = Math.min(aboutIn, aboutOut)

  // Monitor + side: shows ONLY at monitor stop (0.57 - 0.80)
  const monitorIn    = Math.max(0, Math.min(1, (o - 0.56) / 0.05))
  const monitorOut   = Math.max(0, Math.min(1, 1 - (o - 0.78) / 0.04))
  const monitorAlpha = Math.min(monitorIn, monitorOut)

  // Phone: shows ONLY at phone stop (0.92+)
  const phoneAlpha = Math.max(0, Math.min(1, (o - 0.93) / 0.04))

  // ── Force hide everything when near start ──
  const finalAbout   = o < 0.05 ? 0 : aboutAlpha
  const finalMonitor = o < 0.05 ? 0 : monitorAlpha
  const finalPhone   = o < 0.05 ? 0 : phoneAlpha

  if (aboutRef.current) {
    aboutRef.current.style.opacity       = finalAbout.toFixed(3)
    aboutRef.current.style.pointerEvents = finalAbout > 0.5 ? 'auto' : 'none'
  }
  if (monitorRef.current) {
    monitorRef.current.style.opacity       = finalMonitor.toFixed(3)
    monitorRef.current.style.pointerEvents = finalMonitor > 0.5 ? 'auto' : 'none'
  }
  if (sideRef.current) {
    sideRef.current.style.opacity       = finalMonitor.toFixed(3)
    sideRef.current.style.pointerEvents = finalMonitor > 0.5 ? 'auto' : 'none'
  }
  if (phoneRef.current) {
    phoneRef.current.style.opacity       = finalPhone.toFixed(3)
    phoneRef.current.style.pointerEvents = finalPhone > 0.5 ? 'auto' : 'none'
  }
})
  return null
}

export default function PortfolioDesk({ isDarkMode, aboutRef, monitorRef, sideRef, phoneRef }) {
  const { scene } = useGLTF('./model/Baking-donee.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material.map) {
          child.material.map.anisotropy  = 16
          child.material.map.minFilter   = THREE.LinearFilter
          child.material.map.needsUpdate = true
        }
      }
    })
  }, [scene])

  return (
    <group>
      <primitive object={scene} rotation={[0, Math.PI, 0]} />
      <ScrollWatcher
        aboutRef={aboutRef}
        monitorRef={monitorRef}
        sideRef={sideRef}
        phoneRef={phoneRef}
      />
      {isDarkMode && (
        <pointLight position={[-0.14, 0.55, -0.8]} intensity={2.5} color="#b87af8" distance={3} />
      )}
    </group>
  )
}
