# Football Portfolio Website

A Three.js based interactive portfolio website set in a football stadium, inspired by bruno-simon.com.

## Features

- **Interactive Stadium Environment**: Explore a 3D football stadium with realistic field, goals, and stands
- **Player Controls**: Control a player character with FIFA-style movement using WASD or Arrow Keys
- **Ball Dribbling**: The ball always stays in control and follows your movement direction
- **Penalty Shootout Mini-Game**:
  - Approach a penalty spot and press Enter to start
  - Use Arrow Keys to aim
  - Hold Space to power up, release to shoot
- **Resume Display**: View your resume as a TIFO banner on the stadium stands
- **Projects Showcase**: View your projects on the giant scoreboard (zoom in effect)
- **Analytics Dashboard**: Access analytics at the dugout screen showing:
  - xG (Expected Goals) Map
  - Possession Area
  - Ball Trajectory

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Controls

- **WASD / Arrow Keys**: Move player
- **Mouse**: Look around (click to enable pointer lock)
- **Enter**: Interact with objects (penalty spot, scoreboard, dugout, TIFO)
- **Space**: Shoot (in penalty mode - hold to power up, release to shoot)
- **ESC**: Cancel penalty mode

## Customization

### Update Resume

Edit the `showResume()` function in `main.js` to add your personal information.

### Update Projects

Edit the `showProjects()` function in `main.js` to showcase your projects.

### Customize Analytics

Modify the `drawXGMap()`, `drawPossessionArea()`, and `drawBallTrajectory()` functions to display your own analytics data.

### Adjust Stadium

Modify the `createStadium()` function to change stadium dimensions, colors, or add more features.

## Technologies

- Three.js - 3D graphics library
- Vite - Build tool and dev server

## Browser Support

Requires a modern browser with WebGL support.

## Acknowledgements

This project was developed with assistance from AI coding tools (e.g., Cursor + OpenAI’s GPT models) for tasks such as code generation, refactoring, and documentation.  
All code has been reviewed and tested by the project maintainer.
