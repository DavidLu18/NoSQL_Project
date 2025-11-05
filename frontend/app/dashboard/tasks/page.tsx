'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, authApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { TaskPriority } from '@ats/shared';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await authApi.getMe();
      return response.data.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tasks-my'],
    queryFn: async () => {
      const response = await tasksApi.getMy();
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-my'] });
      toast.success('Task created successfully!');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Failed to create task'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const relatedType = formData.get('relatedType') as string;
    const relatedId = formData.get('relatedId') as string;
    
    const data: any = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      dueDate: formData.get('dueDate') || undefined,
    };

    if (currentUser?.id) {
      data.assigneeId = currentUser.id;
    }
    
    if (relatedType && relatedId) {
      data.relatedTo = {
        type: relatedType,
        id: relatedId,
      };
    }
    
    createMutation.mutate(data);
  };


  const tasks = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">My Tasks</h1>
          <p className="text-neutral-600">Track your to-dos</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task: any, idx: number) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover>
                <CardContent className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-neutral-600 mb-3">
                        {task.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'danger'
                            : task.priority === 'high'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        variant={
                          task.status === 'done'
                            ? 'success'
                            : task.status === 'in_progress'
                            ? 'info'
                            : 'default'
                        }
                        size="sm"
                      >
                        {task.status}
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="default" size="sm">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <ModalContent>
            <div className="space-y-4">
              <Input
                name="title"
                label="Task Title"
                required
              />
              <TextArea
                name="description"
                label="Description"
                rows={3}
                placeholder="Task details..."
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Priority *</label>
                  <select
                    name="priority"
                    defaultValue={TaskPriority.MEDIUM}
                    className="w-full px-4 py-3 border-4 border-neutral-900 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                    required
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                    <option value={TaskPriority.URGENT}>Urgent</option>
                  </select>
                </div>
                <Input
                  name="dueDate"
                  label="Due Date"
                  type="date"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Related To</label>
                  <select
                    name="relatedType"
                    defaultValue=""
                    className="w-full px-4 py-3 border-4 border-neutral-900 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                  >
                    <option value="">None</option>
                    <option value="job">Job</option>
                    <option value="candidate">Candidate</option>
                    <option value="application">Application</option>
                  </select>
                </div>
                <Input
                  name="relatedId"
                  label="Related ID"
                  placeholder="Optional"
                />
              </div>
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
              Create Task
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

