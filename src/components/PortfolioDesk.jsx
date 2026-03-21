import { useEffect } from 'react'
import { useGLTF, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function ScrollWatcher({ aboutRef, monitorRef, sideRef, phoneRef }) {
  const scroll = useScroll()

  useFrame(() => {
    const o = scroll.offset

    // About: ONLY at books stop
    const aboutIn    = Math.max(0, Math.min(1, (o - 0.10) / 0.06))
    const aboutOut   = Math.max(0, Math.min(1, 1 - (o - 0.42) / 0.05))
    const aboutAlpha = Math.min(aboutIn, aboutOut)

    // Monitor + side: ONLY at monitor stop
    const monitorIn    = Math.max(0, Math.min(1, (o - 0.56) / 0.05))
    const monitorOut = Math.max(0, Math.min(1, 1 - (o - 0.76) / 0.02))
    const monitorAlpha = o < 0.50 ? 0 : Math.min(monitorIn, monitorOut)

    // Phone: ONLY at phone stop
    const phoneAlpha = Math.max(0, Math.min(1, (o - 0.93) / 0.04))

    if (aboutRef.current) {
      aboutRef.current.style.opacity       = aboutAlpha.toFixed(3)
      aboutRef.current.style.pointerEvents = aboutAlpha > 0.5 ? 'auto' : 'none'
    }
    if (monitorRef.current) {
      monitorRef.current.style.opacity       = monitorAlpha.toFixed(3)
      monitorRef.current.style.pointerEvents = monitorAlpha > 0.5 ? 'auto' : 'none'
    }
    if (sideRef.current) {
      sideRef.current.style.opacity       = monitorAlpha.toFixed(3)
      sideRef.current.style.pointerEvents = monitorAlpha > 0.5 ? 'auto' : 'none'
    }
    if (phoneRef.current) {
      phoneRef.current.style.opacity       = phoneAlpha.toFixed(3)
      phoneRef.current.style.pointerEvents = phoneAlpha > 0.5 ? 'auto' : 'none'
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
