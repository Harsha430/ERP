import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Plus, Search, Download, CheckCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService, formatCurrency } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function Transactions() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: () => financeService.getExpenses(),
  });
  const payrollQuery = useQuery({
    queryKey: ['payroll-entries'],
    queryFn: () => financeService.getPayrollEntries(),
  });
  const accountsQuery = useQuery({ queryKey:['accounts'], queryFn:()=> financeService.getAccounts() });

  const loading = expensesQuery.isLoading || payrollQuery.isLoading;
  const expenses = expensesQuery.data || [];
  const payrollEntries = payrollQuery.data || [];
  const accounts = accountsQuery.data || [];



  const createExpenseMutation = useMutation({
    mutationFn: (payload: any) => financeService.createExpense(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ['expenses'] });
      const prev = qc.getQueryData<any[]>(['expenses']);
      const optimistic = { ...payload, id: 'temp-exp-' + Date.now(), amount: payload.amount, expenseDate: payload.expenseDate, status: 'PENDING' };
      qc.setQueryData<any[]>(['expenses'], (old = []) => [optimistic, ...old]);
      return { prev };
    },
    onError: (_err, _v, ctx:any) => { if (ctx?.prev) qc.setQueryData(['expenses'], ctx.prev); toast({ title:'Failed', description:'Could not create expense', variant:'destructive'}); },
    onSuccess: () => { toast({ title:'Expense recorded'}); },
    onSettled: () => { 
      qc.invalidateQueries({ queryKey:['expenses'] }); 
      qc.invalidateQueries({ queryKey:['payroll-entries'] }); 
    }
  });

  const markExpensePaidMutation = useMutation({
    mutationFn: (id: string) => financeService.markExpensePaid(id),
    onSuccess: () => { 
      toast({ title:'Expense marked paid'}); 
      qc.invalidateQueries({ queryKey:['expenses']}); 
      qc.invalidateQueries({ queryKey:['payroll-entries']}); 
    },
    onError: (e:any) => toast({ title:'Failed', description:e.message||'Error', variant:'destructive'})
  });

  const expenseCategories = ['RENT','UTILITIES','TRAVEL','VENDOR','OTHER'];
  const [expenseForm, setExpenseForm] = useState({
    title:'',
    description:'',
    expenseDate: new Date().toISOString().split('T')[0],
    amount:'',
    category:'RENT',
    accountId:''        // single receiver account (debit side for expense)
  });


  const submitExpense = () => {
    if (!expenseForm.title || !expenseForm.amount) { toast({ title:'Missing fields', variant:'destructive'}); return; }
    if (!expenseForm.accountId) { toast({ title:'Select receiver account', variant:'destructive'}); return; }
    const payload:any = {
      title: expenseForm.title,
      description: expenseForm.description,
      expenseDate: expenseForm.expenseDate,
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
      status: 'PENDING',
      debitAccount: { id: Number(expenseForm.accountId) } // only receiver account for expense
    };
    createExpenseMutation.mutate(payload);
    setShowExpenseModal(false);
    setExpenseForm({ title:'', description:'', expenseDate: new Date().toISOString().split('T')[0], amount:'', category:'RENT', accountId:'' });
  };

  const transactionsCombined = useMemo(()=>{
    const expTx = expenses.map((e:any) => ({ 
      base:'expense', 
      raw:e, 
      id: 'EXP-'+e.id, 
      entityId: e.id, 
      date: e.expenseDate || '', 
      description: e.title || 'Expense', 
      account: (e.debitAccount && e.debitAccount.name) || (e.category && e.category.name) || e.category || 'Expense', 
      category: e.category || 'EXPENSE', 
      type: 'Expense', 
      status: e.status || 'PENDING', 
      amount: Number(e.amount)||0 
    }));

    const payrollTx = payrollEntries.map((p:any) => ({
      base: 'payroll',
      raw: p,
      id: 'PAY-' + p.id,
      entityId: p.id,
      date: p.payDate || '',
      description: `Salary Payment - ${p.employeeName}`,
      account: 'Salary Expense',
      category: 'SALARY',
      type: 'Payroll',
      status: p.status || 'PENDING',
      amount: Number(p.netSalary) || 0
    }));
    
    const allTransactions = [...expTx, ...payrollTx].sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Apply filters
    return allTransactions.filter(tx => {
      const matchesSearch = !searchTerm || 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || 
        tx.status.toUpperCase() === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  },[expenses, payrollEntries, searchTerm, statusFilter]);

  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (Number(expense.amount) || 0), 0);
  const totalPayroll = payrollEntries.reduce((sum: number, payroll: any) => sum + (Number(payroll.netSalary) || 0), 0);
  const totalTransactions = totalExpenses + totalPayroll;
  const paidTransactions = transactionsCombined.filter((t: any) => t.status?.toUpperCase() === 'PAID').reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
  const pendingTransactions = transactionsCombined.filter((t: any) => t.status?.toUpperCase() === 'PENDING').reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
  const totalPages = Math.max(1, Math.ceil(transactionsCombined.length / pageSize));
  const pageSlice = transactionsCombined.slice((page-1)*pageSize, page*pageSize);

  if (loading) return <div className='flex justify-center items-center min-h-[300px] gap-2'><Loader2 className='h-6 w-6 animate-spin'/><span>Loading transactions...</span></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className='flex items-center justify-between'>
        <div><h1 className='text-3xl font-bold'>Financial Transactions</h1><p className='text-muted-foreground'>View and manage all financial transactions including expenses and payroll</p></div>
        <div className='flex gap-2'>
          <Button onClick={()=> setShowExpenseModal(true)}><Plus className='h-4 w-4 mr-2'/>Add Expense</Button>
          <Button variant='outline'><Download className='h-4 w-4 mr-2'/>Export</Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
        <Card>
          <CardContent className='p-6'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground'/>
                  <Input
                    placeholder='Search transactions...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='w-full sm:w-48'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Filter by status'/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Status</SelectItem>
                    <SelectItem value='PENDING'>Pending</SelectItem>
                    <SelectItem value='PAID'>Paid</SelectItem>
                    <SelectItem value='APPROVED'>Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <Card className='stat-card'><CardContent className='p-6'><div className='flex items-center justify-between'><div><p className='text-sm font-medium text-muted-foreground'>Total Transactions</p><p className='text-2xl font-bold text-red-600'>{formatCurrency(totalTransactions)}</p></div><div className='p-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600'><Receipt className='h-6 w-6 text-white'/></div></div></CardContent></Card>
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <Card className='stat-card'><CardContent className='p-6'><div className='flex items-center justify-between'><div><p className='text-sm font-medium text-muted-foreground'>Paid Transactions</p><p className='text-2xl font-bold text-green-600'>{formatCurrency(paidTransactions)}</p></div><div className='p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600'><CheckCircle className='h-6 w-6 text-white'/></div></div></CardContent></Card>
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
          <Card className='stat-card'><CardContent className='p-6'><div className='flex items-center justify-between'><div><p className='text-sm font-medium text-muted-foreground'>Pending Transactions</p><p className='text-2xl font-bold text-orange-600'>{formatCurrency(pendingTransactions)}</p></div><div className='p-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600'><Receipt className='h-6 w-6 text-white'/></div></div></CardContent></Card>
        </motion.div>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
        <Card className='erp-card'>
          <CardHeader><CardTitle className='flex items-center gap-2'><Receipt className='h-5 w-5'/>Financial Transactions ({transactionsCombined.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Account</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead className='text-right'>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {pageSlice.map((t,index)=> (
                  <motion.tr key={t.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:index*0.02}} className='hover:bg-secondary'>
                    <TableCell className='font-medium'>{t.id}</TableCell>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{t.account}</TableCell>
                    <TableCell><Badge variant='outline'>{t.category}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={String(t.status).toUpperCase()==='PAID' ? 'default':'secondary'}>{String(t.status)}</Badge>
                    </TableCell>
                    <TableCell className='font-bold text-red-600'>{formatCurrency(t.amount)}</TableCell>
                    <TableCell className='text-right'>
                      {String(t.status).toUpperCase()!=='PAID' && t.base === 'expense' && (
                        <Button size='sm' variant='outline' disabled={markExpensePaidMutation.isLoading}
                          onClick={()=> markExpensePaidMutation.mutate(String(t.entityId))}>
                          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.2}} className='flex items-center gap-1'>
                            <CheckCircle className='h-4 w-4'/><span>Mark Paid</span>
                          </motion.div>
                        </Button>
                      )}
                      {t.base === 'payroll' && (
                        <Badge variant='outline' className='text-xs'>
                          Payroll
                        </Badge>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            {transactionsCombined.length === 0 && (
              <div className='text-center py-8 text-muted-foreground'>
                No transactions found matching your criteria.
              </div>
            )}
            <div className='flex items-center justify-between pt-4'>
              <span className='text-xs text-muted-foreground'>Page {page} / {totalPages}</span>
              <div className='flex gap-2'>
                <Button size='sm' variant='outline' disabled={page===1} onClick={()=> setPage(p=> p-1)}>Prev</Button>
                <Button size='sm' variant='outline' disabled={page===totalPages} onClick={()=> setPage(p=> p+1)}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>


      {/* Create Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader><DialogTitle>Record New Expense</DialogTitle></DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'><Label htmlFor='title'>Title *</Label><Input id='title' value={expenseForm.title} onChange={e=> setExpenseForm(f=> ({...f, title:e.target.value}))}/></div>
              <div className='space-y-2'><Label htmlFor='amount'>Amount *</Label><Input id='amount' type='number' value={expenseForm.amount} onChange={e=> setExpenseForm(f=> ({...f, amount:e.target.value}))}/></div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'><Label htmlFor='date'>Date *</Label><Input id='date' type='date' value={expenseForm.expenseDate} onChange={e=> setExpenseForm(f=> ({...f, expenseDate:e.target.value}))}/></div>
              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select value={expenseForm.category} onValueChange={(v)=> setExpenseForm(f=> ({...f, category:v}))}>
                  <SelectTrigger><SelectValue placeholder='Select category'/></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(c=> <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'><Label htmlFor='description'>Description</Label><Textarea id='description' value={expenseForm.description} onChange={e=> setExpenseForm(f=> ({...f, description:e.target.value}))}/></div>
            <div className='space-y-2'>
              <Label htmlFor='account'>Account</Label>
              <Select value={expenseForm.accountId} onValueChange={(v)=> setExpenseForm(f=> ({...f, accountId:v}))}>
                <SelectTrigger><SelectValue placeholder='Select account'/></SelectTrigger>
                <SelectContent>
                  {accounts.map((a:any)=> <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={()=> setShowExpenseModal(false)}>Cancel</Button>
            <Button onClick={submitExpense} disabled={createExpenseMutation.isLoading}>
              {createExpenseMutation.isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin'/>
                  Recording...
                </>
              ) : (
                'Record Expense'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
