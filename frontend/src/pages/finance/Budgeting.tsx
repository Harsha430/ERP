import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Plus, Edit, Trash2, RefreshCw, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { financeService, formatCurrency } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Budgeting() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'EXPENSE',
    plannedAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months from now
    status: 'ACTIVE'
  });

  const budgetsQuery = useQuery({
    queryKey: ['budgets'],
    queryFn: () => financeService.getBudgets(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => financeService.createBudget(payload),
    onSuccess: (data: any) => {
      if (data && typeof data === 'object' && data.success === false) {
        toast({ 
          title: 'Failed', 
          description: data.message || 'Could not create budget', 
          variant: 'destructive' 
        });
        return;
      }
      toast({ title: 'Success', description: 'Budget created successfully' });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed', 
        description: error.message || 'Could not create budget', 
        variant: 'destructive' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: any) => financeService.updateBudget(id, payload),
    onSuccess: (data: any) => {
      if (data && typeof data === 'object' && data.success === false) {
        toast({ 
          title: 'Failed', 
          description: data.message || 'Could not update budget', 
          variant: 'destructive' 
        });
        return;
      }
      toast({ title: 'Success', description: 'Budget updated successfully' });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      setOpen(false);
      setEditingBudget(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed', 
        description: error.message || 'Could not update budget', 
        variant: 'destructive' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteBudget(id),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Budget deleted successfully' });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed', 
        description: error.message || 'Could not delete budget', 
        variant: 'destructive' 
      });
    }
  });

  const budgets = budgetsQuery.data || [];
  
  const budgetStats = useMemo(() => {
    const totalPlanned = budgets.reduce((sum: number, b: any) => sum + Number(b.plannedAmount || 0), 0);
    const totalActual = budgets.reduce((sum: number, b: any) => sum + Number(b.actualAmount || 0), 0);
    const totalVariance = totalPlanned - totalActual;
    const activeBudgets = budgets.filter((b: any) => b.status === 'ACTIVE').length;
    const overBudgetCount = budgets.filter((b: any) => Number(b.actualAmount || 0) > Number(b.plannedAmount || 0)).length;

    return {
      totalPlanned,
      totalActual,
      totalVariance,
      activeBudgets,
      overBudgetCount,
      totalBudgets: budgets.length
    };
  }, [budgets]);

  const chartData = useMemo(() => {
    return budgets.map((budget: any) => ({
      name: budget.name,
      planned: Number(budget.plannedAmount || 0),
      actual: Number(budget.actualAmount || 0),
      category: budget.category
    }));
  }, [budgets]);

  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    budgets.forEach((budget: any) => {
      const category = budget.category || 'OTHER';
      categoryMap[category] = (categoryMap[category] || 0) + Number(budget.plannedAmount || 0);
    });
    
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [budgets]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      category: 'EXPENSE',
      plannedAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE'
    });
  };

  const openEditDialog = (budget: any) => {
    setEditingBudget(budget);
    setForm({
      name: budget.name || '',
      description: budget.description || '',
      category: budget.category || 'EXPENSE',
      plannedAmount: budget.plannedAmount?.toString() || '',
      startDate: budget.startDate || new Date().toISOString().split('T')[0],
      endDate: budget.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: budget.status || 'ACTIVE'
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name || !form.plannedAmount) {
      toast({ title: 'Validation Error', description: 'Name and planned amount are required', variant: 'destructive' });
      return;
    }

    const payload = {
      ...form,
      plannedAmount: Number(form.plannedAmount)
    };

    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const loading = budgetsQuery.isLoading;

  if (loading) return <div className='flex items-center justify-center min-h-[300px] gap-2'><RefreshCw className='h-6 w-6 animate-spin'/><span>Loading budgets...</span></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground">Create and track budgets across categories</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90" onClick={() => { setEditingBudget(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget Name *</Label>
                  <Input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    placeholder="e.g., Q4 Marketing Budget"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REVENUE">Revenue</SelectItem>
                      <SelectItem value="EXPENSE">General Expense</SelectItem>
                      <SelectItem value="PAYROLL">Payroll</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="OPERATIONS">Operations</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  placeholder="Budget description..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Planned Amount (₹) *</Label>
                  <Input 
                    type="number" 
                    value={form.plannedAmount} 
                    onChange={e => setForm(f => ({ ...f, plannedAmount: e.target.value }))} 
                    placeholder="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input 
                    type="date" 
                    value={form.endDate} 
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingBudget ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Budget Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Planned</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(budgetStats.totalPlanned)}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Actual</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(budgetStats.totalActual)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Variance</p>
                  <p className={`text-2xl font-bold ${budgetStats.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {budgetStats.totalVariance >= 0 ? '+' : ''}{formatCurrency(budgetStats.totalVariance)}
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${budgetStats.totalVariance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Budgets</p>
                  <p className="text-2xl font-bold text-purple-600">{budgetStats.activeBudgets}</p>
                  <p className="text-xs text-muted-foreground">{budgetStats.overBudgetCount} over budget</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.5}}>
          <Card className="erp-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5"/>
                Budget vs Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="planned" name="Planned" fill="#3b82f6" />
                  <Bar dataKey="actual" name="Actual" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.6}}>
          <Card className="erp-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5"/>
                Budget by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Budget Table */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.7}}>
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5"/>
              Budget List ({budgets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Planned</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget: any, index: number) => (
                  <motion.tr 
                    key={budget.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.03 }} 
                    className="hover:bg-secondary"
                  >
                    <TableCell className="font-medium">{budget.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{budget.category}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(Number(budget.plannedAmount || 0))}</TableCell>
                    <TableCell>{formatCurrency(Number(budget.actualAmount || 0))}</TableCell>
                    <TableCell className={Number(budget.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Number(budget.variance || 0) >= 0 ? '+' : ''}{formatCurrency(Number(budget.variance || 0))}
                    </TableCell>
                    <TableCell className="text-sm">
                      {budget.startDate} to {budget.endDate}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        budget.status === 'ACTIVE' ? 'default' : 
                        budget.status === 'COMPLETED' ? 'secondary' : 
                        budget.status === 'CANCELLED' ? 'destructive' : 'outline'
                      }>
                        {budget.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(budget)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteMutation.mutate(budget.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                {budgets.length === 0 && (
                  <tr>
                    <TableCell colSpan={8} className='text-center text-sm text-muted-foreground py-6'>
                      No budgets created yet. Click "Create Budget" to get started.
                    </TableCell>
                  </tr>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}