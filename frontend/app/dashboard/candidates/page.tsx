'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CandidatesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await candidatesApi.getAll();
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => candidatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate added successfully!');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Failed to add candidate'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      source: formData.get('source'),
      currentTitle: formData.get('currentTitle'),
      currentCompany: formData.get('currentCompany'),
      experienceYears: Number(formData.get('experienceYears')),
      skills: (formData.get('skills') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
      summary: formData.get('summary'),
    };
    createMutation.mutate(data);
  };

  const candidates = data?.candidates || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Candidates</h1>
          <p className="text-neutral-600">Manage your talent pool</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Candidate
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate: any, idx: number) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover>
                <CardContent>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl">
                        {candidate.firstName} {candidate.lastName}
                      </h3>
                      <p className="text-sm text-neutral-600">{candidate.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    {candidate.currentTitle && (
                      <p>💼 {candidate.currentTitle}</p>
                    )}
                    {candidate.currentCompany && (
                      <p>🏢 {candidate.currentCompany}</p>
                    )}
                    {candidate.location && (
                      <p>📍 {candidate.location}</p>
                    )}
                    {candidate.experienceYears && (
                      <p>⏱️ {candidate.experienceYears} years experience</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {candidate.skills?.slice(0, 3).map((skill: string) => (
                      <Badge key={skill} variant="info" size="sm">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills?.length > 3 && (
                      <Badge variant="default" size="sm">
                        +{candidate.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Badge variant="default">{candidate.source}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Candidate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Candidate"
        size="2xl"
      >
        <form onSubmit={handleSubmit}>
          <ModalContent>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="First Name"
                required
              />
              <Input
                name="lastName"
                label="Last Name"
                required
              />
              <Input
                name="email"
                label="Email"
                type="email"
                required
              />
              <Input
                name="phone"
                label="Phone"
                type="tel"
              />
              <Input
                name="location"
                label="Location"
              />
              <div>
                <label className="block text-sm font-bold mb-2">Source *</label>
                <select
                  name="source"
                  defaultValue="website"
                  className="w-full px-4 py-3 border-4 border-neutral-900 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 bg-white"
                  required
                >
                  <option value="website">Website</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="agency">Agency</option>
                  <option value="direct">Direct</option>
                </select>
              </div>
              <Input
                name="currentTitle"
                label="Current Title"
              />
              <Input
                name="currentCompany"
                label="Current Company"
              />
              <Input
                name="experienceYears"
                label="Years of Experience"
                type="number"
                defaultValue="0"
              />
              <Input
                name="skills"
                label="Skills (comma-separated)"
                placeholder="React, TypeScript, Node.js"
              />
            </div>
            <TextArea
              name="summary"
              label="Summary"
              rows={3}
              placeholder="Brief professional summary..."
              className="mt-4"
            />
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
              Add Candidate
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

