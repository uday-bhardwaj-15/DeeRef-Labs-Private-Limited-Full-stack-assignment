'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { FileText, User, LogOut, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {showNav && user && (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">PDF Annotator</span>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={showNav ? 'pt-0' : 'pt-0'}>
        {children}
      </main>
    </div>
  );
}