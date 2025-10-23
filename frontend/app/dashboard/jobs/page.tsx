'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/Input';
import { toast } from 'sonner';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Job, JobStatus, JobType, ExperienceLevel } from '@ats/shared';
import { motion } from 'framer-motion';

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await jobsApi.getAll();
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Job>) => jobsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully!');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Failed to create job'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
      jobsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully!');
      setIsModalOpen(false);
      setEditingJob(null);
    },
    onError: () => toast.error('Failed to update job'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully!');
    },
    onError: () => toast.error('Failed to delete job'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      title: formData.get('title'),
      department: formData.get('department'),
      location: formData.get('location'),
      type: formData.get('type'),
      experienceLevel: formData.get('experienceLevel'),
      description: formData.get('description'),
      status: formData.get('status'),
      openings: Number(formData.get('openings')),
      requirements: [formData.get('requirements')].filter(Boolean),
      responsibilities: [formData.get('responsibilities')].filter(Boolean),
      skills: (formData.get('skills') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
    };

    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const jobs = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Jobs</h1>
          <p className="text-neutral-600">Manage your job postings</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Job
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: Job, idx: number) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover className="cursor-pointer" onClick={() => setViewingJob(job)}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <Badge
                      variant={
                        job.status === JobStatus.OPEN
                          ? 'success'
                          : job.status === JobStatus.CLOSED
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {job.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-neutral-600">
                    <p>📍 {job.location}</p>
                    <p>🏢 {job.department}</p>
                    <p>👥 {job.openings} openings</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="default">{job.type}</Badge>
                    <Badge variant="info">{job.experienceLevel}</Badge>
                  </div>
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                    {job.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingJob(job);
                        setIsModalOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure?')) {
                          deleteMutation.mutate(job.id);
                        }
                      }}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        title={editingJob ? 'Edit Job' : 'Create Job'}
        size="2xl"
      >
        <form key={editingJob?.id || 'new'} onSubmit={handleSubmit}>
          <ModalContent>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="title"
                label="Job Title"
                defaultValue={editingJob?.title}
                required
              />
              <Input
                name="department"
                label="Department"
                defaultValue={editingJob?.department}
                required
              />
              <Input
                name="location"
                label="Location"
                defaultValue={editingJob?.location}
                required
              />
              <Input
                name="openings"
                label="Openings"
                type="number"
                defaultValue={editingJob?.openings}
                required
              />
              <div>
                <label className="block text-sm font-bold mb-2">Job Type</label>
                <select
                  name="type"
                  defaultValue={editingJob?.type || JobType.FULL_TIME}
                  className="w-full px-4 py-3 border-4 border-neutral-900 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                  required
                >
                  {Object.values(JobType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Experience Level</label>
                <select
                  name="experienceLevel"
                  defaultValue={editingJob?.experienceLevel || ExperienceLevel.MID}
                  className="w-full px-4 py-3 border-4 border-neutral-900 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                  required
                >
                  {Object.values(ExperienceLevel).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Status</label>
                <select
                  name="status"
                  defaultValue={editingJob?.status || JobStatus.DRAFT}
                  className="w-full px-4 py-3 border-4 border-neutral-900 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                  required
                >
                  {Object.values(JobStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                name="skills"
                label="Skills (comma-separated)"
                defaultValue={editingJob?.skills?.join(', ')}
              />
            </div>
            <TextArea
              name="description"
              label="Description"
              rows={4}
              defaultValue={editingJob?.description}
              required
              className="mt-4"
            />
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingJob(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingJob ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Job Details Modal */}
      {viewingJob && (
        <Modal
          isOpen={!!viewingJob}
          onClose={() => setViewingJob(null)}
          title={viewingJob.title}
          size="2xl"
        >
          <ModalContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Department</p>
                  <p className="font-bold">{viewingJob.department}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Location</p>
                  <p className="font-bold">{viewingJob.location}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Job Type</p>
                  <Badge variant="default">{viewingJob.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Experience Level</p>
                  <Badge variant="info">{viewingJob.experienceLevel}</Badge>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Status</p>
                  <Badge
                    variant={
                      viewingJob.status === JobStatus.OPEN
                        ? 'success'
                        : viewingJob.status === JobStatus.CLOSED
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {viewingJob.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Openings</p>
                  <p className="font-bold">{viewingJob.openings}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-600 mb-2">Description</p>
                <p className="text-neutral-800">{viewingJob.description}</p>
              </div>

              {viewingJob.skills && viewingJob.skills.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-600 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingJob.skills.map((skill) => (
                      <Badge key={skill} variant="info">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewingJob(null);
                setEditingJob(viewingJob);
                setIsModalOpen(true);
              }}
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit Job
            </Button>
            <Button variant="primary" onClick={() => setViewingJob(null)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

