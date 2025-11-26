import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, LogOut, Calendar, FileText, Mail } from 'lucide-react';
import { authService } from '../../services/auth.service';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/candidates', icon: Users, label: 'Candidates' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs' },
  { path: '/interviews', icon: Calendar, label: 'Interviews' },
  { path: '/submissions', icon: Briefcase, label: 'Submissions' },
  { path: '/clients', icon: Briefcase, label: 'Clients' },
  { path: '/documents', icon: FileText, label: 'Documents' },
  { path: '/email-templates', icon: Mail, label: 'Email Templates' },
  { path: '/email-logs', icon: FileText, label: 'Email Logs' },
  { path: '/reports', icon: FileText, label: 'Reports' }
];

export default function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="w-64 bg-dark-100 border-r border-dark-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-500">BenchSales</h1>
        <p className="text-sm text-dark-500 mt-1">Recruiting Platform</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const handleClick = () => {
            if (item.label === 'Documents') {
              console.log('Sidebar: Navigating to', item.path);
            }
          };
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-primary-500 text-white' 
                  : 'text-dark-600 hover:bg-dark-200'
              }`}
              onClick={handleClick}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-dark-200">
        <button
          onClick={() => authService.logout()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-dark-600 hover:bg-dark-200 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
