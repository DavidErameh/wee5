// app/error.tsx - Root error boundary
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from 'frosted-ui';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: { errorBoundary: 'root' },
      extra: { digest: error.digest }
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark rounded-lg border border-border p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h1>
        
        <p className="text-muted mb-6">
          We're sorry, but something unexpected happened. Our team has been notified
          and we're working on a fix.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={reset}
            color="accent"
            className="w-full"
          >
            Try again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="soft"
            className="w-full"
          >
            Return to home
          </Button>
        </div>
        
        {error.digest && (
          <p className="text-xs text-muted mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}