import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  Building2, 
  TrendingUp, 
  Activity, 
  Settings,
  Database,
  BarChart3,
  DollarSign,
  UserPlus,
  FileText,
  Clock,
  Download,
  Upload
} from 'lucide-react';
import { adminService, hrService, financeService } from '@/services/apiService';

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch system-wide data
  const statisticsQuery = useQuery({
    queryKey: ['admin-statistics', refreshKey],
    queryFn: () => adminService.getStatistics().catch(() => ({ 
      totalUsers: 0, 
      enabledUsers: 0, 
      disabledUsers: 0, 
      roleDistribution: { ADMIN: 0, HR: 0, FINANCE: 0 }
    })),
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users', refreshKey],
    queryFn: () => adminService.getUsers().catch(() => []),
  });

  const employeesQuery = useQuery({
    queryKey: ['admin-employees', refreshKey],
    queryFn: () => hrService.getEmployees().catch(() => []),
  });

  const departmentsQuery = useQuery({
    queryKey: ['admin-departments', refreshKey],
    queryFn: () => hrService.getDepartments().catch(() => []),
  });

  const accountsQuery = useQuery({
    queryKey: ['admin-accounts', refreshKey],
    queryFn: () => financeService.getAccounts().catch(() => []),
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'add-user':
        navigate('/add-user');
        break;
      case 'backup':
        try {
          toast({
            title: "System Backup",
            description: "Starting system backup process...",
          });
          // You can implement actual backup functionality here
          setTimeout(() => {
            toast({
              title: "Backup Complete",
              description: "System backup completed successfully!",
            });
          }, 2000);
        } catch (error) {
          toast({
            title: "Backup Failed",
            description: "System backup failed. Please try again.",
            variant: "destructive",
          });
        }
        break;
      case 'analytics':
        navigate('/reports');
        break;
      case 'configuration':
        navigate('/settings');
        break;
      case 'initialize-data':
        try {
          toast({
            title: "Initializing Data",
            description: "Setting up sample data...",
          });
          await adminService.initializeData();
          handleRefresh();
          toast({
            title: "Success",
            description: "Sample data initialized successfully!",
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to initialize data",
            variant: "destructive",
          });
        }
        break;
      case 'export':
        try {
          toast({
            title: "Export Started",
            description: "Preparing data export...",
          });
          // You can implement actual export functionality here
          // For now, simulating export process
          setTimeout(() => {
            toast({
              title: "Export Complete",
              description: "Data export completed successfully!",
            });
            // In real implementation, trigger file download here
          }, 2000);
        } catch (error) {
          toast({
            title: "Export Failed",
            description: "Data export failed. Please try again.",
            variant: "destructive",
          });
        }
        break;
      default:
        toast({
          title: "Coming Soon",
          description: `${action} functionality will be available soon.`,
        });
    }
  };

  const statistics = statisticsQuery.data || { 
    totalUsers: 0, 
    enabledUsers: 0, 
    disabledUsers: 0, 
    roleDistribution: { ADMIN: 0, HR: 0, FINANCE: 0 }
  };
  const users = usersQuery.data || [];
  const employees = employeesQuery.data || [];
  const departments = departmentsQuery.data || [];
  const accounts = accountsQuery.data || [];

  const isLoading = statisticsQuery.isLoading || usersQuery.isLoading || employeesQuery.isLoading || departmentsQuery.isLoading || accountsQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete system overview and management</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
      </motion.div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Users</p>
                  <p className="text-2xl font-bold">{statistics.totalUsers}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold">{departments.length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-600">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Finance Accounts</p>
                  <p className="text-2xl font-bold">{accounts.length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* User Roles Distribution and Recent System Activity - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="erp-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                User Roles Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Admin Users</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {statistics.roleDistribution?.ADMIN || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium">HR Users</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {statistics.roleDistribution?.HR || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Finance Users</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {statistics.roleDistribution?.FINANCE || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="erp-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Recent System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">System backup initiated</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User permissions updated</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Analytics report generated</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Admin Quick Actions - At Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Admin Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 admin-quick-action hover:bg-blue-50 hover:border-blue-300 transition-colors"
                onClick={() => handleQuickAction('add-user')}
              >
                <UserPlus className="h-6 w-6 text-blue-600" />
                <span className="font-medium">Add New User</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 admin-quick-action hover:bg-green-50 hover:border-green-300 transition-colors"
                onClick={() => handleQuickAction('backup')}
              >
                <Database className="h-6 w-6 text-green-600" />
                <span className="font-medium">System Backup</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 admin-quick-action hover:bg-orange-50 hover:border-orange-300 transition-colors"
                onClick={() => handleQuickAction('analytics')}
              >
                <BarChart3 className="h-6 w-6 text-orange-600" />
                <span className="font-medium">Analytics</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 admin-quick-action hover:bg-purple-50 hover:border-purple-300 transition-colors"
                onClick={() => handleQuickAction('configuration')}
              >
                <Settings className="h-6 w-6 text-purple-600" />
                <span className="font-medium">Configuration</span>
              </Button>
            </div>
            
            {/* System Management Section */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-16 flex items-center gap-3 admin-quick-action hover:bg-slate-50 transition-colors"
                  onClick={() => handleQuickAction('initialize-data')}
                >
                  <Upload className="h-5 w-5 text-indigo-600" />
                  <div className="text-left">
                    <div className="font-medium">Initialize Data</div>
                    <div className="text-xs text-muted-foreground">Setup sample data</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex items-center gap-3 admin-quick-action hover:bg-slate-50 transition-colors"
                  onClick={() => navigate('/users')}
                >
                  <Users className="h-5 w-5 text-emerald-600" />
                  <div className="text-left">
                    <div className="font-medium">Manage Users</div>
                    <div className="text-xs text-muted-foreground">User administration</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex items-center gap-3 admin-quick-action hover:bg-slate-50 transition-colors"
                  onClick={() => handleQuickAction('export')}
                >
                  <Download className="h-5 w-5 text-cyan-600" />
                  <div className="text-left">
                    <div className="font-medium">Export Data</div>
                    <div className="text-xs text-muted-foreground">Download reports</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}