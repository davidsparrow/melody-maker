'use client';

import React from 'react';
import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';

interface ConfigErrorProps {
  title?: string;
  message?: string;
  showHelp?: boolean;
}

export function ConfigError({ 
  title = "Configuration Required", 
  message = "Supabase is not properly configured. Please check your environment variables.",
  showHelp = true 
}: ConfigErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-yellow-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {showHelp && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg text-left">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Required Environment Variables:
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="font-mono bg-blue-100 px-2 py-1 rounded">
                  NEXT_PUBLIC_SUPABASE_URL
                </div>
                <div className="font-mono bg-blue-100 px-2 py-1 rounded">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                How to fix:
              </h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file in your project root</li>
                <li>Add your Supabase project URL and anon key</li>
                <li>Restart your development server</li>
              </ol>
            </div>

            <a
              href="https://supabase.com/docs/guides/getting-started/environment-variables"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Supabase Docs
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
