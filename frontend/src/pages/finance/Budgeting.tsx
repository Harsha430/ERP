import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Plus } from 'lucide-react';
import { financeService, formatCurrency } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MonthlyRow { month: string; revenue: number; expenses: number; variance: number; }

export default function Budgeting() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(()=>{ (async()=>{
    try { setLoading(true);
      const [inv, exp] = await Promise.all([
        financeService.getInvoices().catch(()=>[]),
        financeService.getExpenses().catch(()=>[])
      ]);
      setInvoices(inv); setExpenses(exp);
    } catch(e:any){ toast({ title:'Budget data load failed', description:e.message||'Error', variant:'destructive'});} finally { setLoading(false);} })(); },[]);

  const monthly = useMemo(()=>{
    const map: Record<string, MonthlyRow> = {};
    const key = (d?: string)=> { if(!d) return 'Unknown'; const dt=new Date(d); if(isNaN(dt.getTime())) return 'Unknown'; return dt.toLocaleString('en-US',{month:'short'})+ ' ' + dt.getFullYear(); };
    invoices.forEach(i=>{ const k=key(i.invoiceDate); if(!map[k]) map[k]={month:k,revenue:0,expenses:0,variance:0}; map[k].revenue += Number(i.totalAmount)||0; });
    expenses.forEach(e=>{ const k=key(e.expenseDate); if(!map[k]) map[k]={month:k,revenue:0,expenses:0,variance:0}; map[k].expenses += Number(e.amount)||0; });
    Object.values(map).forEach(r=> r.variance = r.revenue - r.expenses);
    return Object.values(map).sort((a,b)=> new Date(a.month).getTime()-new Date(b.month).getTime());
  },[invoices,expenses]);

  const totalBudget = monthly.reduce((s,m)=> s + m.revenue,0);
  const totalActual = monthly.reduce((s,m)=> s + m.expenses,0);
  const variance = totalBudget - totalActual; // positive means under budget
  const variancePercentage = totalBudget ? ((variance/totalBudget)*100).toFixed(1) : '0.0';

  if (loading) return <div className='flex items-center justify-center min-h-[300px] gap-2'><span className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full'/>Loading budgeting...</div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground">Track revenue vs expenses performance</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget (Coming Soon)
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <Card className="stat-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p></div><div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600"><BarChart3 className="h-6 w-6 text-white"/></div></div></CardContent></Card>
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <Card className="stat-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Actual Expenses</p><p className="text-2xl font-bold">{formatCurrency(totalActual)}</p></div><div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"><TrendingUp className="h-6 w-6 text-white"/></div></div></CardContent></Card>
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <Card className="stat-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Variance (Rev-Exp)</p><p className={`text-2xl font-bold ${variance>=0? 'text-green-600':'text-red-600'}`}>{variance>=0? '+':''}{formatCurrency(variance)}</p></div><div className={`p-3 rounded-full ${variance>=0? 'bg-gradient-to-r from-green-500 to-emerald-600':'bg-gradient-to-r from-red-500 to-rose-600'}`}><TrendingUp className="h-6 w-6 text-white"/></div></div></CardContent></Card>
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
          <Card className="stat-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Performance %</p><p className={`text-2xl font-bold ${variance>=0? 'text-green-600':'text-red-600'}`}>{variancePercentage}%</p></div><div className={`p-3 rounded-full ${variance>=0? 'bg-gradient-to-r from-green-500 to-emerald-600':'bg-gradient-to-r from-red-500 to-rose-600'}`}><BarChart3 className="h-6 w-6 text-white"/></div></div></CardContent></Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.5}}>
          <Card className="erp-card"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/>Monthly Revenue vs Expenses</CardTitle></CardHeader><CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </motion.div>
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.6}}>
          <Card className="erp-card"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/>Variance Trend</CardTitle></CardHeader><CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="variance" stroke="#10b981" strokeWidth={2} name="Variance" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </motion.div>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.7}}>
        <Card className="erp-card"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/>Monthly Breakdown</CardTitle></CardHeader><CardContent>
          <div className="space-y-4">
            {monthly.map((m,i)=> (
              <motion.div key={m.month} initial={{opacity:0,x:-15}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <h4 className="font-medium">{m.month}</h4>
                  <p className="text-sm text-muted-foreground">{m.revenue? 'Positive month':'No revenue recorded'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Revenue: {formatCurrency(m.revenue)}</p>
                  <p className="font-medium">Expenses: {formatCurrency(m.expenses)}</p>
                  <p className={`text-sm font-semibold ${m.variance>=0? 'text-green-600':'text-red-600'}`}>Variance: {m.variance>=0? '+':''}{formatCurrency(m.variance)}</p>
                </div>
              </motion.div>
            ))}
            {monthly.length===0 && <p className='text-sm text-muted-foreground'>No financial data available.</p>}
          </div>
        </CardContent></Card>
      </motion.div>
    </div>
  );
}