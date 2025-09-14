# 3D Libraries Integration

This document describes the integration of Three.js and Babylon.js 3D libraries into the Stock Media SaaS admin panel.

## Overview

We've added two powerful 3D graphics libraries to enhance the admin panel with interactive 3D visualizations:

- **Three.js**: Lightweight WebGL-based 3D library for custom visualizations
- **Babylon.js**: Complete 3D engine with advanced features and GUI support

## Installation

The libraries are already installed via npm:

```bash
npm install three @types/three @babylonjs/core @babylonjs/loaders @babylonjs/materials @babylonjs/gui
```

## File Structure

```
src/
├── lib/
│   ├── three-utils.ts          # Three.js utility functions
│   └── babylon-utils.ts        # Babylon.js utility functions
├── components/
│   ├── 3d/
│   │   ├── ThreeScene.tsx      # Three.js React component
│   │   └── BabylonScene.tsx    # Babylon.js React component
│   └── admin/
│       └── 3d/
│           ├── Analytics3D.tsx # 3D analytics visualization
│           └── SystemHealth3D.tsx # 3D system health monitor
└── app/
    └── admin/
        └── 3d-demo/
            └── page.tsx        # 3D demo page
```

## Features

### Three.js Features
- ✅ Lightweight WebGL-based 3D graphics
- ✅ Custom scene management
- ✅ Object factory for common 3D shapes
- ✅ Animation utilities
- ✅ Data visualization helpers
- ✅ Bar charts, pie charts, network graphs
- ✅ Interactive controls (orbit controls)

### Babylon.js Features
- ✅ Complete 3D engine with advanced features
- ✅ Built-in GUI system
- ✅ Physics engine integration
- ✅ VR/AR support
- ✅ Advanced materials and lighting
- ✅ Scene management
- ✅ Data visualization tools

## Usage Examples

### Basic Three.js Scene

```tsx
import ThreeScene from '@/components/3d/ThreeScene'

function MyComponent() {
  return (
    <ThreeScene
      width={400}
      height={300}
      backgroundColor="#f0f0f0"
      enableShadows={true}
      enableControls={true}
      data={[1, 2, 3, 4, 5]}
      chartType="bar"
    />
  )
}
```

### Basic Babylon.js Scene

```tsx
import BabylonScene from '@/components/3d/BabylonScene'
import { Color3 } from '@babylonjs/core'

function MyComponent() {
  return (
    <BabylonScene
      width={400}
      height={300}
      backgroundColor={new Color3(0.9, 0.9, 0.9)}
      enableShadows={true}
      data={[1, 2, 3, 4, 5]}
      chartType="bar"
    />
  )
}
```

### Advanced Analytics Visualization

```tsx
import Analytics3D from '@/components/admin/3d/Analytics3D'

function AdminDashboard() {
  const data = {
    users: 1250,
    orders: 3400,
    revenue: 45000,
    subscriptions: 890
  }

  return (
    <Analytics3D 
      data={data}
      className="mb-8"
    />
  )
}
```

### System Health Monitoring

```tsx
import SystemHealth3D from '@/components/admin/3d/SystemHealth3D'

function AdminDashboard() {
  const healthData = {
    database: { status: 'healthy', responseTime: 45, lastChecked: new Date().toISOString() },
    api: { status: 'healthy', responseTime: 120, lastChecked: new Date().toISOString() },
    payment: { status: 'warning', responseTime: 800, lastChecked: new Date().toISOString() },
    email: { status: 'healthy', responseTime: 200, lastChecked: new Date().toISOString() }
  }

  return (
    <SystemHealth3D 
      healthData={healthData}
      className="mb-8"
    />
  )
}
```

## Chart Types

### Bar Chart
- Displays data as 3D bars
- Color-coded by value
- Interactive scaling and positioning

### Pie Chart
- 3D pie slices with custom colors
- Labels and value display
- Interactive rotation

### Network Graph
- 3D node and edge visualization
- Customizable node sizes and colors
- Interactive connections

## Customization

### Three.js Customization

```typescript
import { ThreeSceneManager, ThreeObjectFactory } from '@/lib/three-utils'

// Create custom scene
const sceneManager = new ThreeSceneManager(container, {
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  enableShadows: true,
  enableControls: true
})

// Add custom objects
const cube = ThreeObjectFactory.createCube(2, '#ff0000')
sceneManager.addObject(cube)

// Start animation
sceneManager.startAnimation()
```

### Babylon.js Customization

```typescript
import { BabylonSceneManager, BabylonObjectFactory } from '@/lib/babylon-utils'
import { Color3 } from '@babylonjs/core'

// Create custom scene
const sceneManager = new BabylonSceneManager(canvas, {
  backgroundColor: new Color3(0, 0, 0),
  enableShadows: true,
  enablePhysics: true
})

// Add custom objects
const sphere = BabylonObjectFactory.createSphere(scene, 2, new Color3(1, 0, 0))
scene.add(sphere)

// Start render loop
sceneManager.startRenderLoop()
```

## Performance Considerations

### Three.js
- Use `dispose()` method to clean up resources
- Implement proper animation loop management
- Use LOD (Level of Detail) for complex scenes
- Optimize geometry and materials

### Babylon.js
- Use `dispose()` method for cleanup
- Implement proper render loop management
- Use instanced rendering for repeated objects
- Optimize textures and materials

## Browser Support

### Three.js
- Modern browsers with WebGL support
- Chrome 9+, Firefox 4+, Safari 5.1+, Edge 12+

### Babylon.js
- Modern browsers with WebGL support
- Chrome 9+, Firefox 4+, Safari 5.1+, Edge 12+
- Better mobile support than Three.js

## Troubleshooting

### Common Issues

1. **WebGL not supported**: Check browser compatibility
2. **Performance issues**: Reduce scene complexity or use LOD
3. **Memory leaks**: Ensure proper cleanup with `dispose()`
4. **Canvas sizing**: Use proper width/height props

### Debug Mode

Enable debug mode by adding `?debug=true` to the URL for additional logging and performance metrics.

## Future Enhancements

- [ ] VR/AR support with Babylon.js
- [ ] Physics simulation integration
- [ ] Advanced shader materials
- [ ] Real-time data streaming
- [ ] Collaborative 3D editing
- [ ] Export to 3D formats (GLTF, OBJ)

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [3D Graphics Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
