# Recruiting Dashboard

A modern React-based recruiting dashboard built with TypeScript, Vite, and Tailwind CSS. Features include candidate management, job tracking, client relationships, document handling, and more.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: React Query (TanStack Query)
- **Forms & Validation**: React Hook Form, Zod
- **HTTP Client**: Axios with interceptors
- **Development Tools**: ESLint, MSW (Mock Service Worker)
- **Backend Integration**: RESTful APIs with JWT authentication and tenant scoping

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API server running (default: http://localhost:8084)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd recruiting-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment in `.env`:
   - Set `VITE_API_URL` to your backend API URL
   - Set `VITE_USE_MOCKS=true` for development with MSW mocks (when backend is not available)

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_API_URL`: Backend API base URL (default: http://localhost:8084/api)
- `VITE_USE_MOCKS`: Enable MSW mocks for development (default: false)

**Note**: Vite proxy is configured to forward `/api` requests to the backend, avoiding CORS issues in development.

## Development

### Mock Service Worker (MSW)

MSW is used to mock API responses during development. Set `VITE_USE_MOCKS=true` in your `.env` file to enable mocks.

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components (Table, Header, etc.)
│   ├── candidates/     # Candidate-specific components
│   ├── jobs/          # Job-related components
│   └── ...
├── pages/              # Page components
├── services/           # API services and hooks
├── store/              # State management
├── types/              # TypeScript type definitions
└── mocks/              # MSW mock handlers
```

### Key Features

- **Authentication**: JWT-based login with tenant scoping
- **Real-time Data**: React Query for caching and optimistic updates
- **Form Validation**: Zod schemas for type-safe validation
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Error Handling**: Toast notifications and graceful error states
- **File Uploads**: Drag-and-drop file handling with progress

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for type safety
3. Add tests for new features
4. Update documentation as needed

## License

[Add your license here]
