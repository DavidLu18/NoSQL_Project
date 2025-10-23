'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.getAll();
      return response.data.data;
    },
  });

  const users = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Users</h1>
          <p className="text-neutral-600">Manage team members</p>
        </div>
        <Button variant="primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: any, idx: number) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-neutral-200 border-2 border-black">
                      <UserCircleIcon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-3">{user.email}</p>
                      <div className="flex gap-2">
                        <Badge variant="primary" size="sm">
                          {user.role}
                        </Badge>
                        <Badge
                          variant={user.isActive ? 'success' : 'danger'}
                          size="sm"
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

