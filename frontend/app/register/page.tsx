'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UserRole } from '@ats/shared';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: UserRole.RECRUITER,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu không khớp');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      toast.success('Đăng ký thành công!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent-purple flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              <span className="inline-block transform rotate-1 bg-accent-green px-4 py-2 border-4 border-black text-white">
                Đăng ký
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Họ"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Tên"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <Select
                label="Vai trò"
                value={formData.role}
                onChange={(value) =>
                  setFormData({ ...formData, role: value as UserRole })
                }
                options={[
                  { value: UserRole.RECRUITER, label: 'Recruiter' },
                  { value: UserRole.HIRING_MANAGER, label: 'Hiring Manager' },
                  { value: UserRole.INTERVIEWER, label: 'Interviewer' },
                ]}
              />
              <Input
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <Input
                label="Xác nhận mật khẩu"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                isLoading={isLoading}
              >
                Đăng ký
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-neutral-600">
                Đã có tài khoản?{' '}
                <Link
                  href="/login"
                  className="font-bold text-secondary hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

