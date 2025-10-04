'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InteractiveScreenshotProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  steps: {
    title: string
    description: string
    action: string
  }[]
  className?: string
}

export default function InteractiveScreenshot({ 
  title, 
  description, 
  icon: Icon, 
  steps, 
  className = '' 
}: InteractiveScreenshotProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsCompleted(true)
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 2000) // 2 seconds per step
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, isCompleted, steps.length])

  const handlePlay = () => {
    if (isCompleted) {
      setCurrentStep(0)
      setIsCompleted(false)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setIsCompleted(false)
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setIsPlaying(false)
    setIsCompleted(false)
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-center text-white">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlay}
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isPlaying ? 'Pause' : isCompleted ? 'Replay' : 'Play'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700">
        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-gradient-to-r from-purple-600 to-orange-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${index === currentStep ? 'ring-2 ring-orange-300' : ''}`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          {steps.map((step, index) => (
            <span
              key={index}
              className={`transition-colors ${
                index === currentStep ? 'text-orange-600 font-medium' : ''
              }`}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Screenshot Area */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative">
        {/* Placeholder for actual screenshot */}
        <div className="text-center">
          <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {steps[currentStep]?.title || title}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {steps[currentStep]?.description || description}
          </p>
          {steps[currentStep]?.action && (
            <div className="mt-4 px-4 py-2 bg-orange-100 dark:bg-orange-900 rounded-lg inline-block">
              <span className="text-orange-800 dark:text-orange-200 text-sm font-medium">
                {steps[currentStep].action}
              </span>
            </div>
          )}
        </div>

        {/* Overlay for completed state */}
        {isCompleted && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 dark:text-green-400 font-semibold">
                Process Complete!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Step Details */}
      <div className="p-4 bg-gray-50 dark:bg-slate-700">
        <div className="text-center">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Step {currentStep + 1} of {steps.length}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {steps[currentStep]?.description || 'Click play to start the demo'}
          </p>
        </div>
      </div>
    </div>
  )
}
