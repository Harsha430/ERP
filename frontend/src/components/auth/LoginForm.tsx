import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Building2, Lock, Mail } from 'lucide-react';

interface LoginFormProps {
  role: UserRole;
  title: string;
  description: string;
}

export function LoginForm({ role, title, description }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper function to get role-based dashboard path
  const getRoleBasedDashboard = (roles: UserRole[]): string => {
    if (roles.includes('admin')) return '/admin';
    else if (roles.includes('hr')) return '/dashboard';
    else if (roles.includes('finance')) return '/finance-dashboard';
    return '/dashboard';
  };

  // Redirect already authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = getRoleBasedDashboard(user.roles);
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, shouldRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password, role);
      if (success) {
        setShouldRedirect(true);
      } else {
        setError('Invalid credentials. Use demo123 as password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'hr': return 'from-blue-500 to-purple-600';
      case 'finance': return 'from-green-500 to-teal-600';
      case 'admin': return 'from-purple-500 to-pink-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const getDemoCredentials = (role: UserRole) => {
    switch (role) {
      case 'hr': return 'hr@company.com';
      case 'finance': return 'finance@company.com';
      case 'admin': return 'admin@company.com';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="erp-card shadow-erp-lg">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${getRoleColor(role)} flex items-center justify-center`}
            >
              <Building2 className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              <p className="text-muted-foreground mt-2">{description}</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-destructive">
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className={`w-full bg-gradient-to-r ${getRoleColor(role)} hover:opacity-90 transition-opacity`}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {getDemoCredentials(role)}</p>
                <p><strong>Password:</strong> demo123</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Want automatic role detection?{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Use Unified Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}