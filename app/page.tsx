'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { FileText, Highlighter, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PDF Annotator</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Annotate PDFs with
            <span className="text-blue-600"> Precision</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload, highlight, and annotate PDF documents with ease. 
            Keep track of your annotations across sessions and collaborate with others.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Annotating
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Highlighter className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Highlighting
            </h3>
            <p className="text-gray-600">
              Select and highlight text with precision. Add notes and organize your thoughts.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Secure Storage
            </h3>
            <p className="text-gray-600">
              Your documents and annotations are securely stored and synced across sessions.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Personal Library
            </h3>
            <p className="text-gray-600">
              Organize all your annotated PDFs in one place with easy search and management.
            </p>
          </div>
        </div>

        {/* Demo Account Info */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">Try Demo Account</h3>
            <p className="text-sm text-blue-800">
              Email: demo@example.com<br />
              Password: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}