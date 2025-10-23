'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi, applicationsApi, jobsApi, candidatesApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PlusIcon, CalendarIcon, ClockIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function InterviewsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const response = await interviewsApi.getAll();
      return response.data.data;
    },
  });

  const { data: applicationsData } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await applicationsApi.getAll();
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => interviewsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview scheduled successfully!');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Failed to schedule interview'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      applicationId: formData.get('applicationId'),
      type: formData.get('type'),
      scheduledDate: formData.get('scheduledDate'),
      duration: Number(formData.get('duration')),
      location: formData.get('location'),
      meetingLink: formData.get('meetingLink'),
      notes: formData.get('notes'),
    };
    createMutation.mutate(data);
  };

  const interviews = data?.interviews || [];
  const applications = applicationsData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Interviews</h1>
          <p className="text-neutral-600">Upcoming and past interviews</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {interviews.map((interview: any, idx: number) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover>
                <CardContent>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">
                        {interview.type} Interview
                      </h3>
                      <div className="space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(interview.scheduledDate), 'PPP')}
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          {format(new Date(interview.scheduledDate), 'p')} ({interview.duration} min)
                        </div>
                        {interview.meetingLink && (
                          <div className="flex items-center gap-2">
                            <VideoCameraIcon className="h-4 w-4" />
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-secondary hover:underline"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        interview.status === 'scheduled'
                          ? 'info'
                          : interview.status === 'completed'
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {interview.status}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t-2 border-neutral-200">
                    <p className="text-sm text-neutral-600">
                      <span className="font-bold">Candidate:</span> #{interview.candidateId.slice(-8)}
                    </p>
                    <p className="text-sm text-neutral-600">
                      <span className="font-bold">Job:</span> #{interview.jobId.slice(-8)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Interview"
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <ModalContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Application *</label>
                <select
                  name="applicationId"
                  className="w-full px-4 py-3 border-4 border-neutral-900 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                  required
                >
                  <option value="">Select an application...</option>
                  {applications.map((app: any) => (
                    <option key={app.id} value={app.id}>
                      {app.candidateId?.slice(-8) || 'N/A'} - {app.jobId?.slice(-8) || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Interview Type *</label>
                <select
                  name="type"
                  defaultValue="phone"
                  className="w-full px-4 py-3 border-4 border-neutral-900 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                  required
                >
                  <option value="phone">Phone</option>
                  <option value="video">Video</option>
                  <option value="onsite">On-site</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <Input
                name="scheduledDate"
                label="Date & Time"
                type="datetime-local"
                required
              />
              <Input
                name="duration"
                label="Duration (minutes)"
                type="number"
                defaultValue="60"
                required
              />
              <Input
                name="location"
                label="Location"
                placeholder="Office address or meeting room"
              />
              <Input
                name="meetingLink"
                label="Meeting Link"
                type="url"
                placeholder="https://zoom.us/..."
              />
              <Input
                name="notes"
                label="Notes"
                placeholder="Additional information"
              />
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Schedule
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

