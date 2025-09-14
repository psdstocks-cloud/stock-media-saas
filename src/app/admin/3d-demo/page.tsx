'use client'

import React, { useState } from 'react'
import ThreeScene from '@/components/3d/ThreeScene'
import BabylonScene from '@/components/3d/BabylonScene'
import { Color3 } from '@babylonjs/core'

export default function ThreeDDemo() {
  const [engine, setEngine] = useState<'three' | 'babylon'>('three')
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'network'>('bar')

  // Sample data for different chart types
  const barData = [120, 190, 300, 500, 200, 300, 450, 320, 180, 250]
  const pieData = [
    { value: 35, label: 'Desktop', color: '#3b82f6' },
    { value: 25, label: 'Mobile', color: '#10b981' },
    { value: 20, label: 'Tablet', color: '#f59e0b' },
    { value: 20, label: 'Other', color: '#ef4444' }
  ]
  const networkData = [
    { id: 'node1', x: 0, y: 0, z: 0, size: 1, color: '#3b82f6' },
    { id: 'node2', x: 3, y: 0, z: 0, size: 0.8, color: '#10b981' },
    { id: 'node3', x: 0, y: 3, z: 0, size: 0.6, color: '#f59e0b' },
    { id: 'node4', x: -3, y: 0, z: 0, size: 0.9, color: '#ef4444' },
    { id: 'node5', x: 0, y: -3, z: 0, size: 0.7, color: '#8b5cf6' },
    { connections: 'node1' },
    { connections: 'node2' },
    { connections: 'node3' },
    { connections: 'node4' }
  ]

  const getCurrentData = () => {
    switch (chartType) {
      case 'bar':
        return barData
      case 'pie':
        return pieData
      case 'network':
        return networkData
      default:
        return barData
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">3D Visualization Demo</h1>
          <p className="text-gray-600">
            Interactive 3D visualizations using Three.js and Babylon.js libraries
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3D Engine
              </label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value as 'three' | 'babylon')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="three">Three.js - WebGL-based 3D graphics</option>
                <option value="babylon">Babylon.js - Complete 3D engine</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'bar' | 'pie' | 'network')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="network">Network Graph</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {engine === 'three' ? 'Three.js' : 'Babylon.js'} - {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </h2>
          
          <div className="flex justify-center">
            {engine === 'three' ? (
              <ThreeScene
                width={600}
                height={400}
                backgroundColor="#f8fafc"
                enableShadows={true}
                enableControls={true}
                data={getCurrentData()}
                chartType={chartType}
              />
            ) : (
              <BabylonScene
                width={600}
                height={400}
                backgroundColor={new Color3(0.97, 0.98, 0.99)}
                enableShadows={true}
                data={getCurrentData()}
                chartType={chartType}
              />
            )}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Three.js Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Lightweight WebGL-based 3D library
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Excellent performance and flexibility
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Large community and ecosystem
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Great for custom 3D visualizations
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Extensive documentation and examples
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Babylon.js Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Complete 3D engine with advanced features
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Built-in GUI system and controls
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Physics engine integration
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                VR/AR support out of the box
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Microsoft-backed with enterprise features
              </li>
            </ul>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Data Visualization</h4>
              <p className="text-sm text-gray-600">Interactive charts, graphs, and data representations</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">System Monitoring</h4>
              <p className="text-sm text-gray-600">Real-time system health and performance monitoring</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Interactive Dashboards</h4>
              <p className="text-sm text-gray-600">Engaging admin panels and user interfaces</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
