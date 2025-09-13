import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function StatCard({ title, value, icon: Icon, description, trend, color = 'blue' }: StatCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'from-green-500 to-emerald-600';
      case 'purple':
        return 'from-purple-500 to-violet-600';
      case 'orange':
        return 'from-orange-500 to-amber-600';
      case 'red':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-blue-500 to-cyan-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="stat-card h-full flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between h-full">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              {trend && (
                <div className="flex items-center text-sm">
                  <span className={trend.value >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {trend.value >= 0 ? '+' : ''}{trend.value}%
                  </span>
                  <span className="text-muted-foreground ml-1">{trend.label}</span>
                </div>
              )}
            </div>
            
            <div className={`p-3 rounded-full bg-gradient-to-r ${getColorClasses(color)} shadow-lg flex-shrink-0`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}