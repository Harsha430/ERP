import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Shield, Building2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const loginOptions = [
    {
      title: 'HR Portal',
      description: 'Manage employees, attendance, and payroll',
      icon: Users,
      color: 'from-blue-500 to-purple-600',
      path: '/hr-login'
    },
    {
      title: 'Finance Portal', 
      description: 'Handle accounts, transactions, and budgets',
      icon: CreditCard,
      color: 'from-green-500 to-teal-600',
      path: '/finance-login'
    },
    {
      title: 'Admin Portal',
      description: 'Full system access and user management',
      icon: Shield,
      color: 'from-purple-500 to-pink-600', 
      path: '/admin-login'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold">ERP System</h1>
          </div>
          <p className="text-xl text-muted-foreground">Choose your portal to access the system</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loginOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="erp-card cursor-pointer h-full flex flex-col" onClick={() => navigate(option.path)}>
                <CardContent className="p-8 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                      <option.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                    <p className="text-muted-foreground mb-6 min-h-[3rem] flex items-center justify-center">{option.description}</p>
                  </div>
                  <Button className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90`}>
                    Access Portal
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          Demo credentials: Use any role email with password "demo123"
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
