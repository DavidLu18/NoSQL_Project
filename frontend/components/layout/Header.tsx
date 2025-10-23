'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRealtimeStore } from '@/store/realtimeStore';
import { Button } from '@/components/ui/Button';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';

export function Header() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const notifications = useRealtimeStore((state) => state.notifications);
  const markAsRead = useRealtimeStore((state) => state.markAsRead);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b-4 border-black h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold">
          Welcome, {user?.firstName} {user?.lastName}!
        </h2>
        <Badge variant="primary" size="sm">
          {user?.role}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Menu as="div" className="relative">
          <Menu.Button className="relative p-2 border-2 border-black hover:bg-neutral-100 transition-colors">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-black">
                {unreadCount}
              </span>
            )}
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-80 bg-white border-4 border-black shadow-brutal z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b-2 border-black">
                <h3 className="font-bold text-lg">Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-neutral-500">
                  No notifications
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <Menu.Item key={notification.id}>
                      {({ active }) => (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className={clsx(
                            'w-full text-left p-4 border-b-2 border-black transition-colors',
                            active ? 'bg-neutral-100' : '',
                            !notification.read && 'bg-accent-yellow bg-opacity-20'
                          )}
                        >
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              )}
            </Menu.Items>
          </Transition>
        </Menu>

        {/* User Menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-neutral-100 transition-colors">
            <UserCircleIcon className="h-6 w-6" />
            <span className="font-medium">{user?.email}</span>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border-4 border-black shadow-brutal z-50">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={clsx(
                      'w-full text-left px-4 py-3 font-medium transition-colors',
                      active && 'bg-neutral-100'
                    )}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}

