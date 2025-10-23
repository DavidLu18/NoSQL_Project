'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#52B788'];

export default function DashboardPage() {
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await reportsApi.getDashboard();
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner" />
      </div>
    );
  }

  const metrics = metricsData || {
    openJobs: 0,
    totalApplications: 0,
    activeInterviews: 0,
    hiredThisMonth: 0,
    avgTimeToHire: 0,
    applicationsByStatus: {},
    topSources: [],
    pipelineFunnel: [],
    interviewsThisWeek: 0,
  };

  const statsCards = [
    {
      title: 'Open Jobs',
      value: metrics.openJobs,
      icon: BriefcaseIcon,
      color: 'bg-secondary',
    },
    {
      title: 'Total Applications',
      value: metrics.totalApplications,
      icon: DocumentTextIcon,
      color: 'bg-accent-blue',
    },
    {
      title: 'Active Interviews',
      value: metrics.activeInterviews,
      icon: CalendarIcon,
      color: 'bg-accent-purple',
    },
    {
      title: 'Hired This Month',
      value: metrics.hiredThisMonth,
      icon: UserPlusIcon,
      color: 'bg-accent-green',
    },
  ];

  const pipelineData = metrics.pipelineFunnel.map((item: any) => ({
    name: item.stage,
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-display font-bold mb-2">Dashboard</h1>
        <p className="text-neutral-600">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card hover>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 border-4 border-black`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                <XAxis dataKey="name" stroke="#000" style={{ fontWeight: 'bold' }} />
                <YAxis stroke="#000" style={{ fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    border: '4px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  }}
                />
                <Bar dataKey="value" fill="#FF6B6B" stroke="#000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Top Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.topSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.source}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  stroke="#000"
                  strokeWidth={2}
                >
                  {metrics.topSources.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: '4px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Avg. Time to Hire</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-secondary">
              {metrics.avgTimeToHire}
              <span className="text-2xl ml-2 text-neutral-600">days</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interviews This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-accent-blue">
              {metrics.interviewsThisWeek}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.applicationsByStatus || {}).slice(0, 5).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant="default">{status}</Badge>
                  <span className="font-bold">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

