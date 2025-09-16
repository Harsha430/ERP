import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'hr': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'finance': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const roles = user?.roles || [];
  const initials = user ? user.username.substring(0, 2).toUpperCase() : 'U';

  return (
    <motion.header
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="bg-card border-b border-border px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Enterprise Resource Planning System</h1>
        {roles.length > 0 && (
          <div className="flex items-center gap-1">
            {roles.map(r => (
              <span key={r} className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(r)}`}>
                {r.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-secondary">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-primary text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium">{user.username}</div>
                  <div className="text-xs text-muted-foreground">{roles.join(', ')}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.header>
  );
}