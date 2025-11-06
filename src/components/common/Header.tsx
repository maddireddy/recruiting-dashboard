import { Search, User } from 'lucide-react';

export default function Header() {
  const userEmail = localStorage.getItem('userId') || 'User';
  
  return (
    <header className="h-16 bg-dark-100 border-b border-dark-200 flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={20} />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-6 pl-4 border-l border-dark-200">
        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <span className="text-sm font-medium">{userEmail}</span>
      </div>
    </header>
  );
}
