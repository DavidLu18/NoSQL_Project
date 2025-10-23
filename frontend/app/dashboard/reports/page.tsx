'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ReportsPage() {
  const { data: sourcesData } = useQuery({
    queryKey: ['reports-sources'],
    queryFn: async () => {
      const response = await reportsApi.getSources();
      return response.data.data;
    },
  });

  const { data: timeToHireData } = useQuery({
    queryKey: ['reports-time-to-hire'],
    queryFn: async () => {
      const response = await reportsApi.getTimeToHire();
      return response.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Reports & Analytics</h1>
          <p className="text-neutral-600">Insights into your recruitment process</p>
        </div>
        <Button variant="primary">
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Source Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourcesData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                <XAxis dataKey="source" stroke="#000" style={{ fontWeight: 'bold' }} />
                <YAxis stroke="#000" style={{ fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    border: '4px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  }}
                />
                <Bar dataKey="totalApplications" fill="#4ECDC4" stroke="#000" strokeWidth={2} />
                <Bar dataKey="hired" fill="#52B788" stroke="#000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time to Hire Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Time to Hire by Job</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeToHireData?.jobs || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                <XAxis dataKey="jobTitle" stroke="#000" style={{ fontWeight: 'bold' }} />
                <YAxis stroke="#000" style={{ fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    border: '4px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgDays"
                  stroke="#FF6B6B"
                  strokeWidth={3}
                  dot={{ fill: '#FF6B6B', stroke: '#000', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

