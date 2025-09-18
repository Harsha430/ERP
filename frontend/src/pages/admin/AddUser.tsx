import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Save, X, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/apiService';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  roles: string[];
  enabled: boolean;
}

export default function AddUser() {
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    password: '',
    roles: [],
    enabled: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserData) => adminService.createUser(userData),
    onSuccess: (response) => {
      // Invalidate queries to refresh user lists
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-statistics'] });
      
      toast({
        title: "Success",
        description: response.message || "User created successfully",
      });
      
      // Navigate back to manage users
      navigate('/users');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Password is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (formData.roles.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one role is required",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof CreateUserData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, role]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r !== role)
      }));
    }
  };

  const availableRoles = [
    { 
      value: 'ADMIN', 
      label: 'Administrator',
      description: 'Full system access including user management and system configuration',
      permissions: [
        'Full HR Access',
        'Full Finance Access', 
        'User Management',
        'System Configuration',
        'Data Management'
      ]
    },
    { 
      value: 'HR', 
      label: 'HR Manager',
      description: 'Human resources management capabilities',
      permissions: [
        'Employee Management',
        'Department Management',
        'Attendance Tracking',
        'Leave Management',
        'Payroll Processing'
      ]
    },
    { 
      value: 'FINANCE', 
      label: 'Finance Manager',
      description: 'Financial operations and reporting access',
      permissions: [
        'Account Management',
        'Transaction Processing',
        'Invoice Management',
        'Expense Tracking',
        'Financial Reports'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/users')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Add New User</h1>
              <p className="text-muted-foreground">Create a new user account for the ERP system</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Information */}
            <Card className="erp-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username"
                    required
                    disabled={createUserMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for login. Should be unique across the system.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                    disabled={createUserMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be a valid email address. Used for notifications and recovery.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password"
                      required
                      disabled={createUserMutation.isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters required.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    disabled={createUserMutation.isPending}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => handleInputChange('enabled', checked as boolean)}
                    disabled={createUserMutation.isPending}
                  />
                  <Label htmlFor="enabled">Account Enabled</Label>
                </div>
              </CardContent>
            </Card>

            {/* Role Selection */}
            <Card className="erp-card">
              <CardHeader>
                <CardTitle>Role Assignment *</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select one or more roles for this user. Multiple roles provide combined permissions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableRoles.map((role) => (
                  <div key={role.value} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={role.value}
                        checked={formData.roles.includes(role.value)}
                        onCheckedChange={(checked) => handleRoleChange(role.value, checked as boolean)}
                        disabled={createUserMutation.isPending}
                      />
                      <div className="flex-1">
                        <Label htmlFor={role.value} className="text-base font-medium">
                          {role.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    
                    {formData.roles.includes(role.value) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-6 space-y-1"
                      >
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          Permissions included:
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {role.permissions.map((permission) => (
                            <div key={permission} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-muted-foreground">{permission}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <Card className="erp-card">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="bg-gradient-primary hover:opacity-90 flex-1"
                  disabled={createUserMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createUserMutation.isPending ? 'Creating User...' : 'Create User'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/users')}
                  disabled={createUserMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>

      {/* Selected Roles Summary */}
      {formData.roles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="erp-card">
            <CardHeader>
              <CardTitle>Selected Roles Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.roles.map((role) => {
                  const roleInfo = availableRoles.find(r => r.value === role);
                  return (
                    <div 
                      key={role} 
                      className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {roleInfo?.label}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This user will have combined permissions from all selected roles.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}