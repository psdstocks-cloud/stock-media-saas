'use client'

import React, { useState, useEffect } from 'react'
import ThreeScene from '@/components/3d/ThreeScene'
import BabylonScene from '@/components/3d/BabylonScene'
import { Color3 } from '@babylonjs/core'
import { Activity, Server, Database, Globe, AlertTriangle, CheckCircle } from 'lucide-react'

interface SystemHealth3DProps {
  healthData: {
    database: { status: string; responseTime: number; lastChecked: string }
    api: { status: string; responseTime: number; lastChecked: string }
    payment: { status: string; responseTime: number; lastChecked: string }
    email: { status: string; responseTime: number; lastChecked: string }
  }
  className?: string
}

export default function SystemHealth3D({ healthData, className = '' }: SystemHealth3DProps) {
  const [engine, setEngine] = useState<'three' | 'babylon'>('three')
  const [networkData, setNetworkData] = useState<any[]>([])

  useEffect(() => {
    // Convert health data to network graph format
    const services = Object.entries(healthData).map(([key, value], index) => ({
      id: key,
      x: Math.cos((index * Math.PI * 2) / 4) * 5,
      y: Math.sin((index * Math.PI * 2) / 4) * 5,
      z: 0,
      size: value.status === 'healthy' ? 1 : value.status === 'warning' ? 0.7 : 0.4,
      color: value.status === 'healthy' ? '#10b981' : value.status === 'warning' ? '#f59e0b' : '#ef4444'
    }))

    // Create connections between services
    const connections = [
      { from: 'database', to: 'api' },
      { from: 'api', to: 'payment' },
      { from: 'api', to: 'email' },
      { from: 'payment', to: 'database' }
    ]

    setNetworkData([...services, ...connections])
  }, [healthData])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'database':
        return <Database className="w-5 h-5" />
      case 'api':
        return <Server className="w-5 h-5" />
      case 'payment':
        return <Globe className="w-5 h-5" />
      case 'email':
        return <Activity className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  return (
    <div className={`system-health-3d ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">3D System Health Monitor</h3>
        
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Network Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Service Network Topology</h4>
          
          {engine === 'three' ? (
            <ThreeScene
              width={500}
              height={400}
              backgroundColor="#f8fafc"
              enableShadows={true}
              enableControls={true}
              data={networkData}
              chartType="network"
              className="mx-auto"
            />
          ) : (
            <BabylonScene
              width={500}
              height={400}
              backgroundColor={new Color3(0.97, 0.98, 0.99)}
              enableShadows={true}
              data={networkData}
              chartType="network"
              className="mx-auto"
            />
          )}
        </div>

        {/* Service Status Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Service Status</h4>
          
          <div className="space-y-4">
            {Object.entries(healthData).map(([service, data]) => (
              <div key={service} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(service)}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {service}
                    </span>
                  </div>
                  {getStatusIcon(data.status)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      data.status === 'healthy' ? 'text-green-600' :
                      data.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Response Time:</span>
                    <span className="font-medium">{data.responseTime}ms</span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Last Checked:</span>
                    <span className="font-medium">
                      {new Date(data.lastChecked).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Health Score */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Health</span>
              <span className="text-lg font-bold text-gray-900">
                {Math.round(
                  (Object.values(healthData).filter(s => s.status === 'healthy').length / 
                   Object.keys(healthData).length) * 100
                )}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(Object.values(healthData).filter(s => s.status === 'healthy').length / 
                           Object.keys(healthData).length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Healthy</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Warning</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Critical</span>
        </div>
      </div>
    </div>
  )
}
