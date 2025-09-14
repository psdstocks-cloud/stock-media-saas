// src/lib/three-utils.ts
// Three.js utility functions for 3D visualizations

import * as THREE from 'three'

export interface ThreeSceneConfig {
  width?: number
  height?: number
  backgroundColor?: string
  enableShadows?: boolean
  enableControls?: boolean
}

export class ThreeSceneManager {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls?: any
  private animationId?: number

  constructor(private container: HTMLElement, config: ThreeSceneConfig = {}) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      (config.width || container.clientWidth) / (config.height || container.clientHeight),
      0.1,
      1000
    )
    
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    })
    
    this.setupRenderer(config)
    this.setupLighting(config.enableShadows || false)
    this.setupControls(config.enableControls || false)
  }

  private setupRenderer(config: ThreeSceneConfig) {
    this.renderer.setSize(
      config.width || this.container.clientWidth,
      config.height || this.container.clientHeight
    )
    this.renderer.setPixelRatio(window.devicePixelRatio)
    
    if (config.backgroundColor) {
      this.renderer.setClearColor(config.backgroundColor)
    }
    
    this.container.appendChild(this.renderer.domElement)
  }

  private setupLighting(enableShadows: boolean) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    
    if (enableShadows) {
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    }
    
    this.scene.add(directionalLight)
  }

  private setupControls(enableControls: boolean) {
    if (enableControls) {
      // Note: You'll need to install @types/three and import OrbitControls
      // import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
      // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    }
  }

  public addObject(object: THREE.Object3D) {
    this.scene.add(object)
  }

  public removeObject(object: THREE.Object3D) {
    this.scene.remove(object)
  }

  public startAnimation() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      
      if (this.controls) {
        this.controls.update()
      }
      
      this.renderer.render(this.scene, this.camera)
    }
    
    animate()
  }

  public stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  public dispose() {
    this.stopAnimation()
    this.renderer.dispose()
    this.container.removeChild(this.renderer.domElement)
  }

  public getScene() {
    return this.scene
  }

  public getCamera() {
    return this.camera
  }

  public getRenderer() {
    return this.renderer
  }
}

// Utility functions for creating common 3D objects
export class ThreeObjectFactory {
  static createCube(size: number = 1, color: string = '#00ff00'): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(size, size, size)
    const material = new THREE.MeshLambertMaterial({ color })
    return new THREE.Mesh(geometry, material)
  }

  static createSphere(radius: number = 1, color: string = '#ff0000'): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(radius, 32, 32)
    const material = new THREE.MeshLambertMaterial({ color })
    return new THREE.Mesh(geometry, material)
  }

  static createPlane(width: number = 10, height: number = 10, color: string = '#cccccc'): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide })
    return new THREE.Mesh(geometry, material)
  }

  static createLine(points: THREE.Vector3[], color: string = '#0000ff'): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color })
    return new THREE.Line(geometry, material)
  }

  static createText(text: string, size: number = 1): THREE.Group {
    // Note: For text, you'll need to use TextGeometry with a font
    // This is a placeholder - you'll need to load a font and use TextGeometry
    const group = new THREE.Group()
    // Implementation would go here
    return group
  }
}

// Animation utilities
export class ThreeAnimationUtils {
  static rotateObject(object: THREE.Object3D, speed: number = 0.01) {
    object.rotation.x += speed
    object.rotation.y += speed
  }

  static bounceObject(object: THREE.Object3D, amplitude: number = 0.1, speed: number = 0.02) {
    object.position.y = Math.sin(Date.now() * speed) * amplitude
  }

  static pulseObject(object: THREE.Object3D, minScale: number = 0.8, maxScale: number = 1.2, speed: number = 0.02) {
    const scale = minScale + (maxScale - minScale) * (Math.sin(Date.now() * speed) + 1) / 2
    object.scale.setScalar(scale)
  }
}

// Data visualization helpers
export class ThreeDataVisualizer {
  static createBarChart(data: number[], maxValue: number, barWidth: number = 0.8, spacing: number = 0.2) {
    const group = new THREE.Group()
    
    data.forEach((value, index) => {
      const height = (value / maxValue) * 10 // Scale to reasonable height
      const bar = ThreeObjectFactory.createCube(barWidth, height, `hsl(${(value / maxValue) * 120}, 70%, 50%)`)
      bar.position.set(index * (barWidth + spacing), height / 2, 0)
      group.add(bar)
    })
    
    return group
  }

  static createPieChart(data: { value: number; color: string; label: string }[], radius: number = 5) {
    const group = new THREE.Group()
    let currentAngle = 0
    const total = data.reduce((sum, item) => sum + item.value, 0)
    
    data.forEach((item) => {
      const angle = (item.value / total) * Math.PI * 2
      const geometry = new THREE.ConeGeometry(radius, 1, 32, 1, true, currentAngle, angle)
      const material = new THREE.MeshLambertMaterial({ color: item.color })
      const slice = new THREE.Mesh(geometry, material)
      
      slice.rotation.z = currentAngle
      group.add(slice)
      
      currentAngle += angle
    })
    
    return group
  }

  static createNetworkGraph(nodes: { id: string; x: number; y: number; z: number; size: number; color: string }[], 
                          edges: { from: string; to: string }[]) {
    const group = new THREE.Group()
    
    // Create nodes
    const nodeMap = new Map()
    nodes.forEach(node => {
      const sphere = ThreeObjectFactory.createSphere(node.size, node.color)
      sphere.position.set(node.x, node.y, node.z)
      sphere.userData = { id: node.id }
      group.add(sphere)
      nodeMap.set(node.id, sphere)
    })
    
    // Create edges
    edges.forEach(edge => {
      const fromNode = nodeMap.get(edge.from)
      const toNode = nodeMap.get(edge.to)
      
      if (fromNode && toNode) {
        const points = [
          fromNode.position.clone(),
          toNode.position.clone()
        ]
        const line = ThreeObjectFactory.createLine(points, '#666666')
        group.add(line)
      }
    })
    
    return group
  }
}
