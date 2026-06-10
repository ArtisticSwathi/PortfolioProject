import { useEffect, useRef, useState } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// ─── CURSOR PARALLAX ──────────────────────────────────────────────────────────
// Tracks mouse position and applies subtle parallax camera offset
function CursorParallax({ isZoomed, isZoomedRef, camera }) {
  const mouseX = useRef(0)
  const mouseY = useRef(0)
  const basePosition = useRef({ x: camera.position.x, y: camera.position.y, z: camera.position.z })

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isZoomedRef && isZoomedRef.current) return
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      mouseX.current = x
      mouseY.current = y
    }

    const handleTouchMove = (e) => {
      if (isZoomedRef && isZoomedRef.current) return
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0]
        const x = (touch.clientX / window.innerWidth) * 2 - 1
        const y = -(touch.clientY / window.innerHeight) * 2 + 1
        mouseX.current = x
        mouseY.current = y
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchstart', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchstart', handleTouchMove)
    }
  }, [isZoomedRef])

  useFrame(() => {
    if ((isZoomedRef && isZoomedRef.current) || !camera) return
    const offsetX = mouseX.current * 0.08
    const offsetY = mouseY.current * 0.05
    gsap.to(camera.position, {
      x: basePosition.current.x + offsetX,
      y: basePosition.current.y + offsetY,
      duration: 0.5,
      overwrite: 'auto',
    })
  })

  return null
}

export default function PortfolioDesk({ 
  isDarkMode, 
  aboutRef, monitorRef, sideRef, phoneRef,
  isZoomed,
  isZoomedRef,
  onObjectClick,
  setHoveredObject,
  hoveredObject,
  currentView,
  cameraTimelineRef,
  onReturnToDesk,
  shouldRenderHotspots,
  onLoaded
}) {
  const { scene: glbScene } = useGLTF('./model/Baking-donee.glb')
  const { camera } = useThree()


  useEffect(() => {
    if (!glbScene) return
    
    glbScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material && child.material.map) {
          child.material.map.anisotropy  = 16
          child.material.map.minFilter   = THREE.LinearFilter
          child.material.map.needsUpdate = true
        }
      }
    })
    
    if (onLoaded) {
      onLoaded()
    }
  }, [glbScene, onLoaded])

  const handlePointerOver = (e) => {
    if (isZoomedRef && isZoomedRef.current) return
    e.stopPropagation()
    const name = e.object.name.toLowerCase()
    if (name.includes('book')) {
      setHoveredObject('about')
    } else if (name.includes('monitor')) {
      setHoveredObject('monitor')
    } else if (name.includes('mobile') || name.includes('phone')) {
      setHoveredObject('phone')
    } else {
      setHoveredObject(null)
    }
  }

  const handlePointerOut = (e) => {
    if (isZoomedRef && isZoomedRef.current) return
    e.stopPropagation()
    setHoveredObject(null)
  }

  const handleClick = (e) => {
    if (isZoomedRef && isZoomedRef.current) return
    e.stopPropagation()
    
    // Prevent default tap behaviors on touch devices to bypass delays/double-triggering
    if (e.nativeEvent && (e.nativeEvent.type === 'touchend' || e.nativeEvent.type === 'touchstart')) {
      e.nativeEvent.preventDefault()
    }
    
    const name = e.object.name.toLowerCase()
    if (name.includes('book')) {
      onObjectClick('about')
    } else if (name.includes('monitor')) {
      onObjectClick('monitor')
    } else if (name.includes('mobile') || name.includes('phone')) {
      onObjectClick('phone')
    }
  }


  return (
    <group>
      <primitive 
        object={glbScene} 
        rotation={[0, Math.PI, 0]} 
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handleClick}
      />
      
      {shouldRenderHotspots && (
        <group rotation={[0, Math.PI, 0]}>
          {/* Books Hotspot */}
          <Html center position={[0.37, 0.48, 1.496]}>
            <div 
              className="mobile-hotspot" 
              onClick={() => onObjectClick('about')}
              onTouchEnd={(e) => {
                e.preventDefault()
                onObjectClick('about')
              }}
            />
          </Html>
          
          {/* Monitor Hotspot */}
          <Html center position={[-0.136, 0.65, 1.665]}>
            <div 
              className="mobile-hotspot" 
              onClick={() => onObjectClick('monitor')}
              onTouchEnd={(e) => {
                e.preventDefault()
                onObjectClick('monitor')
              }}
            />
          </Html>
          
          {/* Mobile Hotspot */}
          <Html center position={[-0.505, 0.51, 1.45]}>
            <div 
              className="mobile-hotspot" 
              onClick={() => onObjectClick('phone')}
              onTouchEnd={(e) => {
                e.preventDefault()
                onObjectClick('phone')
              }}
            />
          </Html>
        </group>
      )}

      <CursorParallax isZoomed={isZoomed} isZoomedRef={isZoomedRef} camera={camera} />
      {isDarkMode && (
        <pointLight position={[-0.14, 0.55, -0.8]} intensity={2.5} color="#b87af8" distance={3} />
      )}
    </group>
  )
}
