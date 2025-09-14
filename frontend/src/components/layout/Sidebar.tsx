import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  Banknote,
  CreditCard,
  Receipt,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  title: string;
  icon: any;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  // HR Module
  { id: 'hr-dashboard', title: 'HR Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['hr', 'admin'] },
  { id: 'employees', title: 'Employees', icon: Users, path: '/employees', roles: ['hr', 'admin'] },
  { id: 'departments', title: 'Departments', icon: Layers, path: '/departments', roles: ['hr','admin'] },
  { id: 'positions', title: 'Positions', icon: Layers, path: '/positions', roles: ['hr','admin'] },
  { id: 'attendance', title: 'Attendance', icon: Clock, path: '/attendance', roles: ['hr', 'admin'] },
  { id: 'leaves', title: 'Leave Requests', icon: Calendar, path: '/leaves', roles: ['hr', 'admin'] },
  { id: 'payroll', title: 'Payroll', icon: Banknote, path: '/payroll', roles: ['hr', 'admin'] },
  
  // Finance Module
  { id: 'finance-dashboard', title: 'Finance Dashboard', icon: LayoutDashboard, path: '/finance-dashboard', roles: ['finance', 'admin'] },
  { id: 'accounts', title: 'Accounts', icon: CreditCard, path: '/accounts', roles: ['finance', 'admin'] },
  { id: 'transactions', title: 'Transactions', icon: Receipt, path: '/transactions', roles: ['finance', 'admin'] },
  { id: 'budgeting', title: 'Budgeting', icon: BarChart3, path: '/budgeting', roles: ['finance', 'admin'] },
  { id: 'reports', title: 'Reports', icon: FileText, path: '/reports', roles: ['finance', 'admin'] },
  
  // Admin Only
  { id: 'users', title: 'Manage Users', icon: Settings, path: '/users', roles: ['admin'] },
  { id: 'add-user', title: 'Add User', icon: UserPlus, path: '/add-user', roles: ['admin'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const userRoles = user?.roles || [];
  const primaryRole = userRoles[0] as UserRole | undefined;

  const filteredMenuItems = menuItems.filter(item =>
    user && userRoles.some(r => item.roles.includes(r))
  );

  const getModuleTitle = (userRole: UserRole) => {
    switch (userRole) {
      case 'hr': return 'HR Module';
      case 'finance': return 'Finance Module';
      case 'admin': return 'Admin Panel';
      default: return 'ERP System';
    }
  };

  const getModuleItems = (userRole: UserRole) => {
    if (userRole === 'admin') {
      return {
        'HR': filteredMenuItems.filter(item => ['hr-dashboard','employees','departments','positions','attendance','leaves','payroll'].includes(item.id)),
        'Finance': filteredMenuItems.filter(item => ['finance-dashboard','accounts','transactions','budgeting','reports'].includes(item.id)),
        'Admin': filteredMenuItems.filter(item => ['users','add-user'].includes(item.id))
      };
    } else if (userRole === 'hr') {
      return { 'HR Module': filteredMenuItems.filter(item => ['hr-dashboard','employees','departments','positions','attendance','leaves','payroll'].includes(item.id)) };
    } else if (userRole === 'finance') {
      return { 'Finance Module': filteredMenuItems.filter(item => ['finance-dashboard','accounts','transactions','budgeting','reports'].includes(item.id)) };
    }
    return {};
  };

  const moduleGroups = primaryRole ? getModuleItems(primaryRole) : {};

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={cn(
        "bg-card border-r border-border min-h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ERP</span>
                </div>
                <div>
                  <h2 className="font-semibold text-sm">{primaryRole ? getModuleTitle(primaryRole) : 'ERP System'}</h2>
                  <p className="text-xs text-muted-foreground">{user?.username}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {Object.entries(moduleGroups).map(([groupName, items]) => (
          <div key={groupName}>
            <AnimatePresence>
              {!collapsed && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider"
                >
                  {groupName}
                </motion.h3>
              )}
            </AnimatePresence>
            
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "sidebar-item",
                        isActive && "active",
                        collapsed && "justify-center px-2"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="truncate"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </motion.aside>
  );
}