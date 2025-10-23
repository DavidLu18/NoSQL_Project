'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { Job, JobType, ExperienceLevel } from '@ats/shared';
import Link from 'next/link';
import { format } from 'date-fns';

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['public-jobs', search, location, type, experienceLevel],
    queryFn: async () => {
      const response = await publicApi.getJobs({
        search,
        location,
        type,
        experienceLevel,
      });
      return response.data.data;
    },
  });

  const jobs = data?.jobs || [];
  const total = data?.total || 0;

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setType('');
    setExperienceLevel('');
  };

  const hasActiveFilters = search || location || type || experienceLevel;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b-4 border-neutral-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-3xl font-display font-bold hover:scale-105 transition-transform">
                🎯 ATS
              </h1>
            </Link>
            <div className="flex gap-4">
              <Link href="/track">
                <Button variant="outline">
                  📊 Track Application
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary">
                  👤 Recruiter Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent-yellow border-b-4 border-neutral-900 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h2 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-6xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-brutal"
            >
              Find Your Dream Job 🚀
            </motion.h2>
            <p className="text-2xl text-white/90 mb-10 font-bold">
              {total} amazing opportunities waiting for you
            </p>

            {/* Search Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-brutal border-4 border-neutral-900">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 border-4 border-neutral-900 rounded-xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-primary/20"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  )}
                </div>
                <div className="flex-1 relative">
                  <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 border-4 border-neutral-900 rounded-xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-primary/20"
                  />
                  {location && (
                    <button
                      onClick={() => setLocation('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  )}
                </div>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="px-8 md:px-12 whitespace-nowrap"
                >
                  <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
                  Search {jobs.length > 0 && `(${jobs.length})`}
                </Button>
              </div>

              {/* Filter Toggle */}
              <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                    {hasActiveFilters && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-white rounded-full text-xs font-bold">
                        {[search, location, type, experienceLevel].filter(Boolean).length}
                      </span>
                    )}
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={clearFilters}
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
                
                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-neutral-600">Active:</span>
                    {search && (
                      <Badge variant="info" size="sm">
                        Search: &quot;{search}&quot;
                        <button onClick={() => setSearch('')} className="ml-2 hover:text-danger">×</button>
                      </Badge>
                    )}
                    {location && (
                      <Badge variant="warning" size="sm">
                        📍 {location}
                        <button onClick={() => setLocation('')} className="ml-2 hover:text-danger">×</button>
                      </Badge>
                    )}
                    {type && (
                      <Badge variant="secondary" size="sm">
                        {type}
                        <button onClick={() => setType('')} className="ml-2 hover:text-danger">×</button>
                      </Badge>
                    )}
                    {experienceLevel && (
                      <Badge variant="success" size="sm">
                        {experienceLevel}
                        <button onClick={() => setExperienceLevel('')} className="ml-2 hover:text-danger">×</button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t-4 border-neutral-900">
                      <div>
                        <label className="block text-sm font-bold mb-2 text-neutral-900">Job Type</label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full px-4 py-3 border-4 border-neutral-900 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                        >
                          <option value="">All Types</option>
                          {Object.values(JobType).map((t) => (
                            <option key={t} value={t}>
                              {t.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 text-neutral-900">Experience Level</label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full px-4 py-3 border-4 border-neutral-900 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                        >
                          <option value="">All Levels</option>
                          {Object.values(ExperienceLevel).map((l) => (
                            <option key={l} value={l}>
                              {l.charAt(0).toUpperCase() + l.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b-4 border-neutral-900 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{total}</p>
              <p className="text-sm font-bold text-neutral-600">Open Positions</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-secondary">{jobs.filter((j: Job) => j.type === JobType.FULL_TIME).length}</p>
              <p className="text-sm font-bold text-neutral-600">Full-Time Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-success">{jobs.filter((j: Job) => j.type === JobType.REMOTE).length || 0}</p>
              <p className="text-sm font-bold text-neutral-600">Remote Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-warning">{new Set(jobs.map((j: Job) => j.department)).size}</p>
              <p className="text-sm font-bold text-neutral-600">Departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Listing */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-2">
            {hasActiveFilters ? 'Filtered ' : ''}Results
          </h3>
          <p className="text-neutral-600 text-lg">
            Showing {jobs.length} of {total} positions
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-neutral-200 rounded-full"></div>
              <div className="w-24 h-24 border-8 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center py-20">
              <CardContent>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No jobs found</h3>
                <p className="text-neutral-600 text-lg mb-6">
                  Try adjusting your search criteria or filters
                </p>
                {hasActiveFilters && (
                  <Button variant="primary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {jobs.map((job: Job, idx: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
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

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 mt-20 border-t-4 border-neutral-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">🎯 ATS</h3>
              <p className="text-neutral-400">
                Find your dream job and build your career with us.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/track" className="hover:text-white transition-colors">Track Application</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Recruiter Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <p className="text-neutral-400">
                Email: careers@ats.com<br />
                Phone: (555) 123-4567
              </p>
            </div>
          </div>
          <div className="text-center pt-8 border-t-2 border-neutral-800">
            <p className="text-neutral-400">
              © 2024 ATS. All rights reserved. Built with ❤️ and Couchbase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
