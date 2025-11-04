'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi, candidatesApi, authApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { BriefcaseIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Job } from '@ats/shared';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function CandidateDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['public-jobs'],
    queryFn: async () => {
      const response = await publicApi.getJobs({ limit: 50 });
      return response.data.data;
    },
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['candidate-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const response = await candidatesApi.getById(user.id);
        const candidateData = response.data.data;
        if (candidateData) {
          const appsResponse = await candidatesApi.getAll({ search: candidateData.email });
          return appsResponse.data.data || [];
        }
        return [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const jobs = jobsData?.jobs || [];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b-4 border-neutral-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-3xl font-display font-bold hover:scale-105 transition-transform">
                🎯 ATS - Candidate Portal
              </h1>
            </Link>
            <div className="flex gap-4 items-center">
              {user && (
                <div className="text-sm">
                  <p className="font-bold">{user.firstName} {user.lastName}</p>
                  <p className="text-neutral-600">{user.email}</p>
                </div>
              )}
              <Link href="/track">
                <Button variant="outline">
                  📊 Track Application
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">
                  👤 Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b-4 border-neutral-900">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-4 font-bold border-b-4 transition-colors ${
                activeTab === 'jobs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              🔍 Browse Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-4 font-bold border-b-4 transition-colors ${
                activeTab === 'applications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              📄 My Applications ({Array.isArray(applications) ? applications.length : 0})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {activeTab === 'jobs' ? (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Available Jobs</h2>
              <p className="text-neutral-600 text-lg">
                Browse and apply to {jobs.length} open positions
              </p>
            </div>

            {jobsLoading ? (
              <div className="flex justify-center py-20">
                <div className="relative">
                  <div className="w-24 h-24 border-8 border-neutral-200 rounded-full"></div>
                  <div className="w-24 h-24 border-8 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <Card className="text-center py-20">
                <CardContent>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">No jobs available</h3>
                  <p className="text-neutral-600 text-lg">
                    Check back later for new opportunities
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {jobs.map((job: Job, idx: number) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/jobs/${job.id}`}>
                      <Card hover className="h-full cursor-pointer group">
                        <CardHeader className="relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300"></div>
                          <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="flex-1">
                              <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                                {job.title}
                              </CardTitle>
                              <Badge variant="success" size="lg">
                                ✨ Open
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm text-neutral-600 relative z-10">
                            <div className="flex items-center gap-2">
                              <BriefcaseIcon className="h-5 w-5 flex-shrink-0" />
                              <span className="font-bold">{job.department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-5 w-5 flex-shrink-0" />
                              <span className="font-bold">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                              <CalendarIcon className="h-5 w-5 flex-shrink-0" />
                              <span className="font-bold">
                                Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="default" size="lg">
                              {job.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="info" size="lg">
                              {job.experienceLevel}
                            </Badge>
                            {job.openings && (
                              <Badge variant="warning" size="lg">
                                {job.openings} {job.openings === 1 ? 'opening' : 'openings'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-neutral-600 line-clamp-3 mb-4 leading-relaxed">
                            {job.description}
                          </p>
                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.slice(0, 5).map((skill) => (
                                <Badge key={skill} variant="default" size="sm">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills.length > 5 && (
                                <Badge variant="default" size="sm">
                                  +{job.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                          <Button variant="primary" className="w-full group-hover:shadow-brutal-lg transition-shadow">
                            Apply Now →
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">My Applications</h2>
              <p className="text-neutral-600 text-lg">
                Track the status of your job applications
              </p>
            </div>

            {appsLoading ? (
              <div className="flex justify-center py-20">
                <div className="relative">
                  <div className="w-24 h-24 border-8 border-neutral-200 rounded-full"></div>
                  <div className="w-24 h-24 border-8 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
              </div>
            ) : !applications || applications.length === 0 ? (
              <Card className="text-center py-20">
                <CardContent>
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-2xl font-bold mb-2">No applications yet</h3>
                  <p className="text-neutral-600 text-lg mb-6">
                    Start applying to jobs to see them here
                  </p>
                  <Button variant="primary" onClick={() => setActiveTab('jobs')}>
                    Browse Jobs
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-lg text-neutral-600">
                      Feature coming soon! Your applications will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
