'use client'

import React, { useState, useEffect } from 'react'
import ThreeScene from '@/components/3d/ThreeScene'
import BabylonScene from '@/components/3d/BabylonScene'
import { Color3 } from '@babylonjs/core'

interface Analytics3DProps {
  data: {
    users: number
    orders: number
    revenue: number
    subscriptions: number
  }
  className?: string
}

export default function Analytics3D({ data, className = '' }: Analytics3DProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'network'>('bar')
  const [engine, setEngine] = useState<'three' | 'babylon'>('three')
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Convert data to chart format
    const formattedData = [
      { value: data.users, label: 'Users', color: '#3b82f6' },
      { value: data.orders, label: 'Orders', color: '#10b981' },
      { value: data.revenue, label: 'Revenue', color: '#f59e0b' },
      { value: data.subscriptions, label: 'Subscriptions', color: '#ef4444' }
    ]
    setChartData(formattedData)
  }, [data])

  return (
    <div className={`analytics-3d ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">3D Analytics Visualization</h3>
        
        <div className="flex items-center space-x-4">
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Chart Type:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'bar' | 'pie' | 'network')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="network">Network Graph</option>
            </select>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Engine:</label>
            <select
              value={engine}
              onChange={(e) => setEngine(e.target.value as 'three' | 'babylon')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="three">Three.js</option>
              <option value="babylon">Babylon.js</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Visualization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            {engine === 'three' ? 'Three.js' : 'Babylon.js'} - {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </h4>
          
          {engine === 'three' ? (
            <ThreeScene
              width={400}
              height={300}
              backgroundColor="#f8fafc"
              enableShadows={true}
              enableControls={true}
              data={chartData}
              chartType={chartType}
              className="mx-auto"
            />
          ) : (
            <BabylonScene
              width={400}
              height={300}
              backgroundColor={new Color3(0.97, 0.98, 0.99)}
              enableShadows={true}
              data={chartData}
              chartType={chartType}
              className="mx-auto"
            />
          )}
        </div>

        {/* Data Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Data Summary</h4>
          
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Total Value</span>
              <span className="text-lg font-bold text-blue-900">
                {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {engine === 'three' ? (
          <p>Three.js - WebGL-based 3D graphics library with excellent performance</p>
        ) : (
          <p>Babylon.js - Complete 3D engine with advanced features and GUI support</p>
        )}
      </div>
    </div>
  )
}
