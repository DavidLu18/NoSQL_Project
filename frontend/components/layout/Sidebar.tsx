'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  HomeIcon,
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@ats/shared';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: [UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER] },
  { name: 'Jobs', href: '/dashboard/jobs', icon: BriefcaseIcon, roles: [UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER] },
  { name: 'Candidates', href: '/dashboard/candidates', icon: UserGroupIcon, roles: [UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER] },
  { name: 'Applications', href: '/dashboard/applications', icon: DocumentTextIcon, roles: [UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.INTERVIEWER] },
  { name: 'Interviews', href: '/dashboard/interviews', icon: CalendarIcon, roles: [UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.INTERVIEWER] },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardDocumentListIcon, roles: [UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER] },
  { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon, roles: [UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER] },
  { name: 'Users', href: '/dashboard/users', icon: Cog6ToothIcon, roles: [UserRole.ADMIN] },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const filteredNavigation = navigation.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <aside className="w-64 bg-white border-r-4 border-black min-h-screen">
      <div className="p-6 border-b-4 border-black">
        <h1 className="text-3xl font-display font-bold transform -rotate-1">
          <span className="inline-block bg-accent-yellow px-3 py-1 border-4 border-black">
            ATS
          </span>
        </h1>
      </div>

      <nav className="p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-4 py-3 font-bold border-3 border-black transition-all',
                isActive
                  ? 'bg-secondary text-white shadow-brutal-sm translate-x-1 translate-y-1'
                  : 'bg-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm'
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

