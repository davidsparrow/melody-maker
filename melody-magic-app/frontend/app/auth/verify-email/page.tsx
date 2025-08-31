'use client';

import Link from 'next/link';
import { CheckCircle, Mail, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Check your email
        </h2>
        
        <p className="text-gray-600 mb-6">
          We've sent you a confirmation link to verify your email address. 
          Please check your inbox and click the link to complete your account setup.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Check your spam folder if you don't see the email
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Back to Sign In
          </Link>
          
          <p className="text-sm text-gray-500">
            Already confirmed?{' '}
            <Link href="/auth/login" className="text-purple-600 hover:text-purple-500 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
