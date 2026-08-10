import { useEffect, useRef } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// ─── SCREEN PROJECTOR ─────────────────────────────────────────────────────────
// Uses Three.js camera projection to compute exact pixel-space bounding boxes
// for the HTML overlay cards. Runs every frame via useFrame to stay perfectly
// in sync with GSAP-driven camera animations.
//
// Corner coordinates are mathematically derived from the actual GLB mesh data:
//   • monitor-screen (Node 17): mesh AABB + node 180°Y + root 180°Y = net 0° → exact world corners
//   • mobile-screen  (Node 18): mesh AABB + complex quaternion + root 180°Y → exact world corners
function ScreenProjector({ onProjected }) {
  const { camera, size } = useThree()
  const prevRef = useRef({})
  const tmp     = useRef(new THREE.Vector3())

  // ── Monitor screen: world-space corners (flat screen, camera nearly parallel) ─
  // With net-zero rotation (node 180°Y × root 180°Y = 360°), world corners are
  // simply: world_node_center ± mesh_half_extents
  const monC = useRef([
    new THREE.Vector3(-0.0312,  0.6676, -1.6832),  // TL
    new THREE.Vector3( 0.3028,  0.6676, -1.6832),  // TR
    new THREE.Vector3(-0.0312,  0.4550, -1.6832),  // BL
    new THREE.Vector3( 0.3028,  0.4550, -1.6832),  // BR
  ])

  // ── Phone screen: world-space corners after quaternion + root rotation ────────
  // The phone screen is tilted (not flat to the camera), so its 4 projected
  // corners form a parallelogram in screen space. Labeled as seen from the
  // phone zoom camera view:
  //   TL = (0.4951, 0.5286, -1.4816)   TR = (0.5152, 0.5286, -1.4229)
  //   BL = (0.4629, 0.4146, -1.4706)   BR = (0.4830, 0.4146, -1.4119)
  const phoneC = useRef([
    new THREE.Vector3(0.4951, 0.5286, -1.4816),  // TL
    new THREE.Vector3(0.5152, 0.5286, -1.4229),  // TR
    new THREE.Vector3(0.4629, 0.4146, -1.4706),  // BL
    new THREE.Vector3(0.4830, 0.4146, -1.4119),  // BR
  ])

  // ── Side card: positioned left of monitor, same screen-height ────────────────
  const sideC = useRef([
    new THREE.Vector3(-0.490,  0.6676, -1.6832),
    new THREE.Vector3(-0.0312, 0.6676, -1.6832),  // right edge matches monitor left
    new THREE.Vector3(-0.490,  0.4550, -1.6832),
    new THREE.Vector3(-0.0312, 0.4550, -1.6832),  // right edge matches monitor left
  ])

  useFrame(() => {
    const W = size.width
    const H = size.height

    // Project a single world-space Vector3 → CSS pixel {x, y}
    const prj = (v) => {
      const c = tmp.current.copy(v).project(camera)
      return { x: (c.x * 0.5 + 0.5) * W, y: (-c.y * 0.5 + 0.5) * H }
    }

    // Bounding box of projected corner set (good for flat, camera-aligned screens)
    const bbox = (corners) => {
      const pts = corners.map(prj)
      const xs  = pts.map(p => p.x)
      const ys  = pts.map(p => p.y)
      return {
        left:   Math.min(...xs),
        top:    Math.min(...ys),
        width:  Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      }
    }

    // Monitor: flat + nearly perpendicular → bbox is accurate
    const mBounds = bbox(monC.current)

    // Phone: tilted screen → parallelogram in screen space.
    // Using EDGE MIDPOINTS to get the inscribed rectangle avoids the
    // ~14 px bbox over-inflation that caused the right-side overflow.
    const [pTL, pTR, pBL, pBR] = phoneC.current.map(prj)
    const pBounds = {
      left:   (pTL.x + pBL.x) * 0.5,
      top:    (pTL.y + pTR.y) * 0.5,
      width:  (pTR.x + pBR.x) * 0.5 - (pTL.x + pBL.x) * 0.5,
      height: (pBL.y + pBR.y) * 0.5 - (pTL.y + pTR.y) * 0.5,
    }

    // Side card: flat → bbox is accurate
    const sBounds = bbox(sideC.current)

    // Throttle React state updates — only push when position changes > 2 CSS px
    const prev = prevRef.current
    const changed =
      Math.abs((prev.mL ?? -1) - mBounds.left)   > 2.0 ||
      Math.abs((prev.mT ?? -1) - mBounds.top)    > 2.0 ||
      Math.abs((prev.mW ?? -1) - mBounds.width)  > 2.0 ||
      Math.abs((prev.mH ?? -1) - mBounds.height) > 2.0 ||
      Math.abs((prev.pL ?? -1) - pBounds.left)   > 2.0 ||
      Math.abs((prev.pT ?? -1) - pBounds.top)    > 2.0 ||
      Math.abs((prev.pW ?? -1) - pBounds.width)  > 2.0 ||
      Math.abs((prev.pH ?? -1) - pBounds.height) > 2.0

    if (changed) {
      prevRef.current = {
        mL: mBounds.left, mT: mBounds.top, mW: mBounds.width, mH: mBounds.height,
        pL: pBounds.left, pT: pBounds.top, pW: pBounds.width, pH: pBounds.height,
      }
      onProjected({
        monitor: mBounds,
        phone: {
          ...pBounds,
          polygon: [pTL, pTR, pBR, pBL],
        },
        side: sBounds,
      })
    }
  })

  return null
}

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
  onLoaded,
  onProjected,
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

  const getObjectName = (obj) => {
    let curr = obj
    while (curr) {
      const name = curr.name ? curr.name.toLowerCase() : ''
      if (name.includes('book')) return 'about'
      if (name.includes('monitor')) return 'monitor'
      if (name.includes('mobile') || name.includes('phone')) return 'phone'
      curr = curr.parent
    }
    return null
  }

  const handlePointerMove = (e) => {
    if (isZoomedRef && isZoomedRef.current) return
    e.stopPropagation()
    const target = getObjectName(e.object)
    setHoveredObject(target)
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
    
    const target = getObjectName(e.object)
    if (target) {
      onObjectClick(target)
    }
  }

  return (
    <group>
      <primitive 
        object={glbScene} 
        rotation={[0, Math.PI, 0]} 
        onPointerMove={handlePointerMove}
        onPointerOver={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerDown={handleClick}
      />
      {onProjected && (
        <ScreenProjector onProjected={onProjected} />
      )}

      {/* 3D Red Spotting Glow Light when hovering over main objects */}
      {!isZoomed && hoveredObject === 'about' && (
        <pointLight position={[-0.37, 0.65, -1.45]} intensity={5.0} color="#ff007f" distance={2.0} />
      )}
      {!isZoomed && hoveredObject === 'monitor' && (
        <pointLight position={[-0.14, 0.70, -1.60]} intensity={5.0} color="#ff007f" distance={2.0} />
      )}
      {!isZoomed && hoveredObject === 'phone' && (
        <pointLight position={[0.48, 0.60, -1.40]} intensity={5.0} color="#ff007f" distance={2.0} />
      )}
      
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
