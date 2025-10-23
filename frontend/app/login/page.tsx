'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Đăng nhập thành công!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent-blue flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              <span className="inline-block transform -rotate-1 bg-accent-yellow px-4 py-2 border-4 border-black">
                Đăng nhập
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="admin@ats.com"
              />
              <Input
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="••••••••"
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                isLoading={isLoading}
              >
                Đăng nhập
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-neutral-600">
                Chưa có tài khoản?{' '}
                <Link
                  href="/register"
                  className="font-bold text-secondary hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            <div className="mt-6 p-4 bg-neutral-100 border-2 border-black">
              <p className="text-sm font-bold mb-2">Tài khoản demo:</p>
              <div className="text-sm space-y-1 font-mono">
                <p>Admin: admin@ats.com / Admin123!</p>
                <p>Recruiter: recruiter@ats.com / Recruiter123!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

