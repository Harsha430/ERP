import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Plus, Filter, Download, CheckCircle } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export default function Transactions() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: () => financeService.getInvoices(),
  });
  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: () => financeService.getExpenses(),
  });
  const accountsQuery = useQuery({ queryKey:['accounts'], queryFn:()=> financeService.getAccounts() });

  const loading = invoicesQuery.isLoading || expensesQuery.isLoading;
  const invoices = invoicesQuery.data || [];
  const expenses = expensesQuery.data || [];
  const accounts = accountsQuery.data || [];

  const createInvoiceMutation = useMutation({
    mutationFn: (payload: any) => financeService.createInvoice(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ['invoices'] });
      const prev = qc.getQueryData<any[]>(['invoices']);
      const optimistic = { ...payload, id: 'temp-inv-' + Date.now(), totalAmount: payload.totalAmount, invoiceDate: payload.invoiceDate, status: 'PENDING' };
      qc.setQueryData<any[]>(['invoices'], (old = []) => [optimistic, ...old]);
      return { prev };
    },
    onError: (_err, _v, ctx:any) => { if (ctx?.prev) qc.setQueryData(['invoices'], ctx.prev); toast({ title:'Failed', description:'Could not create invoice', variant:'destructive'}); },
    onSuccess: () => { toast({ title:'Invoice created'}); },
    onSettled: () => { qc.invalidateQueries({ queryKey:['invoices'] }); }
  });

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
    onSettled: () => { qc.invalidateQueries({ queryKey:['expenses'] }); }
  });

  const markInvoicePaidMutation = useMutation({
    mutationFn: (id: string) => financeService.markInvoicePaid(id),
    onSuccess: () => { toast({ title:'Invoice marked paid'}); qc.invalidateQueries({ queryKey:['invoices']}); },
    onError: (e:any) => toast({ title:'Failed', description:e.message||'Error', variant:'destructive'})
  });
  const markExpensePaidMutation = useMutation({
    mutationFn: (id: string) => financeService.markExpensePaid(id),
    onSuccess: () => { toast({ title:'Expense marked paid'}); qc.invalidateQueries({ queryKey:['expenses']}); },
    onError: (e:any) => toast({ title:'Failed', description:e.message||'Error', variant:'destructive'})
  });

  // Expanded invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber:'',
    customerName:'',
    customerEmail:'',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    amount:'',          // base amount before tax
    taxPercent:'0',
    taxAmount: '0',
    totalAmount:'',
    accountId:''        // single receiver / counterparty account (credit side for invoice)
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

  // Recompute tax + total when amount or taxPercent changes
  useEffect(()=>{
    const amt = parseFloat(invoiceForm.amount||'0') || 0;
    const taxP = parseFloat(invoiceForm.taxPercent||'0') || 0;
    const taxAmt = +(amt * taxP / 100).toFixed(2);
    const total = +(amt + taxAmt).toFixed(2);
    setInvoiceForm(f=> ({...f, taxAmount: taxAmt.toString(), totalAmount: total? total.toString(): f.totalAmount}));
  },[invoiceForm.amount, invoiceForm.taxPercent]);

  const submitInvoice = () => {
    if (!invoiceForm.invoiceNumber || !invoiceForm.amount) { toast({ title:'Missing fields', description:'Invoice number & amount required', variant:'destructive'}); return; }
    if (!invoiceForm.accountId) { toast({ title:'Select receiver account', variant:'destructive'}); return; }
    const payload:any = {
      invoiceNumber: invoiceForm.invoiceNumber,
      customerName: invoiceForm.customerName,
      customerEmail: invoiceForm.customerEmail,
      invoiceDate: invoiceForm.invoiceDate,
      dueDate: invoiceForm.dueDate,
      amount: Number(invoiceForm.amount),
      taxAmount: Number(invoiceForm.taxAmount||0),
      totalAmount: Number(invoiceForm.totalAmount) || (Number(invoiceForm.amount)+Number(invoiceForm.taxAmount||0)),
      status: 'PENDING',
      creditAccount: { id: Number(invoiceForm.accountId) } // only receiver account sent
    };
    createInvoiceMutation.mutate(payload);
    setShowInvoiceModal(false);
    setInvoiceForm({ invoiceNumber:'', customerName:'', customerEmail:'', invoiceDate: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], amount:'', taxPercent:'0', taxAmount:'0', totalAmount:'', accountId:'' });
  };
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
    const invTx = invoices.map((i:any) => ({ base:'invoice', raw:i, id: 'INV-'+i.id, entityId: i.id, date: i.invoiceDate || '', description: i.invoiceNumber || 'Invoice', account: (i.creditAccount && i.creditAccount.name) || i.customerName || 'Customer', category: 'INVOICE', type: 'Credit', status: i.status || 'PENDING', amount: Number(i.totalAmount)||0 }));
    const expTx = expenses.map((e:any) => ({ base:'expense', raw:e, id: 'EXP-'+e.id, entityId: e.id, date: e.expenseDate || '', description: e.title || 'Expense', account: (e.debitAccount && e.debitAccount.name) || (e.category && e.category.name) || e.category || 'Expense', category: e.category || 'EXPENSE', type: 'Debit', status: e.status || 'PENDING', amount: -(Number(e.amount)||0) }));
    return [...invTx, ...expTx].sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime());
  },[invoices, expenses]);

  const totalCredit = transactionsCombined.filter(t=> t.type==='Credit').reduce((s,t)=> s + t.amount, 0);
  const totalDebit = transactionsCombined.filter(t=> t.type==='Debit').reduce((s,t)=> s + Math.abs(t.amount), 0);
  const totalPages = Math.max(1, Math.ceil(transactionsCombined.length / pageSize));
  const pageSlice = transactionsCombined.slice((page-1)*pageSize, page*pageSize);

  if (loading) return <div className='flex justify-center items-center min-h-[300px] gap-2'><span className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full'/><span>Loading transactions...</span></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className='flex items-center justify-between'>
        <div><h1 className='text-3xl font-bold'>Transaction History</h1><p className='text-muted-foreground'>View and manage all financial transactions</p></div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={()=> setShowInvoiceModal(true)}><Plus className='h-4 w-4 mr-2'/>Invoice</Button>
          <Button variant='outline' onClick={()=> setShowExpenseModal(true)}><Plus className='h-4 w-4 mr-2'/>Expense</Button>
          <Button variant='outline'><Filter className='h-4 w-4 mr-2'/>Filter</Button>
          <Button variant='outline'><Download className='h-4 w-4 mr-2'/>Export</Button>
        </div>
      </motion.div>

      {/* Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <Card className='stat-card'><CardContent className='p-6'><div className='flex items-center justify-between'><div><p className='text-sm font-medium text-muted-foreground'>Total Credits</p><p className='text-2xl font-bold text-green-600'>+₹{totalCredit.toLocaleString()}</p></div><div className='p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600'><Receipt className='h-6 w-6 text-white'/></div></div></CardContent></Card>
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <Card className='stat-card'><CardContent className='p-6'><div className='flex items-center justify-between'><div><p className='text-sm font-medium text-muted-foreground'>Total Debits</p><p className='text-2xl font-bold text-red-600'>-₹{totalDebit.toLocaleString()}</p></div><div className='p-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600'><Receipt className='h-6 w-6 text-white'/></div></div></CardContent></Card>
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <Card className='stat-card'><CardContent className='p-6'><div className='flex items-center justify-between'><div><p className='text-sm font-medium text-muted-foreground'>Net Flow</p><p className='text-2xl font-bold'>₹{(totalCredit - totalDebit).toLocaleString()}</p></div><div className='p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600'><Receipt className='h-6 w-6 text-white'/></div></div></CardContent></Card>
        </motion.div>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
        <Card className='erp-card'>
          <CardHeader><CardTitle className='flex items-center gap-2'><Receipt className='h-5 w-5'/>Transactions ({transactionsCombined.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Account</TableHead><TableHead>Category</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead className='text-right'>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {pageSlice.map((t,index)=> (
                  <motion.tr key={t.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:index*0.02}} className='hover:bg-secondary'>
                    <TableCell className='font-medium'>{t.id}</TableCell>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{t.account}</TableCell>
                    <TableCell><Badge variant='outline'>{t.category}</Badge></TableCell>
                    <TableCell><Badge className={t.type==='Credit' ? 'status-approved':'status-rejected'}>{t.type}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={String(t.status).toUpperCase()==='PAID' ? 'default':'secondary'}>{String(t.status)}</Badge>
                    </TableCell>
                    <TableCell className={`font-bold ${t.amount>=0? 'text-green-600':'text-red-600'}`}>{t.amount>=0? '+':''}₹{Math.abs(t.amount).toLocaleString()}</TableCell>
                    <TableCell className='text-right'>
                      {String(t.status).toUpperCase()!=='PAID' && (
                        <Button size='sm' variant='outline' disabled={markInvoicePaidMutation.isLoading||markExpensePaidMutation.isLoading}
                          onClick={()=> t.base==='invoice' ? markInvoicePaidMutation.mutate(String(t.entityId)) : markExpensePaidMutation.mutate(String(t.entityId))}>
                          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.2}} className='flex items-center gap-1'>
                            <CheckCircle className='h-4 w-4'/><span>Mark Paid</span>
                          </motion.div>
                        </Button>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
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

      {/* Create Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className='sm:max-w-[620px]'>
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              <div className='space-y-1'><Label>Invoice Number *</Label><Input value={invoiceForm.invoiceNumber} onChange={e=> setInvoiceForm(f=> ({...f, invoiceNumber:e.target.value}))}/></div>
              <div className='space-y-1'><Label>Invoice Date *</Label><Input type='date' value={invoiceForm.invoiceDate} onChange={e=> setInvoiceForm(f=> ({...f, invoiceDate:e.target.value}))}/></div>
              <div className='space-y-1'><Label>Due Date *</Label><Input type='date' value={invoiceForm.dueDate} onChange={e=> setInvoiceForm(f=> ({...f, dueDate:e.target.value}))}/></div>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              <div className='space-y-1'><Label>Customer Name</Label><Input value={invoiceForm.customerName} onChange={e=> setInvoiceForm(f=> ({...f, customerName:e.target.value}))}/></div>
              <div className='space-y-1'><Label>Customer Email</Label><Input type='email' value={invoiceForm.customerEmail} onChange={e=> setInvoiceForm(f=> ({...f, customerEmail:e.target.value}))}/></div>
              <div className='space-y-1'><Label>Amount (Base) *</Label><Input type='number' value={invoiceForm.amount} onChange={e=> setInvoiceForm(f=> ({...f, amount:e.target.value, totalAmount:''}))}/></div>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-1'><Label>Tax %</Label><Input type='number' value={invoiceForm.taxPercent} onChange={e=> setInvoiceForm(f=> ({...f, taxPercent:e.target.value}))}/></div>
              <div className='space-y-1'><Label>Tax Amount</Label><Input readOnly value={invoiceForm.taxAmount}/></div>
              <div className='space-y-1'><Label>Total</Label><Input readOnly value={invoiceForm.totalAmount}/></div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <Label>Receiver Account *</Label>
                <Select value={invoiceForm.accountId} onValueChange={(v)=> setInvoiceForm(f=> ({...f, accountId:v}))}>
                  <SelectTrigger><SelectValue placeholder='Select account'/></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a:any)=> <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={()=> setShowInvoiceModal(false)}>Cancel</Button>
            <Button onClick={submitInvoice} disabled={createInvoiceMutation.isLoading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className='sm:max-w-[620px]'>
          <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              <div className='space-y-1'><Label>Title *</Label><Input value={expenseForm.title} onChange={e=> setExpenseForm(f=> ({...f, title:e.target.value}))}/></div>
              <div className='space-y-1'><Label>Date *</Label><Input type='date' value={expenseForm.expenseDate} onChange={e=> setExpenseForm(f=> ({...f, expenseDate:e.target.value}))}/></div>
              <div className='space-y-1'><Label>Amount *</Label><Input type='number' value={expenseForm.amount} onChange={e=> setExpenseForm(f=> ({...f, amount:e.target.value}))}/></div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <Label>Category *</Label>
                <Select value={expenseForm.category} onValueChange={(v)=> setExpenseForm(f=> ({...f, category:v}))}>
                  <SelectTrigger><SelectValue placeholder='Select category'/></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1'><Label>Description</Label><Input value={expenseForm.description} onChange={e=> setExpenseForm(f=> ({...f, description:e.target.value}))}/></div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <Label>Receiver Account *</Label>
                <Select value={expenseForm.accountId} onValueChange={(v)=> setExpenseForm(f=> ({...f, accountId:v}))}>
                  <SelectTrigger><SelectValue placeholder='Select account'/></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a:any)=> <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={()=> setShowExpenseModal(false)}>Cancel</Button>
            <Button onClick={submitExpense} disabled={createExpenseMutation.isLoading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
