// src/lib/babylon-utils.ts
// Babylon.js utility functions for 3D visualizations

import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, Color4 } from '@babylonjs/core'
import { AdvancedDynamicTexture, Button, TextBlock, Rectangle } from '@babylonjs/gui'

export interface BabylonSceneConfig {
  enableShadows?: boolean
  enablePhysics?: boolean
  backgroundColor?: Color3
  enableVR?: boolean
}

export class BabylonSceneManager {
  private engine: Engine
  private scene: Scene
  private camera: ArcRotateCamera
  private light: HemisphericLight
  private advancedTexture?: AdvancedDynamicTexture

  constructor(private canvas: HTMLCanvasElement, config: BabylonSceneConfig = {}) {
    this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true })
    this.scene = new Scene(this.engine)
    
    this.setupCamera()
    this.setupLighting()
    this.setupEnvironment(config)
    
    if (config.enableShadows) {
      this.setupShadows()
    }
  }

  private setupCamera() {
    this.camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      Vector3.Zero(),
      this.scene
    )
    this.camera.attachControls(this.canvas, true)
  }

  private setupLighting() {
    this.light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene)
    this.light.intensity = 0.7
  }

  private setupEnvironment(config: BabylonSceneConfig) {
    if (config.backgroundColor) {
      this.scene.clearColor = new Color4(
        config.backgroundColor.r,
        config.backgroundColor.g,
        config.backgroundColor.b,
        1
      )
    }
  }

  private setupShadows() {
    // Enable shadows
    this.scene.shadowsEnabled = true
  }

  public startRenderLoop() {
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
  }

  public stopRenderLoop() {
    this.engine.stopRenderLoop()
  }

  public resize() {
    this.engine.resize()
  }

  public dispose() {
    this.scene.dispose()
    this.engine.dispose()
  }

  public getScene() {
    return this.scene
  }

  public getCamera() {
    return this.camera
  }

  public getEngine() {
    return this.engine
  }

  public createGUI() {
    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    return this.advancedTexture
  }
}

// Utility functions for creating common 3D objects
export class BabylonObjectFactory {
  static createBox(scene: Scene, size: number = 1, color: Color3 = Color3.Blue()) {
    const box = MeshBuilder.CreateBox('box', { size }, scene)
    const material = new StandardMaterial('boxMaterial', scene)
    material.diffuseColor = color
    box.material = material
    return box
  }

  static createSphere(scene: Scene, diameter: number = 1, color: Color3 = Color3.Red()) {
    const sphere = MeshBuilder.CreateSphere('sphere', { diameter }, scene)
    const material = new StandardMaterial('sphereMaterial', scene)
    material.diffuseColor = color
    sphere.material = material
    return sphere
  }

  static createPlane(scene: Scene, width: number = 10, height: number = 10, color: Color3 = Color3.Gray()) {
    const plane = MeshBuilder.CreatePlane('plane', { width, height }, scene)
    const material = new StandardMaterial('planeMaterial', scene)
    material.diffuseColor = color
    material.backFaceCulling = false
    plane.material = material
    return plane
  }

  static createCylinder(scene: Scene, height: number = 2, diameter: number = 1, color: Color3 = Color3.Green()) {
    const cylinder = MeshBuilder.CreateCylinder('cylinder', { height, diameter }, scene)
    const material = new StandardMaterial('cylinderMaterial', scene)
    material.diffuseColor = color
    cylinder.material = material
    return cylinder
  }

  static createTorus(scene: Scene, diameter: number = 2, thickness: number = 0.5, color: Color3 = Color3.Yellow()) {
    const torus = MeshBuilder.CreateTorus('torus', { diameter, thickness }, scene)
    const material = new StandardMaterial('torusMaterial', scene)
    material.diffuseColor = color
    torus.material = material
    return torus
  }
}

// Animation utilities
export class BabylonAnimationUtils {
  static rotateObject(scene: Scene, object: any, speed: number = 0.01) {
    scene.registerBeforeRender(() => {
      object.rotation.y += speed
    })
  }

  static bounceObject(scene: Scene, object: any, amplitude: number = 0.1, speed: number = 0.02) {
    const startY = object.position.y
    scene.registerBeforeRender(() => {
      object.position.y = startY + Math.sin(Date.now() * speed) * amplitude
    })
  }

  static pulseObject(scene: Scene, object: any, minScale: number = 0.8, maxScale: number = 1.2, speed: number = 0.02) {
    scene.registerBeforeRender(() => {
      const scale = minScale + (maxScale - minScale) * (Math.sin(Date.now() * speed) + 1) / 2
      object.scaling.setAll(scale)
    })
  }
}

// Data visualization helpers
export class BabylonDataVisualizer {
  static createBarChart(scene: Scene, data: number[], maxValue: number, barWidth: number = 0.8, spacing: number = 0.2) {
    const group = new BABYLON.TransformNode('barChart', scene)
    
    data.forEach((value, index) => {
      const height = (value / maxValue) * 10
      const bar = MeshBuilder.CreateBox(`bar_${index}`, { 
        width: barWidth, 
        height: height, 
        depth: barWidth 
      }, scene)
      
      const material = new StandardMaterial(`barMaterial_${index}`, scene)
      material.diffuseColor = new Color3(
        value / maxValue,
        1 - value / maxValue,
        0.5
      )
      bar.material = material
      
      bar.position.set(
        index * (barWidth + spacing),
        height / 2,
        0
      )
      
      bar.parent = group
    })
    
    return group
  }

  static createPieChart(scene: Scene, data: { value: number; color: Color3; label: string }[], radius: number = 5) {
    const group = new BABYLON.TransformNode('pieChart', scene)
    let currentAngle = 0
    const total = data.reduce((sum, item) => sum + item.value, 0)
    
    data.forEach((item, index) => {
      const angle = (item.value / total) * Math.PI * 2
      const cylinder = MeshBuilder.CreateCylinder(`slice_${index}`, {
        height: 0.1,
        diameter: radius * 2
      }, scene)
      
      const material = new StandardMaterial(`sliceMaterial_${index}`, scene)
      material.diffuseColor = item.color
      cylinder.material = material
      
      cylinder.rotation.z = currentAngle
      cylinder.parent = group
      
      currentAngle += angle
    })
    
    return group
  }

  static createNetworkGraph(scene: Scene, nodes: { id: string; x: number; y: number; z: number; size: number; color: Color3 }[], 
                          edges: { from: string; to: string }[]) {
    const group = new BABYLON.TransformNode('networkGraph', scene)
    const nodeMap = new Map()
    
    // Create nodes
    nodes.forEach(node => {
      const sphere = MeshBuilder.CreateSphere(`node_${node.id}`, { diameter: node.size }, scene)
      const material = new StandardMaterial(`nodeMaterial_${node.id}`, scene)
      material.diffuseColor = node.color
      sphere.material = material
      
      sphere.position.set(node.x, node.y, node.z)
      sphere.parent = group
      nodeMap.set(node.id, sphere)
    })
    
    // Create edges
    edges.forEach((edge, index) => {
      const fromNode = nodeMap.get(edge.from)
      const toNode = nodeMap.get(edge.to)
      
      if (fromNode && toNode) {
        const line = MeshBuilder.CreateLines(`edge_${index}`, {
          points: [fromNode.position, toNode.position]
        }, scene)
        line.parent = group
      }
    })
    
    return group
  }
}

// GUI utilities
export class BabylonGUIUtils {
  static createButton(texture: AdvancedDynamicTexture, text: string, x: number, y: number, width: number, height: number) {
    const button = Button.CreateSimpleButton('button', text)
    button.width = width
    button.height = height
    button.left = x
    button.top = y
    button.color = 'white'
    button.background = 'blue'
    button.cornerRadius = 10
    
    texture.addControl(button)
    return button
  }

  static createTextBlock(texture: AdvancedDynamicTexture, text: string, x: number, y: number, fontSize: number = 24) {
    const textBlock = new TextBlock('textBlock', text)
    textBlock.left = x
    textBlock.top = y
    textBlock.fontSize = fontSize
    textBlock.color = 'white'
    
    texture.addControl(textBlock)
    return textBlock
  }

  static createPanel(texture: AdvancedDynamicTexture, x: number, y: number, width: number, height: number, color: string = 'rgba(0,0,0,0.5)') {
    const panel = new Rectangle('panel')
    panel.left = x
    panel.top = y
    panel.width = width
    panel.height = height
    panel.color = color
    panel.thickness = 2
    panel.cornerRadius = 10
    
    texture.addControl(panel)
    return panel
  }
}
