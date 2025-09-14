'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ThreeSceneManager, ThreeObjectFactory, ThreeAnimationUtils, ThreeDataVisualizer } from '@/lib/three-utils'

interface ThreeSceneProps {
  width?: number
  height?: number
  backgroundColor?: string
  enableShadows?: boolean
  enableControls?: boolean
  data?: any[]
  chartType?: 'bar' | 'pie' | 'network'
  className?: string
}

export default function ThreeScene({
  width = 400,
  height = 300,
  backgroundColor = '#f0f0f0',
  enableShadows = false,
  enableControls = false,
  data = [],
  chartType = 'bar',
  className = ''
}: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneManagerRef = useRef<ThreeSceneManager | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js scene
    const sceneManager = new ThreeSceneManager(containerRef.current, {
      width,
      height,
      backgroundColor,
      enableShadows,
      enableControls
    })

    sceneManagerRef.current = sceneManager

    // Create sample 3D objects
    createSampleScene(sceneManager, data, chartType)

    // Start animation
    sceneManager.startAnimation()
    setIsLoaded(true)

    // Cleanup
    return () => {
      sceneManager.dispose()
    }
  }, [width, height, backgroundColor, enableShadows, enableControls, data, chartType])

  const createSampleScene = (sceneManager: ThreeSceneManager, data: any[], chartType: string) => {
    const scene = sceneManager.getScene()
    const camera = sceneManager.getCamera()

    // Position camera
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)

    // Create ground plane
    const ground = ThreeObjectFactory.createPlane(20, 20, '#e0e0e0')
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2
    scene.add(ground)

    // Create sample objects based on chart type
    if (chartType === 'bar' && data.length > 0) {
      const barChart = ThreeDataVisualizer.createBarChart(data, Math.max(...data))
      scene.add(barChart)
    } else if (chartType === 'pie' && data.length > 0) {
      const pieData = data.map((item, index) => ({
        value: item.value || item,
        color: `hsl(${index * 60}, 70%, 50%)`,
        label: item.label || `Item ${index + 1}`
      }))
      const pieChart = ThreeDataVisualizer.createPieChart(pieData)
      scene.add(pieChart)
    } else if (chartType === 'network' && data.length > 0) {
      const networkData = data.map((item, index) => ({
        id: item.id || `node_${index}`,
        x: item.x || (Math.random() - 0.5) * 10,
        y: item.y || (Math.random() - 0.5) * 10,
        z: item.z || (Math.random() - 0.5) * 10,
        size: item.size || 0.5,
        color: item.color || `hsl(${index * 60}, 70%, 50%)`
      }))
      const edges = data.filter(item => item.connections).map(item => ({
        from: item.id,
        to: item.connections
      }))
      const networkGraph = ThreeDataVisualizer.createNetworkGraph(networkData, edges)
      scene.add(networkGraph)
    } else {
      // Create default sample objects
      const cube = ThreeObjectFactory.createCube(1, '#00ff00')
      cube.position.set(-2, 0, 0)
      scene.add(cube)

      const sphere = ThreeObjectFactory.createSphere(1, '#ff0000')
      sphere.position.set(2, 0, 0)
      scene.add(sphere)

      // Add animations
      ThreeAnimationUtils.rotateObject(cube, 0.01)
      ThreeAnimationUtils.bounceObject(sphere, 0.5, 0.02)
    }
  }

  const handleResize = () => {
    if (sceneManagerRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      sceneManagerRef.current.resize(rect.width, rect.height)
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`three-scene-container ${className}`}>
      <div
        ref={containerRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
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
