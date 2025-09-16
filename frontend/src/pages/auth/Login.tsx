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
import { getRoleBasedDashboard } from '@/utils/roleUtils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect already authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = getRoleBasedDashboard(user.roles);
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Login without specifying expected role - let backend determine user's role
      const success = await login(email, password);
      if (success) {
        // Small delay to ensure user data is properly set in context
        setTimeout(() => {
          const userStr = localStorage.getItem('erp_user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              const dashboardPath = getRoleBasedDashboard(user.roles);
              navigate(dashboardPath);
            } catch {
              navigate('/dashboard');
            }
          } else {
            navigate('/dashboard');
          }
        }, 150); // Slightly longer delay to ensure context updates
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
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
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Building2 className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <p className="text-muted-foreground mt-2">
                Sign in to access your ERP dashboard
              </p>
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
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="text-sm space-y-1">
                <p><strong>HR:</strong> hr@company.com</p>
                <p><strong>Finance:</strong> finance@company.com</p>
                <p><strong>Admin:</strong> admin@company.com</p>
                <p><strong>Password:</strong> demo123</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                You'll be automatically redirected to your dashboard based on your role.
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Prefer role-specific login?{' '}
                <span className="space-x-2">
                  <button 
                    onClick={() => navigate('/hr-login')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    HR
                  </button>
                  <span>|</span>
                  <button 
                    onClick={() => navigate('/finance-login')}
                    className="text-green-600 hover:text-green-800 underline"
                  >
                    Finance
                  </button>
                  <span>|</span>
                  <button 
                    onClick={() => navigate('/admin-login')}
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    Admin
                  </button>
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}