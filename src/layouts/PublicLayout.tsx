import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Simple Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-blue-600">
            Recruit<span className="text-gray-800">SaaS</span>
          </div>
          <a href="/login" className="text-sm font-medium text-gray-500 hover:text-blue-600">
            Recruiter Login
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          Powered by RecruitSaaS Platform
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
