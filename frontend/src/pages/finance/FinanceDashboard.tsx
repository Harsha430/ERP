import { motion } from 'framer-motion';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, FileText, BarChart3 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { financeService, formatCurrency } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { revenueData as mockRevenue, accounts as mockAccounts } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinanceDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any | null>(null);
  const [accountsData, setAccountsData] = useState<any[]>([]); // retained in case other features use it later
  const [expenses, setExpenses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [revenueSeries, setRevenueSeries] = useState<any[]>(mockRevenue);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [acc, sum, exp, inv] = await Promise.all([
          financeService.getAccounts().catch(() => mockAccounts),
          financeService.getFinancialSummary().catch(() => null),
          financeService.getExpenses().catch(() => []),
          financeService.getInvoices().catch(() => [])
        ]);
        setAccountsData(acc || []);
        setSummary(sum);
        setExpenses(exp);
        setInvoices(inv);
        if (inv.length || exp.length) {
          const map: Record<string, { month: string; revenue: number; expenses: number; }> = {};
          const monthKey = (d: string) => {
            try { const dt = new Date(d); return dt.toLocaleString('en-US', { month: 'short' }) + ' ' + dt.getFullYear(); } catch { return 'Unknown'; }
          };
          inv.forEach((i: any) => { if (!i.invoiceDate || !i.totalAmount) return; const k = monthKey(i.invoiceDate); map[k] = map[k] || { month: k, revenue: 0, expenses: 0 }; map[k].revenue += Number(i.totalAmount) || 0; });
          exp.forEach((e: any) => { if (!e.expenseDate || !e.amount) return; const k = monthKey(e.expenseDate); map[k] = map[k] || { month: k, revenue: 0, expenses: 0 }; map[k].expenses += Number(e.amount) || 0; });
          const series = Object.values(map).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
          if (series.length) setRevenueSeries(series);
        }
      } catch (e: any) {
        toast({ title: 'Finance data load failed', description: e.message || 'Unexpected error', variant: 'destructive' });
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const totalRevenue = useMemo(() => summary?.totalInvoiceAmount ? Number(summary.totalInvoiceAmount) : revenueSeries.reduce((s, i) => s + (i.revenue || 0), 0), [summary, revenueSeries]);
  const totalExpenses = useMemo(() => summary?.totalExpenses ? Number(summary.totalExpenses) : revenueSeries.reduce((s, i) => s + (i.expenses || 0), 0), [summary, revenueSeries]);
  // Removed obsolete totalBalance (no balance field in backend Account model)
  const pendingInvoices = useMemo(() => summary?.pendingInvoices ?? invoices.filter(i => (i.status || '').toUpperCase() === 'PENDING').length, [summary, invoices]);

  const recentTransactions = useMemo(() => {
    const invTx = invoices.slice(-5).map((i: any) => ({ id: 'INV-' + i.id, description: i.invoiceNumber || 'Invoice', account: i.customerName || 'Customer', amount: Number(i.totalAmount) || 0, date: i.invoiceDate || '' }));
    const expTx = expenses.slice(-5).map((e: any) => ({ id: 'EXP-' + e.id, description: e.title || 'Expense', account: (e.category && e.category.name) || e.category || 'Expense', amount: -(Number(e.amount) || 0), date: e.expenseDate || '' }));
    return [...invTx, ...expTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [invoices, expenses]);

  if (loading) return <div className='flex items-center justify-center min-h-[400px] gap-3'><Loader2 className='h-8 w-8 animate-spin' /><span className='text-lg'>Loading finance data...</span></div>;

  const chartsReady = typeof ResponsiveContainer !== 'undefined';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial operations</p>
        </div>
      </motion.div>

      {/* Adjusted grid to 3 columns since Account Balance card removed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} description="Aggregated invoices" trend={summary ? { value: pendingInvoices, label: 'pending invoices' } : undefined} color="green" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingUp} description="Aggregated expenses" color="red" />
        <StatCard title="Pending Invoices" value={pendingInvoices} icon={FileText} description="Awaiting payment" color="orange" />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.2}}>
          <Card className='erp-card'>
            <CardHeader><CardTitle className='flex items-center gap-2'><BarChart3 className='h-5 w-5'/>Revenue vs Expenses</CardTitle></CardHeader>
            <CardContent>
              {chartsReady ? (
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={revenueSeries}>
                    <CartesianGrid strokeDasharray='3 3'/>
                    <XAxis dataKey='month'/>
                    <YAxis />
                    <Tooltip />
                    <Line type='monotone' dataKey='revenue' stroke='#10b981' strokeWidth={2} />
                    <Line type='monotone' dataKey='expenses' stroke='#ef4444' strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className='text-sm text-muted-foreground'>Chart library not ready.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.3}}>
          <Card className='erp-card'>
            <CardHeader><CardTitle className='flex items-center gap-2'><CreditCard className='h-5 w-5'/>Recent Transactions</CardTitle></CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recentTransactions.length === 0 && <p className='text-sm text-muted-foreground'>No recent transactions</p>}
                {recentTransactions.map(tx => (
                  <div key={tx.id} className='flex items-center justify-between p-3 bg-secondary rounded-lg'>
                    <div>
                      <p className='font-medium'>{tx.description}</p>
                      <p className='text-sm text-muted-foreground'>{tx.account}</p>
                    </div>
                    <div className='text-right'>
                      <p className={`font-medium ${tx.amount>=0? 'text-green-600':'text-red-600'}`}>{tx.amount>=0? '+':''}{formatCurrency(Math.abs(tx.amount))}</p>
                      <span className='text-xs text-muted-foreground'>{tx.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}