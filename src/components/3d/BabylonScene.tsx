'use client'

import React, { useEffect, useRef, useState } from 'react'
import { BabylonSceneManager, BabylonObjectFactory, BabylonAnimationUtils, BabylonDataVisualizer, BabylonGUIUtils } from '@/lib/babylon-utils'
import { Color3 } from '@babylonjs/core'

interface BabylonSceneProps {
  width?: number
  height?: number
  backgroundColor?: Color3
  enableShadows?: boolean
  enablePhysics?: boolean
  data?: any[]
  chartType?: 'bar' | 'pie' | 'network'
  className?: string
}

export default function BabylonScene({
  width = 400,
  height = 300,
  backgroundColor = new Color3(0.9, 0.9, 0.9),
  enableShadows = false,
  enablePhysics = false,
  data = [],
  chartType = 'bar',
  className = ''
}: BabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneManagerRef = useRef<BabylonSceneManager | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Babylon.js scene
    const sceneManager = new BabylonSceneManager(canvasRef.current, {
      backgroundColor,
      enableShadows,
      enablePhysics
    })

    sceneManagerRef.current = sceneManager

    // Create sample 3D objects
    createSampleScene(sceneManager, data, chartType)

    // Start render loop
    sceneManager.startRenderLoop()
    setIsLoaded(true)

    // Cleanup
    return () => {
      sceneManager.dispose()
    }
  }, [backgroundColor, enableShadows, enablePhysics, data, chartType])

  const createSampleScene = (sceneManager: BabylonSceneManager, data: any[], chartType: string) => {
    const scene = sceneManager.getScene()
    const camera = sceneManager.getCamera()

    // Create GUI
    const gui = sceneManager.createGUI()

    // Create sample objects based on chart type
    if (chartType === 'bar' && data.length > 0) {
      const barChart = BabylonDataVisualizer.createBarChart(scene, data, Math.max(...data))
    } else if (chartType === 'pie' && data.length > 0) {
      const pieData = data.map((item, index) => ({
        value: item.value || item,
        color: new Color3(
          Math.sin(index * 0.5) * 0.5 + 0.5,
          Math.sin(index * 0.5 + 2) * 0.5 + 0.5,
          Math.sin(index * 0.5 + 4) * 0.5 + 0.5
        ),
        label: item.label || `Item ${index + 1}`
      }))
      const pieChart = BabylonDataVisualizer.createPieChart(scene, pieData)
    } else if (chartType === 'network' && data.length > 0) {
      const networkData = data.map((item, index) => ({
        id: item.id || `node_${index}`,
        x: item.x || (Math.random() - 0.5) * 10,
        y: item.y || (Math.random() - 0.5) * 10,
        z: item.z || (Math.random() - 0.5) * 10,
        size: item.size || 0.5,
        color: new Color3(
          Math.sin(index * 0.5) * 0.5 + 0.5,
          Math.sin(index * 0.5 + 2) * 0.5 + 0.5,
          Math.sin(index * 0.5 + 4) * 0.5 + 0.5
        )
      }))
      const edges = data.filter(item => item.connections).map(item => ({
        from: item.id,
        to: item.connections
      }))
      const networkGraph = BabylonDataVisualizer.createNetworkGraph(scene, networkData, edges)
    } else {
      // Create default sample objects
      const cube = BabylonObjectFactory.createBox(scene, 1, new Color3(0, 1, 0))
      cube.position.set(-2, 0, 0)

      const sphere = BabylonObjectFactory.createSphere(scene, 1, new Color3(1, 0, 0))
      sphere.position.set(2, 0, 0)

      const cylinder = BabylonObjectFactory.createCylinder(scene, 2, 0.5, new Color3(0, 0, 1))
      cylinder.position.set(0, 1, 0)

      // Add animations
      BabylonAnimationUtils.rotateObject(scene, cube, 0.01)
      BabylonAnimationUtils.bounceObject(scene, sphere, 0.5, 0.02)
      BabylonAnimationUtils.pulseObject(scene, cylinder, 0.8, 1.2, 0.02)
    }

    // Add GUI elements
    BabylonGUIUtils.createTextBlock(gui, '3D Visualization', 10, 10, 24)
    BabylonGUIUtils.createButton(gui, 'Reset View', 10, 50, 100, 40)
  }

  const handleResize = () => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.resize()
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`babylon-scene-container ${className}`}>
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: '1px solid #ddd',
          borderRadius: '8px',
          display: 'block'
        }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}
