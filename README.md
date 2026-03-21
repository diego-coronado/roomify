# Roomify

An AI-powered room design visualization application that transforms your room photos with stunning 3D renderings. Upload a photo of your space, and Roomify generates photorealistic visualizations showing how your room would look with different interior design choices.

## Features

- 📸 Upload and process room photos
- 🤖 AI-powered 3D rendering using Google Gemini
- 🎨 Visualize different floor, wall, and furniture styles
- 👁️ Before/after comparison slider
- ☁️ Cloud storage integration with Puter
- 🔐 User authentication
- 📱 Responsive, modern UI
- ⚡️ Fast, optimized performance

## Tech Stack

- **Framework**: React Router 7 (full-stack React framework)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Backend/Auth**: Puter Cloud Service
- **AI/ML**: Google Gemini 2.5 Flash
- **UI Components**: Lucide React, React Compare Slider
- **Runtime**: Node.js

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Puter Configuration
VITE_PUTER_APP_ID=your_puter_app_id
```

You'll need:
- A [Puter account](https://puter.com) for authentication and file storage

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```
