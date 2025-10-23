'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, jobsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Application, Job } from '@ats/shared';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowRightIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<string>('');

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await jobsApi.getAll();
      return response.data.data;
    },
  });

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['applications', selectedJob],
    queryFn: async () => {
      const response = await applicationsApi.getAll({
        jobId: selectedJob || undefined,
      });
      return response.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, stageId }: { id: string; status: string; stageId: string }) =>
      applicationsApi.updateStatus(id, status, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application moved successfully! 🎉');
    },
    onError: () => toast.error('Failed to move application'),
  });

  const jobs: Job[] = jobsData || [];
  const applications: Application[] = applicationsData || [];

  // Get pipeline stages from selected job
  const selectedJobData = jobs.find((j) => j.id === selectedJob);
  const stages = selectedJobData?.pipeline || [
    { id: 'new', name: 'New', order: 1, color: '#FF6B6B' },
    { id: 'screening', name: 'Screening', order: 2, color: '#4ECDC4' },
    { id: 'phone', name: 'Phone Interview', order: 3, color: '#45B7D1' },
    { id: 'technical', name: 'Technical', order: 4, color: '#FFA07A' },
    { id: 'onsite', name: 'Onsite', order: 5, color: '#98D8C8' },
    { id: 'offer', name: 'Offer', order: 6, color: '#F7DC6F' },
    { id: 'hired', name: 'Hired', order: 7, color: '#52B788' },
  ];

  const getApplicationsByStage = (stageId: string) => {
    return applications.filter((app) => app.currentStageId === stageId);
  };

  const moveApplication = (appId: string, currentStageId: string, direction: 'left' | 'right') => {
    const currentIndex = stages.findIndex((s) => s.id === currentStageId);
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= stages.length) return;

    const newStage = stages[newIndex];
    let newStatus = 'in_review';
    
    if (newStage.id === 'new') newStatus = 'new';
    else if (newStage.id === 'hired') newStatus = 'hired';
    else if (newStage.id === 'offer') newStatus = 'offer';

    updateStatusMutation.mutate({
      id: appId,
      status: newStatus,
      stageId: newStage.id,
    });
  };

  const moveToStage = (appId: string, stageId: string) => {
    let newStatus = 'in_review';
    
    if (stageId === 'new') newStatus = 'new';
    else if (stageId === 'hired') newStatus = 'hired';
    else if (stageId === 'offer') newStatus = 'offer';

    updateStatusMutation.mutate({
      id: appId,
      status: newStatus,
      stageId: stageId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Applications Pipeline</h1>
          <p className="text-neutral-600">Track candidates through your hiring process</p>
        </div>
        <div className="w-64">
          <label className="block text-sm font-bold mb-2">Filter by Job</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full px-4 py-3 border-4 border-neutral-900 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-neutral-600">Loading applications...</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage, stageIndex) => {
            const stageApplications = getApplicationsByStage(stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                {/* Stage Header */}
                <div
                  className="mb-4 p-4 border-4 border-black font-bold rounded-lg"
                  style={{ backgroundColor: stage.color }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{stage.name}</span>
                    <Badge variant="default">{stageApplications.length}</Badge>
                  </div>
                </div>

                {/* Applications List */}
                <div className="space-y-3 min-h-[400px] p-2 bg-neutral-50 rounded-lg">
                  <AnimatePresence>
                    {stageApplications.map((application, index) => (
                      <motion.div
                        key={application.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card hover padding="sm">
                          <CardContent>
                            <div className="mb-3">
                              <h3 className="font-bold mb-1">
                                Candidate #{application.candidateId.slice(-8)}
                              </h3>
                              <p className="text-sm text-neutral-600 mb-2">
                                Job #{application.jobId.slice(-8)}
                              </p>
                              <div className="flex items-center justify-between mb-3">
                                <Badge
                                  variant={
                                    application.status === 'hired'
                                      ? 'success'
                                      : application.status === 'rejected'
                                      ? 'danger'
                                      : 'info'
                                  }
                                  size="sm"
                                >
                                  {application.status}
                                </Badge>
                                <span className="text-xs text-neutral-500">
                                  {new Date(application.appliedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Move Buttons */}
                            <div className="flex gap-2">
                              {stageIndex > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveApplication(application.id, stage.id, 'left')}
                                  className="flex-1"
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <ArrowLeftIcon className="h-4 w-4" />
                                </Button>
                              )}
                              {stageIndex < stages.length - 1 && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => moveApplication(application.id, stage.id, 'right')}
                                  className="flex-1"
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <ArrowRightIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {/* Quick Move Dropdown */}
                            <div className="mt-2">
                              <select
                                onChange={(e) => {
                                  if (e.target.value && e.target.value !== stage.id) {
                                    moveToStage(application.id, e.target.value);
                                    e.target.value = stage.id; // Reset
                                  }
                                }}
                                defaultValue={stage.id}
                                className="w-full px-2 py-1 text-xs border-2 border-neutral-900 rounded font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                disabled={updateStatusMutation.isPending}
                              >
                                <option value={stage.id}>Move to...</option>
                                {stages.map((s) => (
                                  s.id !== stage.id && (
                                    <option key={s.id} value={s.id}>
                                      → {s.name}
                                    </option>
                                  )
                                ))}
                              </select>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {stageApplications.length === 0 && (
                    <div className="text-center py-12 text-neutral-400">
                      <p className="text-sm">No applications</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-info/10 border-4 border-info rounded-lg p-4">
        <p className="font-bold mb-2">💡 How to use:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Arrow Buttons:</strong> Click ← or → to move application to adjacent stage</li>
          <li><strong>Dropdown:</strong> Select "Move to..." to jump to any stage directly</li>
          <li><strong>Auto-save:</strong> Changes are saved instantly</li>
          <li><strong>Tracking:</strong> Job seekers can track status updates in real-time</li>
        </ul>
      </div>
    </div>
  );
}
