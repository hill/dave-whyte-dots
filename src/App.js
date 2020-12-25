// https://tympanus.net/codrops/2020/12/17/recreating-a-dave-whyte-animation-in-react-three-fiber/
import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import * as THREE from 'three'

const roundedSquareWave = (t, delta, a, f) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}

function Dots() {
  const ref = useRef()

  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()

    const positions = [...Array(10000)].map((_, i) => {
      const position = new THREE.Vector3()
      position.x = (i % 100) - 50
      position.y = Math.floor(i / 100) - 50
      position.y += (i % 2) * 0.5 // (hex pattern)
      position.x += Math.random() * 0.3
      position.y += Math.random() * 0.3
      return position
    })

    const right = new THREE.Vector3(1, 0, 0)
    const distances = positions.map(
      (pos) => pos.length() + Math.cos(pos.angleTo(right) * 8) * 0.5 // hexagon wave out
    )

    return { vec, transform, positions, distances }
  }, [])

  useFrame(({ clock }) => {
    // const scale = 1 + Math.sin(clock.elapsedTime) * 0.3
    const speed = 1 / 3.8
    const zoomDistance = 0.4
    for (let i = 0; i < 10000; i++) {
      const dist = distances[i]
      // distance affects the wave phase
      const t = clock.elapsedTime - dist / 25
      const cornerCurveSharpness = 0.15 + (0.2 * dist) / 72 // bad name.
      const wave = roundedSquareWave(t, cornerCurveSharpness, zoomDistance, speed)
      const scale = 1.3 + wave

      // scale iniital position by our oscillator
      vec.copy(positions[i]).multiplyScalar(scale)

      // apply vector3 to a matrix4
      transform.setPosition(vec)

      // update matrix4 for this instance
      ref.current.setMatrixAt(i, transform)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 10000]}>
      <circleBufferGeometry args={[0.15]} />
      <meshBasicMaterial />
    </instancedMesh>
  )
}

export default function App() {
  return (
    <Canvas orthographic camera={{ zoom: 20 }} colorManagement={false}>
      <color attach="background" args={['black']} />
      <Dots />
    </Canvas>
  )
}
