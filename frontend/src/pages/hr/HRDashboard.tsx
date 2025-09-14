import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, Banknote, TrendingUp, AlertCircle } from 'lucide-react';
import { hrService, financeService } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function HRDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const [emps, att, leaves, pr] = await Promise.all([
          hrService.getEmployees().catch(() => []),
          hrService.getAttendance().catch(() => []),
          hrService.getLeaveRequests().catch(() => []),
          financeService.getPayrollEntries().catch(() => []),
        ]);
        setEmployees(emps);
        setAttendance(att.filter((a: any) => a.date === today));
        setLeaveRequests(leaves);
        setPayroll(pr);
      } catch (e: any) {
        toast({ title: 'HR data load failed', description: e.message || 'Unexpected error', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalEmployees = employees.length;
  const activeLeaves = leaveRequests.filter(r => (r.status || '').toUpperCase() === 'APPROVED').length;
  const presentToday = attendance.filter(a => (a.status || '').toUpperCase() === 'PRESENT').length;
  const pendingPayrolls = payroll.filter(p => (p.status || '').toUpperCase() !== 'PAID').length;

  const recentActivities = useMemo(() => {
    const acts: { id: number; action: string; employee: string; time: string }[] = [];
    employees.slice(-3).forEach((e, i) => acts.push({ id: i + 1, action: 'Employee onboarded', employee: `${e.firstName || ''} ${e.lastName || ''}`.trim(), time: 'Just now' }));
    leaveRequests.slice(-2).forEach((l, i) => acts.push({ id: 100 + i, action: `Leave ${l.status?.toLowerCase()}`, employee: l.employeeId || 'Employee', time: 'Recent' }));
    return acts.slice(0, 4);
  }, [employees, leaveRequests]);

  if (loading) return <div className='flex items-center justify-center min-h-[400px] gap-2'><Loader2 className='h-6 w-6 animate-spin' /><span>Loading HR dashboard...</span></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
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
          trend={{ value: totalEmployees, label: 'current count' }}
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
          trend={totalEmployees ? { value: Math.round((presentToday / Math.max(totalEmployees, 1)) * 100), label: '% present' } : undefined}
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
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="erp-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length === 0 && <p className='text-sm text-muted-foreground'>No recent activity</p>}
                {recentActivities.map(act => (
                  <div key={act.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{act.action}</p>
                      <p className="text-sm text-muted-foreground">{act.employee}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{act.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
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