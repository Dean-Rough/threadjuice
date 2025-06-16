'use client';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Note: In a real app, you'd check user roles/permissions here
  // For now, we'll assume authenticated users can access admin
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          </div>
          
          <nav className="mt-6">
            <div className="px-6 py-2">
              <a 
                href="/admin" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Dashboard
              </a>
              <a 
                href="/admin/content" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Content
              </a>
              <a 
                href="/admin/media" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Media Library
              </a>
              <a 
                href="/admin/quizzes" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Quizzes
              </a>
              <a 
                href="/admin/analytics" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Analytics
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}