# I'm Gonna Hurt SAT

A bold, interactive SAT practice tutor built with React, TypeScript, and Tailwind CSS.

## Features

- **Practice Sessions**: Targeted practice for Reading & Writing and Math sections
- **Multiple Categories**: 8 different SAT topic categories to master
- **AI Teacher**: Get instant help with SAT questions and strategies
- **Progress Tracking**: Monitor your performance by topic and overall accuracy
- **Timed Practice**: Optional timer mode with SAT-accurate timing (1:11 for Reading, 1:35 for Math)
- **Diagnostic Tests**: Identify your weak spots
- **Bold Design**: Engaging UI with high-contrast blue and yellow color scheme

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **localStorage** - Progress persistence

## Development

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## Deploy to Vercel

This app is optimized for Vercel deployment. Follow these steps:

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   Follow the prompts to link your project and deploy.

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

### Build Settings (Auto-detected by Vercel)

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

No additional configuration needed! Vercel automatically detects Vite projects.

## Project Structure

```
ImGonnaHurtSAT/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # React entry point
│   ├── index.css        # Global styles & Tailwind imports
│   └── vite-env.d.ts    # TypeScript type definitions
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run preview` - Preview the production build locally

## Environment Variables

No environment variables are required for basic functionality. The app uses browser `localStorage` for data persistence.

## Browser Support

Modern browsers with ES2020 support:
- Chrome/Edge 80+
- Firefox 80+
- Safari 14+

## License

All rights reserved.
