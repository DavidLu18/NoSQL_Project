'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { data, isLoading } = useQuery({
    queryKey: ['public-job', params.id],
    queryFn: async () => {
      const response = await publicApi.getJobById(params.id);
      return response.data.data;
    },
  });

  const job = data;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload PDF or DOC/DOCX file only');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let uploadedResumeUrl = resumeUrl;

      // Upload resume if file is selected
      if (resumeFile) {
        setUploadProgress(30);
        const uploadResponse = await publicApi.uploadResume(resumeFile);
        uploadedResumeUrl = uploadResponse.data.data.url;
        setResumeUrl(uploadedResumeUrl);
        setUploadProgress(60);
      }

      const formData = new FormData(e.currentTarget);
      const applicationData = {
        jobId: params.id,
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        location: formData.get('location'),
        currentTitle: formData.get('currentTitle'),
        currentCompany: formData.get('currentCompany'),
        experienceYears: Number(formData.get('experienceYears')),
        linkedinUrl: formData.get('linkedinUrl'),
        portfolioUrl: formData.get('portfolioUrl'),
        coverLetter: formData.get('coverLetter'),
        skills: (formData.get('skills') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
        resumeUrl: uploadedResumeUrl || '',
      };

      setUploadProgress(80);
      const response = await publicApi.submitApplication(applicationData);
      const { trackingToken: token, message } = response.data.data;

      setUploadProgress(100);
      setTrackingToken(token);
      toast.success(message);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-xl text-neutral-600">Job not found</p>
            <Link href="/jobs">
              <Button variant="primary" className="mt-4">
                ← Back to Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
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
            <Link href="/track">
              <Button variant="outline">Track Application</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Job Details */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <CardTitle className="text-4xl mb-4">{job.title}</CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-600">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5" />
                      {job.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Posted {format(new Date(job.createdAt), 'MMMM d, yyyy')}
                    </div>
                    {(job.salaryMin || job.salaryMax) && (
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="h-5 w-5" />
                        {job.salaryMin && job.salaryMax 
                          ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency || 'USD'}`
                          : job.salaryMin 
                            ? `From ${job.salaryMin.toLocaleString()} ${job.currency || 'USD'}`
                            : `Up to ${job.salaryMax?.toLocaleString()} ${job.currency || 'USD'}`
                        }
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsModalOpen(true)}
                  className="ml-4"
                >
                  Apply Now
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" size="lg">{job.type}</Badge>
                <Badge variant="info" size="lg">{job.experienceLevel}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">About the Role</h3>
                  <p className="text-neutral-700 leading-relaxed">{job.description}</p>
                </div>

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Responsibilities</h3>
                    <ul className="space-y-3">
                      {job.responsibilities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircleIcon className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-neutral-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Requirements</h3>
                    <ul className="space-y-3">
                      {job.requirements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircleIcon className="h-6 w-6 text-secondary mt-0.5 flex-shrink-0" />
                          <span className="text-neutral-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="info" size="lg">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Apply?</h3>
              <p className="text-neutral-600 mb-6">Join our team and make an impact!</p>
              <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
                Submit Your Application
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Application Form Modal */}
      <Modal
        isOpen={isModalOpen && !trackingToken}
        onClose={() => setIsModalOpen(false)}
        title={`Apply for ${job.title}`}
        size="3xl"
      >
        <form onSubmit={handleSubmit}>
          <ModalContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="firstName" label="First Name" required />
                  <Input name="lastName" label="Last Name" required />
                  <Input name="email" label="Email" type="email" required />
                  <Input name="phone" label="Phone" type="tel" />
                  <Input name="location" label="Location" className="col-span-2" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Professional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="currentTitle" label="Current Title" />
                  <Input name="currentCompany" label="Current Company" />
                  <Input
                    name="experienceYears"
                    label="Years of Experience"
                    type="number"
                    defaultValue="0"
                  />
                  <Input name="skills" label="Skills (comma-separated)" className="col-span-2" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Links</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="linkedinUrl" label="LinkedIn Profile" type="url" />
                  <Input name="portfolioUrl" label="Portfolio/Website" type="url" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Resume Upload</h4>
                <div className="border-4 border-dashed border-neutral-900 rounded-lg p-6 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    {resumeFile ? (
                      <div className="space-y-2">
                        <CheckCircleIcon className="h-12 w-12 text-success mx-auto" />
                        <p className="font-bold text-lg">{resumeFile.name}</p>
                        <p className="text-sm text-neutral-600">
                          {(resumeFile.size / 1024).toFixed(2)} KB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setResumeFile(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="font-bold text-lg">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-neutral-600">
                          PDF, DOC, DOCX (max. 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">Uploading...</span>
                      <span className="text-sm font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="h-3 bg-neutral-200 rounded-full overflow-hidden border-2 border-neutral-900">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Cover Letter</h4>
                <TextArea
                  name="coverLetter"
                  label="Tell us why you're a great fit"
                  rows={5}
                  placeholder="Share your motivation and relevant experience..."
                />
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Submit Application
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Success Modal */}
      {trackingToken && (
        <Modal
          isOpen={!!trackingToken}
          onClose={() => {
            setTrackingToken(null);
            setIsModalOpen(false);
          }}
          title="Application Submitted!"
          size="xl"
        >
          <ModalContent>
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="h-12 w-12 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Thank you for applying!</h3>
              <p className="text-neutral-600 mb-6">
                Your application has been successfully submitted. Save your tracking token below to check your application status.
              </p>
              <div className="p-4 bg-neutral-100 border-4 border-neutral-900 rounded-lg mb-6">
                <p className="text-sm text-neutral-600 mb-2">Your Tracking Token:</p>
                <p className="font-mono text-lg font-bold break-all">{trackingToken}</p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(trackingToken);
                    toast.success('Token copied to clipboard!');
                  }}
                >
                  Copy Token
                </Button>
                <Link href={`/track?token=${trackingToken}`}>
                  <Button variant="primary">Track Application</Button>
                </Link>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTrackingToken(null);
                setIsModalOpen(false);
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neutral-400">© 2024 ATS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

