# 3D City Simulation

A Three.js-based 3D city simulation featuring procedurally generated buildings, animated vehicles, and interactive camera controls.

## Features

### City Generation
- **Dual Areas**: Main city area with urban buildings and suburban area with residential buildings
- **Tile System**: Each tile contains a 6x6 grid of building plots for dense urban environments
- **Building Types**: Low-detail buildings, regular buildings, skyscrapers, and suburban homes
- **Road Network**: Complete grid system with intersections and connecting road segments

### Vehicle System
- **Traffic Simulation**: 12 animated vehicles with collision avoidance system
- **Cross-Area Movement**: Vehicles can travel between city and suburban areas
- **Realistic Behavior**: Cars slow down and stop to avoid collisions
- **Transparency Effects**: Vehicles fade in/out at area boundaries

### Camera Controls
- **Overhead View**: Orbit controls for exploring the entire city
- **Car Camera**: Follow individual vehicles with mouse-controlled rotation
- **Interactive**: Drag mouse to look around, release to return to center
- **Switch Cars**: Button to jump between different vehicles

## File Structure

```
sim/
├── index.html          # Main HTML file with UI
├── city.js            # Scene setup, lighting, animation loop
├── roads.js           # Road and ground generation
├── buildings.js       # Building and tile creation
├── vehicles.js        # Vehicle movement and camera controls
├── buildings/         # Urban building models (GLB)
├── suburban/          # Suburban building models (GLB)
├── vehicles/          # Vehicle models (GLB)
└── roads/            # Road and tile models (GLB)
```

## Controls

- **Switch to Car Cam**: Toggle between overhead and vehicle camera
- **Switch Car**: Jump to a different vehicle (in car cam mode)
- **Mouse Drag**: Rotate camera view (in car cam mode)
- **Mouse Wheel**: Zoom in/out (in overhead mode)

## Technical Details

- **Framework**: Three.js with WebGL rendering
- **Models**: GLB format 3D models for buildings, vehicles, and roads
- **Lighting**: Directional and ambient lighting with shadow mapping
- **Performance**: Optimized collision detection and rendering

## Getting Started

1. Open `index.html` in a web browser
2. Use the buttons to switch between camera modes
3. Explore the city from overhead or follow vehicles up close
4. Watch traffic flow between the city and suburban areas

## Architecture

The simulation uses a modular architecture with separate files for different systems:
- City generation and scene management
- Road network and ground tiles
- Building placement and tile organization  
- Vehicle AI and camera controls

Each system is designed to be independent and reusable, making it easy to modify or extend the simulation.