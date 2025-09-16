import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, Banknote, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { hrService, financeService } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export default function HRDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
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
        
        // Create employee map for name lookup (similar to LeaveRequests fix)
        const employeeMap = new Map();
        emps.forEach((employee: any) => {
          const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
          employeeMap.set(employee.id, name); // Use MongoDB ObjectId as key
          employeeMap.set(employee.employeeId, name); // Also keep employeeId as fallback
        });
        
        // Transform attendance with proper employee names
        const transformedAttendance = att.map((record: any) => ({
          ...record,
          employeeName: employeeMap.get(record.employeeId) || 'Unknown'
        }));
        
        // Transform leave requests with proper employee names
        const transformedLeaveRequests = leaves.map((request: any) => ({
          ...request,
          employeeName: employeeMap.get(request.employeeId) || 'Unknown'
        }));
        
        setEmployees(emps);
        setAttendance(transformedAttendance.filter((a: any) => a.date === today));
        setLeaveRequests(transformedLeaveRequests);
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
  const pendingLeaves = leaveRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;
  const presentToday = attendance.filter(a => (a.status || '').toUpperCase() === 'PRESENT').length;
  const absentToday = attendance.filter(a => (a.status || '').toUpperCase() === 'ABSENT').length;
  const lateToday = attendance.filter(a => (a.status || '').toUpperCase() === 'LATE').length;
  const pendingPayrolls = payroll.filter(p => (p.status || '').toUpperCase() !== 'PAID').length;
  
  // Calculate attendance rate
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
  
  // Calculate department breakdown
  const departmentBreakdown = useMemo(() => {
    const depts = new Map();
    employees.forEach(emp => {
      // Try multiple possible field names for department
      let dept = emp.department || emp.dept || emp.departmentName || emp.position || emp.role;
      
      // If no department found, assign based on role or create meaningful defaults
      if (!dept) {
        // You can customize these department assignments based on your employee roles
        const roles = emp.roles || [];
        if (roles.includes('hr')) {
          dept = 'Human Resources';
        } else if (roles.includes('finance')) {
          dept = 'Finance';
        } else if (roles.includes('admin')) {
          dept = 'Administration';
        } else {
          // Create sample departments for demonstration
          const sampleDepts = ['Human Resources', 'Finance', 'IT', 'Operations', 'Marketing'];
          dept = sampleDepts[Math.floor(Math.random() * sampleDepts.length)];
        }
      }
      
      depts.set(dept, (depts.get(dept) || 0) + 1);
    });
    return Array.from(depts.entries()).map(([name, count]) => ({ name, count }));
  }, [employees]);
  
  // Calculate leave type distribution
  const leaveTypeDistribution = useMemo(() => {
    const types = new Map();
    leaveRequests.forEach(req => {
      // Try multiple possible field names for leave type
      const type = req.type || req.leaveType || req.category || req.reason || 'Personal';
      // Clean up the type name - capitalize first letter and handle special cases
      let cleanType = type.toString().toLowerCase();
      cleanType = cleanType.charAt(0).toUpperCase() + cleanType.slice(1);
      
      // Handle specific leave type formatting
      switch (cleanType.toLowerCase()) {
        case 'annual':
          cleanType = 'Annual Leave';
          break;
        case 'sick':
          cleanType = 'Sick Leave';
          break;
        case 'personal':
          cleanType = 'Personal Leave';
          break;
        case 'emergency':
          cleanType = 'Emergency Leave';
          break;
        case 'compensatory':
          cleanType = 'Compensatory Leave';
          break;
        case 'maternity':
          cleanType = 'Maternity Leave';
          break;
        case 'paternity':
          cleanType = 'Paternity Leave';
          break;
        default:
          // Capitalize each word for other types
          cleanType = cleanType.replace(/\b\w/g, (l: string) => l.toUpperCase());
      }
      
      types.set(cleanType, (types.get(cleanType) || 0) + 1);
    });
    return Array.from(types.entries()).map(([name, count]) => ({ name, count }));
  }, [leaveRequests]);  const recentActivities = useMemo(() => {
    const acts: { id: number; action: string; employee: string; time: string; type: string }[] = [];
    
    // Add recent employee onboarding
    employees.slice(-3).forEach((e, i) => {
      const name = `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Unknown Employee';
      acts.push({ 
        id: i + 1, 
        action: 'Employee onboarded', 
        employee: name, 
        time: 'Recently',
        type: 'employee'
      });
    });
    
    // Add recent leave requests with proper names
    leaveRequests.slice(-3).forEach((l, i) => {
      acts.push({ 
        id: 100 + i, 
        action: `Leave request ${(l.status || 'pending').toLowerCase()}`, 
        employee: l.employeeName || 'Unknown Employee', 
        time: 'Recent',
        type: 'leave'
      });
    });
    
    // Add recent attendance updates
    attendance.slice(-2).forEach((a, i) => {
      acts.push({
        id: 200 + i,
        action: `Marked ${(a.status || 'present').toLowerCase()}`,
        employee: a.employeeName || 'Unknown Employee',
        time: 'Today',
        type: 'attendance'
      });
    });
    
    return acts.slice(0, 5);
  }, [employees, leaveRequests, attendance]);

  if (loading) return <div className='flex items-center justify-center min-h-[300px] gap-2'><RefreshCw className='h-5 w-5 animate-spin'/><span>Loading HR dashboard...</span></div>;

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
          trend={{ value: totalEmployees, label: 'total staff' }}
          color="blue"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={Clock}
          description={`${presentToday} present, ${absentToday} absent`}
          trend={{ value: attendanceRate, label: 'attendance today' }}
          color="green"
        />
        <StatCard
          title="Leave Requests"
          value={pendingLeaves}
          icon={Calendar}
          description={`${activeLeaves} approved, ${pendingLeaves} pending`}
          trend={{ value: activeLeaves, label: 'on leave' }}
          color="orange"
        />
        <StatCard
          title="Pending Payrolls"
          value={pendingPayrolls}
          icon={Banknote}
          description="Awaiting processing"
          color="purple"
        />
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="erp-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departmentBreakdown.length === 0 && <p className='text-sm text-muted-foreground'>No department data</p>}
                {departmentBreakdown.slice(0, 5).map((dept, index) => (
                  <div key={dept.name} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{dept.name}</p>
                        <p className="text-xs text-muted-foreground">{dept.count} employees</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{Math.round(totalEmployees > 0 ? (dept.count / totalEmployees) * 100 : 0)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leave Types */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="erp-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Leave Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaveTypeDistribution.length === 0 && <p className='text-sm text-muted-foreground'>No leave data</p>}
                {leaveTypeDistribution.slice(0, 5).map((leave, index) => (
                  <div key={leave.name} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-yellow-500' :
                        index === 2 ? 'bg-indigo-500' :
                        index === 3 ? 'bg-pink-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium capitalize">{leave.name.toLowerCase()}</p>
                        <p className="text-xs text-muted-foreground">{leave.count} requests</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{Math.round(leaveRequests.length > 0 ? (leave.count / leaveRequests.length) * 100 : 0)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="erp-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.length === 0 && <p className='text-sm text-muted-foreground'>No recent activity</p>}
                {recentActivities.map(act => (
                  <div key={act.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        act.type === 'employee' ? 'bg-blue-500' :
                        act.type === 'leave' ? 'bg-orange-500' :
                        act.type === 'attendance' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{act.action}</p>
                        <p className="text-xs text-muted-foreground">{act.employee}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{act.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => navigate('/employees')}
                className="p-4 bg-secondary rounded-lg text-center hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">Manage Employees</p>
              </div>
              <div 
                onClick={() => navigate('/leaves')}
                className="p-4 bg-secondary rounded-lg text-center hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">Leave Requests</p>
              </div>
              <div 
                onClick={() => navigate('/attendance')}
                className="p-4 bg-secondary rounded-lg text-center hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">Attendance</p>
              </div>
              <div 
                onClick={() => navigate('/payroll')}
                className="p-4 bg-secondary rounded-lg text-center hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <Banknote className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">Payroll</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}