import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { financeService, formatCurrency } from '@/services/apiService';
import { FileText, Download, Calendar, BarChart3, TrendingUp, DollarSign, RefreshCw, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { exportToCSV } from '@/lib/exportUtil';

interface ReportRow { amount: number; date: string; status?: string; invoiceNumber?: string; title?: string; category?: string; }

export default function Reports() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailFrom, setDetailFrom] = useState<string>('');
  const [detailTo, setDetailTo] = useState<string>('');
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [balanceSheet, setBalanceSheet] = useState<any|null>(null);
  const [profitLoss, setProfitLoss] = useState<any|null>(null);
  const [cashFlow, setCashFlow] = useState<any|null>(null);

  const summaryQuery = useQuery({
    queryKey: ['financial-summary', refreshKey],
    queryFn: () => financeService.getFinancialSummary(),
  });

  const revenueQuery = useQuery<ReportRow[]>({
    queryKey: ['revenue-report', startDate, endDate, refreshKey],
    queryFn: () => financeService.getRevenueReport(startDate || undefined, endDate || undefined),
  });

  const expenseQuery = useQuery<ReportRow[]>({
    queryKey: ['expense-report', startDate, endDate, refreshKey],
    queryFn: () => financeService.getExpenseReport(startDate || undefined, endDate || undefined),
  });

  const loading = summaryQuery.isLoading || revenueQuery.isLoading || expenseQuery.isLoading;
  const error = summaryQuery.error || revenueQuery.error || expenseQuery.error;

  const totalRevenue = revenueQuery.data?.reduce((s,r)=> s + (Number(r.amount)||0),0) || 0;
  const totalExpenses = expenseQuery.data?.reduce((s,r)=> s + (Number(r.amount)||0),0) || 0;
  const net = totalRevenue - totalExpenses;

  const handleRefresh = () => {
    setRefreshKey(k => k+1);
    toast({ title:'Refreshing reports', description:'Fetching latest data...' });
  };

  const handleExport = () => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Prepare summary data
      const summaryData = [{
        'Report Type': 'Financial Summary',
        'Generated Date': currentDate,
        'Date Range': startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
        'Total Revenue': totalRevenue,
        'Total Expenses': totalExpenses,
        'Net Profit/Loss': net,
        'Paid Invoices': summaryQuery.data?.paidInvoices ?? 0
      }];

      // Prepare revenue data
      const revenueData = (revenueQuery.data || []).map(item => ({
        'Type': 'Revenue',
        'Invoice Number': item.invoiceNumber || 'N/A',
        'Customer': item.customerName || 'N/A',
        'Date': item.date,
        'Amount': item.amount,
        'Status': item.status || 'N/A'
      }));

      // Prepare expense data
      const expenseData = (expenseQuery.data || []).map(item => ({
        'Type': 'Expense',
        'Title': item.title || 'N/A',
        'Category': item.category || 'N/A',
        'Date': item.date,
        'Amount': item.amount,
        'Status': 'PAID'
      }));

      // Combine all data
      const allData = [
        ...summaryData,
        { 'Type': '', 'Invoice Number': '', 'Customer': '', 'Date': '', 'Amount': '', 'Status': '' }, // Empty row
        ...revenueData,
        ...expenseData
      ];

      const filename = `financial-report-${currentDate}.csv`;
      exportToCSV(filename, allData);
      
      toast({ 
        title: 'Export Successful', 
        description: `Financial report exported as ${filename}` 
      });
      
    } catch (error) {
      toast({ 
        title: 'Export Failed', 
        description: 'Could not export financial report', 
        variant: 'destructive' 
      });
    }
  };

  const exportRevenue = () => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const revenueData = (revenueQuery.data || []).map(item => ({
        'Invoice Number': item.invoiceNumber || 'N/A',
        'Customer Name': item.customerName || 'N/A',
        'Date': item.date,
        'Amount (INR)': item.amount,
        'Status': item.status || 'N/A'
      }));

      const filename = `revenue-report-${currentDate}.csv`;
      exportToCSV(filename, revenueData);
      
      toast({ 
        title: 'Export Successful', 
        description: `Revenue report exported as ${filename}` 
      });
    } catch (error) {
      toast({ 
        title: 'Export Failed', 
        description: 'Could not export revenue report', 
        variant: 'destructive' 
      });
    }
  };

  const exportExpenses = () => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const expenseData = (expenseQuery.data || []).map(item => ({
        'Title': item.title || 'N/A',
        'Category': item.category || 'N/A',
        'Date': item.date,
        'Amount (INR)': item.amount
      }));

      const filename = `expense-report-${currentDate}.csv`;
      exportToCSV(filename, expenseData);
      
      toast({ 
        title: 'Export Successful', 
        description: `Expense report exported as ${filename}` 
      });
    } catch (error) {
      toast({ 
        title: 'Export Failed', 
        description: 'Could not export expense report', 
        variant: 'destructive' 
      });
    }
  };

  const loadDetailed = async () => {
    if (!detailFrom || !detailTo) { toast({ title:'Dates required', description:'Select From and To dates', variant:'destructive'}); return; }
    try {
      setLoadingDetailed(true);
      const [bs, pl, cf] = await Promise.all([
        financeService.getBalanceSheet(detailFrom, detailTo),
        financeService.getProfitAndLoss(detailFrom, detailTo),
        financeService.getCashFlow(detailFrom, detailTo)
      ]);
      setBalanceSheet(bs);
      setProfitLoss(pl);
      setCashFlow(cf);
      toast({ title:'Detailed reports loaded'});
    } catch (e:any) {
      toast({ title:'Load failed', description:e.message || 'Error', variant:'destructive'});
    } finally { setLoadingDetailed(false); }
  };

  const exportDetailedReports = () => {
    if (!balanceSheet || !profitLoss || !cashFlow) {
      toast({ title:'No data', description:'Load detailed reports first', variant:'destructive'});
      return;
    }

    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      const detailedData = [
        // Balance Sheet
        { 'Report': 'Balance Sheet', 'Item': 'Total Assets', 'Amount': Number(balanceSheet.totalAssets || 0), 'Period': `${detailFrom} to ${detailTo}` },
        { 'Report': 'Balance Sheet', 'Item': 'Total Liabilities', 'Amount': Number(balanceSheet.totalLiabilities || 0), 'Period': `${detailFrom} to ${detailTo}` },
        { 'Report': 'Balance Sheet', 'Item': 'Equity', 'Amount': Number(balanceSheet.equity || 0), 'Period': `${detailFrom} to ${detailTo}` },
        
        // Empty row
        { 'Report': '', 'Item': '', 'Amount': '', 'Period': '' },
        
        // Profit & Loss
        { 'Report': 'Profit & Loss', 'Item': 'Total Income', 'Amount': Number(profitLoss.totalIncome || 0), 'Period': `${detailFrom} to ${detailTo}` },
        { 'Report': 'Profit & Loss', 'Item': 'Total Expenses', 'Amount': Number(profitLoss.totalExpenses || 0), 'Period': `${detailFrom} to ${detailTo}` },
        { 'Report': 'Profit & Loss', 'Item': 'Net Profit', 'Amount': Number(profitLoss.netProfit || 0), 'Period': `${detailFrom} to ${detailTo}` },
        
        // Empty row
        { 'Report': '', 'Item': '', 'Amount': '', 'Period': '' },
        
        // Cash Flow
        { 'Report': 'Cash Flow', 'Item': 'Cash Inflow', 'Amount': Number(cashFlow.inflow || 0), 'Period': `${detailFrom} to ${detailTo}` },
        { 'Report': 'Cash Flow', 'Item': 'Cash Outflow', 'Amount': Number(cashFlow.outflow || 0), 'Period': `${detailFrom} to ${detailTo}` },
        { 'Report': 'Cash Flow', 'Item': 'Net Cash', 'Amount': Number(cashFlow.netCash || 0), 'Period': `${detailFrom} to ${detailTo}` }
      ];

      const filename = `detailed-financial-reports-${currentDate}.csv`;
      exportToCSV(filename, detailedData);
      
      toast({ 
        title: 'Export Successful', 
        description: `Detailed reports exported as ${filename}` 
      });
    } catch (error) {
      toast({ 
        title: 'Export Failed', 
        description: 'Could not export detailed reports', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Generate and analyze financial performance</p>
        </div>
        <div className='flex gap-2 items-end flex-wrap'>
          <div className='flex flex-col'>
            <label className='text-xs text-muted-foreground'>Start Date</label>
            <Input type='date' value={startDate} onChange={e=> setStartDate(e.target.value)} />
          </div>
          <div className='flex flex-col'>
            <label className='text-xs text-muted-foreground'>End Date</label>
            <Input type='date' value={endDate} onChange={e=> setEndDate(e.target.value)} />
          </div>
          <Button variant='outline' onClick={handleRefresh}><RefreshCw className='h-4 w-4 mr-2'/>Refresh</Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90" 
            onClick={handleExport}
            disabled={loading}
          >
            <FileText className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Export CSV'}
          </Button>
        </div>
      </motion.div>

      {error && (
        <Card className='border-destructive'><CardContent className='p-4 text-destructive text-sm'>Failed to load one or more reports.</CardContent></Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="stat-card"><CardContent className="p-6"><div className='flex items-center justify-between'><div><p className='text-sm font-medium text-muted-foreground'>Total Revenue</p><p className='text-2xl font-bold'>{formatCurrency(totalRevenue)}</p></div><div className='p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600'><DollarSign className='h-6 w-6 text-white'/></div></div></CardContent></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="stat-card"><CardContent className="p-6"><div className='flex items-center justify-between'><div><p className='text-sm font-medium text-muted-foreground'>Total Expenses</p><p className='text-2xl font-bold'>{formatCurrency(totalExpenses)}</p></div><div className='p-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600'><BarChart3 className='h-6 w-6 text-white'/></div></div></CardContent></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className='flex items-center justify-between'>
                <div className='flex-1 pr-2'>
                  <p className='text-sm font-medium text-muted-foreground'>Net Profit/Loss</p>
                  <p className={`text-lg font-bold whitespace-nowrap ${net>=0?'text-green-600':'text-red-600'}`}>
                    {net>=0?'+':''}{formatCurrency(net)}
                  </p>
                </div>
                <div className={`p-3 rounded-full flex-shrink-0 ${net>=0?'bg-gradient-to-r from-green-500 to-emerald-600':'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                  <TrendingUp className='h-6 w-6 text-white'/>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="stat-card"><CardContent className="p-6"><div className='flex items-center justify-between'><div><p className='text-sm font-medium text-muted-foreground'>Paid Invoices</p><p className='text-2xl font-bold'>{summaryQuery.data?.paidInvoices ?? 0}</p></div><div className='p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600'><Calendar className='h-6 w-6 text-white'/></div></div></CardContent></Card>
        </motion.div>
      </div>

      {/* Detailed Reports Loader */}
      <Card>
        <CardHeader><CardTitle className='flex items-center gap-2'><Layers className='h-5 w-5'/>Detailed Financial Reports</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col md:flex-row gap-4 items-end'>
            <div className='flex flex-col'><label className='text-xs text-muted-foreground'>From</label><Input type='date' value={detailFrom} onChange={e=> setDetailFrom(e.target.value)} /></div>
            <div className='flex flex-col'><label className='text-xs text-muted-foreground'>To</label><Input type='date' value={detailTo} onChange={e=> setDetailTo(e.target.value)} /></div>
            <Button variant='outline' onClick={loadDetailed} disabled={loadingDetailed}>{loadingDetailed? 'Loading...':'Load Reports'}</Button>
            <Button 
              variant='outline' 
              onClick={exportDetailedReports} 
              disabled={!balanceSheet || !profitLoss || !cashFlow}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card className='border'><CardHeader><CardTitle className='text-sm'>Balance Sheet</CardTitle></CardHeader><CardContent className='space-y-1 text-sm'>
              {balanceSheet? <>
                <div>Total Assets: <strong>{formatCurrency(Number(balanceSheet.totalAssets||0))}</strong></div>
                <div>Total Liabilities: <strong>{formatCurrency(Number(balanceSheet.totalLiabilities||0))}</strong></div>
                <div>Equity: <strong>{formatCurrency(Number(balanceSheet.equity||0))}</strong></div>
              </>: <div className='text-muted-foreground text-xs'>No data loaded</div>}
            </CardContent></Card>
            <Card className='border'><CardHeader><CardTitle className='text-sm'>Profit & Loss</CardTitle></CardHeader><CardContent className='space-y-1 text-sm'>
              {profitLoss? <>
                <div>Total Income: <strong>{formatCurrency(Number(profitLoss.totalIncome||0))}</strong></div>
                <div>Total Expenses: <strong>{formatCurrency(Number(profitLoss.totalExpenses||0))}</strong></div>
                <div>Net Profit: <strong className={Number(profitLoss.netProfit||0)>=0?'text-green-600':'text-red-600'}>{formatCurrency(Number(profitLoss.netProfit||0))}</strong></div>
              </>: <div className='text-muted-foreground text-xs'>No data loaded</div>}
            </CardContent></Card>
            <Card className='border'><CardHeader><CardTitle className='text-sm'>Cash Flow</CardTitle></CardHeader><CardContent className='space-y-1 text-sm'>
              {cashFlow? <>
                <div>Inflow: <strong>{formatCurrency(Number(cashFlow.inflow||0))}</strong></div>
                <div>Outflow: <strong>{formatCurrency(Number(cashFlow.outflow||0))}</strong></div>
                <div>Net Cash: <strong className={Number(cashFlow.netCash||0)>=0?'text-green-600':'text-red-600'}>{formatCurrency(Number(cashFlow.netCash||0))}</strong></div>
              </>: <div className='text-muted-foreground text-xs'>No data loaded</div>}
            </CardContent></Card>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className='erp-card'>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='h-5 w-5'/>
                  Revenue Entries ({revenueQuery.data?.length||0})
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportRevenue}
                  disabled={loading || (revenueQuery.data?.length || 0) === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3 max-h-[360px] overflow-y-auto pr-1'>
                {loading && <p className='text-sm text-muted-foreground'>Loading...</p>}
                {!loading && (revenueQuery.data||[]).map(r=> (
                  <div key={(r.invoiceNumber||'INV') + r.date} className='p-3 rounded-lg bg-secondary flex justify-between'>
                    <div>
                      <p className='font-medium'>{r.invoiceNumber || 'Invoice'}</p>
                      <p className='text-xs text-muted-foreground'>{r.date}</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold text-green-600'>+{formatCurrency(Number(r.amount)||0)}</p>
                      <p className='text-xs text-muted-foreground'>{r.status}</p>
                    </div>
                  </div>
                ))}
                {!loading && (revenueQuery.data||[]).length===0 && <p className='text-xs text-muted-foreground'>No revenue records in range.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card className='erp-card'>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5'/>
                  Expense Entries ({expenseQuery.data?.length||0})
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportExpenses}
                  disabled={loading || (expenseQuery.data?.length || 0) === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3 max-h-[360px] overflow-y-auto pr-1'>
                {loading && <p className='text-sm text-muted-foreground'>Loading...</p>}
                {!loading && (expenseQuery.data||[]).map(e=> (
                  <div key={(e.title||'EXP') + e.date} className='p-3 rounded-lg bg-secondary flex justify-between'>
                    <div>
                      <p className='font-medium'>{e.title || 'Expense'}</p>
                      <p className='text-xs text-muted-foreground'>{e.date}</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold text-red-600'>-{formatCurrency(Number(e.amount)||0)}</p>
                      <p className='text-xs text-muted-foreground'>{e.category}</p>
                    </div>
                  </div>
                ))}
                {!loading && (expenseQuery.data||[]).length===0 && <p className='text-xs text-muted-foreground'>No expense records in range.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}