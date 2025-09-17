import { useState, useEffect } from 'react';
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
  Layers,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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
  { id: 'invoices', title: 'Invoices', icon: FileText, path: '/invoices', roles: ['finance', 'admin'] },
  { id: 'budgeting', title: 'Budgeting', icon: BarChart3, path: '/budgeting', roles: ['finance', 'admin'] },
  { id: 'reports', title: 'Reports', icon: FileText, path: '/reports', roles: ['finance', 'admin'] },
  
  // Admin Only
  { id: 'users', title: 'Manage Users', icon: Settings, path: '/users', roles: ['admin'] },
  { id: 'add-user', title: 'Add User', icon: UserPlus, path: '/add-user', roles: ['admin'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Update CSS custom property when collapsed state changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      collapsed ? '64px' : '256px'
    );
  }, [collapsed]);

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
        'Finance': filteredMenuItems.filter(item => ['finance-dashboard','accounts','transactions','invoices','budgeting','reports'].includes(item.id)),
        'Admin': filteredMenuItems.filter(item => ['users','add-user'].includes(item.id))
      };
    } else if (userRole === 'hr') {
      return { 'HR Module': filteredMenuItems.filter(item => ['hr-dashboard','employees','departments','positions','attendance','leaves','payroll'].includes(item.id)) };
    } else if (userRole === 'finance') {
      return { 'Finance Module': filteredMenuItems.filter(item => ['finance-dashboard','accounts','transactions','invoices','budgeting','reports'].includes(item.id)) };
    }
    return {};
  };

  const moduleGroups = primaryRole ? getModuleItems(primaryRole) : {};

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={cn(
        "bg-card border-r border-border h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-50",
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
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="p-4 space-y-4 overflow-y-auto max-h-[50vh]">
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

        {/* User Profile Section */}
        <div className="border-t border-border p-3 mt-auto">
        <AnimatePresence>
          {!collapsed && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider"
            >
              Account
            </motion.h3>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          {/* Profile Link */}
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              "sidebar-item w-full text-left",
              collapsed && "justify-center px-2"
            )}
          >
            <User className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  Profile
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Settings Link */}
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              "sidebar-item w-full text-left",
              collapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className={cn(
              "sidebar-item w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* User Info Card */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-3 p-2 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-primary text-white text-xs">
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.roles?.[0]?.toUpperCase() || 'USER'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}