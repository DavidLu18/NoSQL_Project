'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-accent-yellow flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-7xl md:text-9xl font-display font-bold mb-6 tracking-tight">
            <span className="inline-block transform -rotate-2 bg-white px-6 py-3 border-4 border-black shadow-brutal-xl">
              DreamJobs
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-2xl md:text-3xl font-bold mb-8 max-w-2xl mx-auto"
          >
            Nền tảng tìm việc làm phù hợp cho bạn
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl mb-12 max-w-xl mx-auto text-neutral-800"
          >
            The best job platform to find your dream job.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="primary"
                onClick={() => router.push('/login')}
              >
                Đăng nhập
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/register')}
              >
                Đăng ký
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-700 mb-2">Bạn là ứng viên?</p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push('/jobs')}
              >
                🔍 Tìm việc làm
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: '🎯', title: 'Quản lý Pipeline', desc: 'Drag & drop workflow' },
            { icon: '📊', title: 'Báo cáo & Analytics', desc: 'Insights chi tiết' },
            { icon: '⚡', title: 'Real-time Updates', desc: 'Socket.IO' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white border-4 border-black shadow-brutal p-6 transform hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm transition-all"
            >
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-neutral-600">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

