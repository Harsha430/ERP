import { motion } from 'framer-motion';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, Banknote, TrendingUp, AlertCircle } from 'lucide-react';
import { employees, leaveRequests, attendance } from '@/data/mockData';

export default function HRDashboard() {
  const totalEmployees = employees.length;
  const activeLeaves = leaveRequests.filter(req => req.status === 'Approved').length;
  const pendingPayrolls = 5; // Mock data
  const presentToday = attendance.filter(att => att.status === 'Present').length;

  const recentActivities = [
    { id: 1, action: 'New employee onboarded', employee: 'John Doe', time: '2 hours ago' },
    { id: 2, action: 'Leave request approved', employee: 'Jane Smith', time: '4 hours ago' },
    { id: 3, action: 'Payroll processed', employee: 'Bob Johnson', time: '1 day ago' },
    { id: 4, action: 'Attendance updated', employee: 'Alice Brown', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground">Overview of your HR operations</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          description="Active workforce"
          trend={{ value: 12, label: 'from last month' }}
          color="blue"
        />
        <StatCard
          title="Active Leaves"
          value={activeLeaves}
          icon={Calendar}
          description="Employees on leave"
          color="orange"
        />
        <StatCard
          title="Present Today"
          value={`${presentToday}/${totalEmployees}`}
          icon={Clock}
          description="Attendance rate"
          trend={{ value: 8, label: 'from yesterday' }}
          color="green"
        />
        <StatCard
          title="Pending Payrolls"
          value={pendingPayrolls}
          icon={Banknote}
          description="Awaiting processing"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="erp-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.employee}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="erp-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-lg text-center hover:bg-secondary-hover transition-colors cursor-pointer">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Add Employee</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center hover:bg-secondary-hover transition-colors cursor-pointer">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Approve Leaves</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center hover:bg-secondary-hover transition-colors cursor-pointer">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Update Attendance</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg text-center hover:bg-secondary-hover transition-colors cursor-pointer">
                  <Banknote className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Process Payroll</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}