'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

function TrackApplicationContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [token, setToken] = useState(tokenParam || '');
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Please enter your tracking token');
      return;
    }

    setIsLoading(true);
    try {
      const response = await publicApi.trackApplication(token.trim());
      setApplication(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Application not found');
      setApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hired':
        return <CheckCircleIcon className="h-8 w-8 text-success" />;
      case 'rejected':
        return <XCircleIcon className="h-8 w-8 text-danger" />;
      default:
        return <ClockIcon className="h-8 w-8 text-info" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hired':
        return <Badge variant="success" size="lg">Hired</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="lg">Not Selected</Badge>;
      case 'interview':
        return <Badge variant="info" size="lg">Interview Stage</Badge>;
      case 'screening':
        return <Badge variant="warning" size="lg">Under Review</Badge>;
      default:
        return <Badge variant="default" size="lg">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b-4 border-neutral-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/jobs">
              <Button variant="outline">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            <Link href="/">
              <h1 className="text-3xl font-display font-bold">🎯 ATS</h1>
            </Link>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-display font-bold mb-4">
              Track Your Application
            </h2>
            <p className="text-xl text-neutral-600">
              Enter your tracking token to check your application status
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <form onSubmit={handleTrack}>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter your tracking token..."
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      className="text-lg"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="px-8"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                    Track
                  </Button>
                </div>
                <p className="text-sm text-neutral-500 mt-3">
                  💡 Your tracking token was provided when you submitted your application
                </p>
              </form>
            </CardContent>
          </Card>

          {application && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    {getStatusIcon(application.status)}
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Application Status</CardTitle>
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {application.job && (
                      <div className="p-4 bg-neutral-50 border-2 border-neutral-200 rounded-lg">
                        <h4 className="font-bold mb-2">Position Applied For</h4>
                        <p className="text-lg font-bold text-primary">{application.job.title}</p>
                        <p className="text-neutral-600">
                          {application.job.department} • {application.job.location}
                        </p>
                      </div>
                    )}

                    {application.candidate && (
                      <div>
                        <h4 className="font-bold mb-3">Applicant Information</h4>
                        <div className="space-y-2">
                          <p>
                            <span className="font-semibold">Name:</span>{' '}
                            {application.candidate.firstName} {application.candidate.lastName}
                          </p>
                          <p>
                            <span className="font-semibold">Email:</span>{' '}
                            {application.candidate.email}
                          </p>
                          <p>
                            <span className="font-semibold">Applied On:</span>{' '}
                            {format(new Date(application.submittedAt), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold mb-3">Current Stage</h4>
                      <div className="p-4 bg-info/10 border-2 border-info rounded-lg">
                        <p className="font-semibold text-info">{application.currentStage}</p>
                      </div>
                    </div>

                    {application.history && application.history.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-4">Application Timeline</h4>
                        <div className="space-y-4">
                          {application.history.map((event: any, idx: number) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-primary rounded-full" />
                                {idx < application.history.length - 1 && (
                                  <div className="w-0.5 h-full bg-neutral-300 mt-2" />
                                )}
                              </div>
                              <div className="flex-1 pb-6">
                                <p className="font-semibold">{event.action}</p>
                                <p className="text-sm text-neutral-600">
                                  {format(new Date(event.timestamp), 'MMM d, yyyy • h:mm a')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-primary/10 border-2 border-primary rounded-lg">
                      <h4 className="font-bold mb-2">What&apos;s Next?</h4>
                      <p className="text-neutral-700">
                        {application.status === 'hired'
                          ? 'Congratulations! Our team will contact you with next steps.'
                          : application.status === 'rejected'
                          ? 'Thank you for your interest. We encourage you to apply for other positions.'
                          : 'We\'re reviewing your application. You\'ll be notified of any updates via email.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      <footer className="bg-neutral-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neutral-400">© 2024 ATS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function TrackApplicationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    }>
      <TrackApplicationContent />
    </Suspense>
  );
}
