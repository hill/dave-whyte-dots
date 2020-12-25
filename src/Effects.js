import * as THREE from 'three'
import { useThree, useFrame, extend } from 'react-three-fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { useEffect } from 'react'

extend({ EffectComposer, ShaderPass, SavePass, RenderPass })

const triColorMix = {
  uniforms: {
    tDiffuse1: { value: null },
    tDiffuse2: { value: null },
    tDiffuse3: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse1;
    uniform sampler2D tDiffuse2;
    uniform sampler2D tDiffuse3;
    
    void main() {
      vec4 del0 = texture2D(tDiffuse1, vUv);
      vec4 del1 = texture2D(tDiffuse2, vUv);
      vec4 del2 = texture2D(tDiffuse3, vUv);
      float alpha = min(min(del0.a, del1.a), del2.a);
      gl_FragColor = vec4(del0.r, del1.g, del2.b, alpha);
    }
  `,
}

function Effects() {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree()

  const savePass = useRef()
  const blendPass = useRef()
  const swap = useRef(false) // Whether to swap the delay buffers
  const { rtA, rtB } = useMemo(() => {
    const rtA = new THREE.WebGLRenderTarget(size.width, size.height)
    const rtB = new THREE.WebGLRenderTarget(size.width, size.height)
    return { rtA, rtB }
  }, [size])

  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  useFrame(() => {
    composer.current.render()
  }, 1)

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <shaderPass attachArray="passes" ref={blendPass} args={[triColorMix, 'tDiffuse1']} needsSwap={false} />
      <savePass attachArray="passes" ref={savePass} needsSwap={true} />
      <shaderPass attachArray="passes" args={[CopyShader]} />
    </effectComposer>
  )
}
