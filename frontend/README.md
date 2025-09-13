# Unity Suite ERP - Frontend

## Project Overview

This is the frontend application for the Unity Suite ERP system, built with modern web technologies to provide a comprehensive enterprise resource planning solution.

## Features

- **HR Management**: Employee management, attendance tracking, leave requests, payroll
- **Finance Management**: Accounts, transactions, budgeting, financial reports
- **Admin Panel**: User management, system settings, monitoring
- **Authentication**: Role-based access control with separate login portals

## How to run this project

### Prerequisites

Make sure you have Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup Steps

```sh
# Step 1: Navigate to the frontend directory
cd frontend

# Step 2: Install the necessary dependencies
npm install

# Step 3: Start the development server with auto-reloading
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## What technologies are used for this project?

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library with hooks
- **Shadcn/UI** - Modern component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
│   ├── auth/      # Authentication pages
│   ├── hr/        # HR management pages
│   ├── finance/   # Finance management pages
│   └── admin/     # Admin panel pages
├── contexts/      # React contexts
├── lib/           # Utility functions
└── styles/        # CSS and styling files
```

## Backend Integration

This frontend is designed to work with the Spring Boot backend located in the root directory of this repository. Make sure to run both the frontend and backend servers for the complete ERP system.

## Deployment

Build the project for production:

```sh
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.
