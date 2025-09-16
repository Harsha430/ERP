import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Banknote, Download, Receipt, Plus, RefreshCw, Search, Filter, Calendar, Users, TrendingUp, DollarSign, IndianRupee } from 'lucide-react';
import { financeService, hrService, formatCurrency } from '@/services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { exportToCSV } from '@/lib/exportUtil';

export default function Payroll() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [payslipDialogOpen, setPayslipDialogOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [form, setForm] = useState({ 
    employeeId: '', 
    employeeName: '', 
    grossSalary: '', 
    payDate: new Date().toISOString().split('T')[0],
    status: 'PAID'
  });

  const employeesQuery = useQuery({ 
    queryKey: ['employees-basic'], 
    queryFn: () => hrService.getEmployees() 
  });
  
  const payrollQuery = useQuery({ 
    queryKey: ['payroll'], 
    queryFn: () => financeService.getPayrollEntries() 
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => financeService.createPayrollEntry({
      employeeId: Number(payload.employeeId),
      employeeName: payload.employeeName,
      grossSalary: Number(payload.grossSalary),
      payDate: payload.payDate,
      status: payload.status
    }),
    onMutate: async (payload: any) => {
      await qc.cancelQueries({ queryKey: ['payroll'] });
      const prev = qc.getQueryData<any[]>(['payroll']);
      const optimistic = {
        id: Date.now(),
        employeeId: Number(payload.employeeId),
        employeeName: payload.employeeName,
        grossSalary: Number(payload.grossSalary),
        deductions: Number(payload.grossSalary) * 0.22,
        netSalary: Number(payload.grossSalary) * 0.78,
        payDate: payload.payDate,
        status: payload.status
      };
      qc.setQueryData<any[]>(['payroll'], (old = []) => [optimistic, ...old]);
      return { prev };
    },
    onError: (_e, _v, ctx: any) => { 
      if (ctx?.prev) qc.setQueryData(['payroll'], ctx.prev); 
      toast({ title: 'Failed', description: 'Could not create payroll entry', variant: 'destructive' }); 
    },
    onSuccess: () => { 
      toast({ title: 'Success', description: 'Payroll entry created successfully' }); 
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['payroll'] })
  });

  // Computed statistics
  const payrollStats = useMemo(() => {
    const payroll = payrollQuery.data || [];
    const totalGross = payroll.reduce((sum: number, p: any) => sum + Number(p.grossSalary || 0), 0);
    const totalNet = payroll.reduce((sum: number, p: any) => sum + Number(p.netSalary || 0), 0);
    const totalDeductions = payroll.reduce((sum: number, p: any) => sum + Number(p.deductions || 0), 0);
    const avgSalary = payroll.length > 0 ? totalGross / payroll.length : 0;
    const paidCount = payroll.filter((p: any) => p.status === 'PAID').length;
    const pendingCount = payroll.filter((p: any) => p.status === 'PENDING').length;

    return {
      totalGross,
      totalNet,
      totalDeductions,
      avgSalary,
      totalEntries: payroll.length,
      paidCount,
      pendingCount
    };
  }, [payrollQuery.data]);

  // Filtered payroll data
  const filteredPayroll = useMemo(() => {
    const payroll = payrollQuery.data || [];
    return payroll.filter((p: any) => {
      const matchesSearch = !searchTerm || 
        p.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employeeId?.toString().includes(searchTerm) ||
        p.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesMonth = monthFilter === 'all' || p.payDate?.startsWith(monthFilter);
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [payrollQuery.data, searchTerm, statusFilter, monthFilter]);

  const submit = () => {
    if (!form.employeeId || !form.grossSalary) { 
      toast({ title: 'Validation Error', description: 'Employee and gross salary are required', variant: 'destructive' }); 
      return; 
    }
    const emp = (employeesQuery.data || []).find((e: any) => e.id == form.employeeId);
    createMutation.mutate({ 
      ...form, 
      employeeName: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : form.employeeName 
    });
    setOpen(false);
    setForm({ 
      employeeId: '', 
      employeeName: '', 
      grossSalary: '', 
      payDate: new Date().toISOString().split('T')[0],
      status: 'PAID'
    });
  };

  const exportPayroll = () => {
    const exportData = filteredPayroll.map((p: any) => ({
      'Employee ID': p.employeeCode || (() => {
        const emp = (employeesQuery.data || []).find((e: any) => e.id == p.employeeId);
        return emp ? emp.employeeId : p.employeeId;
      })(),
      'Employee Name': p.employeeName || '—',
      'Gross Salary': p.grossSalary,
      'Deductions': p.deductions,
      'Net Salary': p.netSalary,
      'Pay Date': p.payDate,
      'Status': p.status
    }));
    exportToCSV('payroll-export.csv', exportData);
    toast({ title: 'Export Successful', description: 'Payroll data exported to CSV' });
  };

  const openPayslip = (payrollEntry: any) => {
    setSelectedPayslip(payrollEntry);
    setPayslipDialogOpen(true);
  };

  const downloadPayslip = () => {
    if (!selectedPayslip) return;
    
    // Create a simple HTML payslip content
    const payslipContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Payslip - ${selectedPayslip.employeeName}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .section { margin: 20px 0; }
              .row { display: flex; justify-content: space-between; margin: 5px 0; }
              .total { font-weight: bold; border-top: 1px solid #333; padding-top: 10px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>ERP SYSTEM</h1>
              <h2>PAYSLIP</h2>
              <p>Pay Period: ${selectedPayslip.payDate}</p>
          </div>
          
          <div class="section">
              <h3>Employee Details</h3>
              <div class="row"><span>Employee ID:</span><span>${selectedPayslip.employeeCode || (() => {
                const emp = (employeesQuery.data || []).find((e: any) => e.id == selectedPayslip.employeeId);
                return emp ? emp.employeeId : selectedPayslip.employeeId;
              })()}</span></div>
              <div class="row"><span>Employee Name:</span><span>${selectedPayslip.employeeName}</span></div>
              <div class="row"><span>Pay Date:</span><span>${selectedPayslip.payDate}</span></div>
          </div>
          
          <div class="section">
              <h3>Earnings</h3>
              <div class="row"><span>Gross Salary:</span><span>${formatCurrency(Number(selectedPayslip.grossSalary || 0))}</span></div>
              <div class="row total"><span>Total Earnings:</span><span>${formatCurrency(Number(selectedPayslip.grossSalary || 0))}</span></div>
          </div>
          
          <div class="section">
              <h3>Deductions</h3>
              <div class="row"><span>Tax & Other Deductions:</span><span>${formatCurrency(Number(selectedPayslip.deductions || 0))}</span></div>
              <div class="row total"><span>Total Deductions:</span><span>${formatCurrency(Number(selectedPayslip.deductions || 0))}</span></div>
          </div>
          
          <div class="section total">
              <div class="row"><span><strong>NET SALARY:</strong></span><span><strong>${formatCurrency(Number(selectedPayslip.netSalary || 0))}</strong></span></div>
          </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([payslipContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${selectedPayslip.employeeCode || (() => {
      const emp = (employeesQuery.data || []).find((e: any) => e.id == selectedPayslip.employeeId);
      return emp ? emp.employeeId : selectedPayslip.employeeId;
    })()}-${selectedPayslip.payDate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: 'Download Started', description: 'Payslip downloaded successfully' });
  };

  const loading = payrollQuery.isLoading || employeesQuery.isLoading;

  if (loading) return <div className='flex items-center justify-center min-h-[300px] gap-2'><RefreshCw className='h-5 w-5 animate-spin'/><span>Loading payroll...</span></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Process salaries and generate payslips</p>
        </div>
        <div className='flex gap-2'>
          <Button 
            variant='outline' 
            disabled={isRefreshing}
            onClick={async () => {
              setIsRefreshing(true);
              try {
                // Add minimum delay to show animation
                const [refreshResult] = await Promise.all([
                  Promise.all([
                    qc.refetchQueries({ queryKey: ['payroll'] }),
                    qc.refetchQueries({ queryKey: ['employees-basic'] })
                  ]),
                  new Promise(resolve => setTimeout(resolve, 1500)) // Minimum 1.5 second delay to see animation
                ]);
                toast({ title: 'Refreshed', description: 'Payroll data has been refreshed successfully' });
              } catch (error) {
                toast({ title: 'Error', description: 'Failed to refresh payroll data', variant: 'destructive' });
              } finally {
                setIsRefreshing(false);
              }
            }}
          >
            <RefreshCw className={`h-4 w-4 mr-2 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className='bg-gradient-primary hover:opacity-90'><Plus className='h-4 w-4 mr-2'/>Add Entry</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[520px]'>
              <DialogHeader><DialogTitle>New Payroll Entry</DialogTitle></DialogHeader>
              <div className='space-y-4 py-2'>
                <div className='space-y-1'>
                  <Label>Employee *</Label>
                  <Select value={form.employeeId} onValueChange={(v) => setForm(f => ({ ...f, employeeId: v }))}>
                    <SelectTrigger><SelectValue placeholder='Select employee' /></SelectTrigger>
                    <SelectContent>
                      {(employeesQuery.data || []).map((e: any) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {(e.firstName || '') + ' ' + (e.lastName || '')} ({e.employeeId || e.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <Label>Gross Salary (INR) *</Label>
                    <Input 
                      type='number' 
                      value={form.grossSalary} 
                      onChange={e => setForm(f => ({ ...f, grossSalary: e.target.value }))} 
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label>Pay Date</Label>
                    <Input 
                      type='date' 
                      value={form.payDate} 
                      onChange={e => setForm(f => ({ ...f, payDate: e.target.value }))} 
                    />
                  </div>
                </div>
                <div className='space-y-1'>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID">PAID</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.grossSalary && (
                  <div className='p-3 bg-muted rounded-md text-xs space-y-1'>
                    <p>Estimated Deductions (22%): {formatCurrency(Number(form.grossSalary) * 0.22)}</p>
                    <p>Estimated Net: {formatCurrency(Number(form.grossSalary) * 0.78)}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant='outline' onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant='outline' onClick={exportPayroll}>
            <Download className='h-4 w-4 mr-2' />
            Export Payroll
          </Button>
        </div>
      </motion.div>

      {/* Payroll Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="erp-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Gross</p>
                  <p className="text-2xl font-bold text-blue-600">₹{payrollStats.totalGross.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground h-4">&nbsp;</p>
                </div>
                <IndianRupee className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="erp-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Net</p>
                  <p className="text-2xl font-bold text-green-600">₹{payrollStats.totalNet.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground h-4">&nbsp;</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />

              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="erp-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Salary</p>
                  <p className="text-2xl font-bold text-purple-600">₹{payrollStats.avgSalary.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground h-4">&nbsp;</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="erp-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold text-orange-600">{payrollStats.totalEntries}</p>
                  <p className="text-xs text-muted-foreground">
                    {payrollStats.paidCount} paid, {payrollStats.pendingCount} pending
                  </p>
                </div>
                <IndianRupee className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PAID">PAID</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="2024-01">January 2024</SelectItem>
                    <SelectItem value="2024-02">February 2024</SelectItem>
                    <SelectItem value="2024-03">March 2024</SelectItem>
                    <SelectItem value="2024-04">April 2024</SelectItem>
                    <SelectItem value="2024-05">May 2024</SelectItem>
                    <SelectItem value="2024-06">June 2024</SelectItem>
                    <SelectItem value="2024-07">July 2024</SelectItem>
                    <SelectItem value="2024-08">August 2024</SelectItem>
                    <SelectItem value="2024-09">September 2024</SelectItem>
                    <SelectItem value="2024-10">October 2024</SelectItem>
                    <SelectItem value="2024-11">November 2024</SelectItem>
                    <SelectItem value="2024-12">December 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Results</Label>
                <div className="flex items-center h-10 px-3 border border-input rounded-md bg-muted">
                  <span className="text-sm">{filteredPayroll.length} entries</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payroll Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Payroll Entries ({filteredPayroll.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayroll.map((record: any, index: number) => (
                  <motion.tr 
                    key={record.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.03 }} 
                    className="hover:bg-secondary"
                  >
                    <TableCell className="font-medium">
                      {record.employeeCode || (() => {
                        const emp = (employeesQuery.data || []).find((e: any) => e.id == record.employeeId);
                        return emp ? emp.employeeId : record.employeeId;
                      })()}
                    </TableCell>
                    <TableCell>{record.employeeName || '—'}</TableCell>
                    <TableCell>{formatCurrency(Number(record.grossSalary || 0))}</TableCell>
                    <TableCell className="text-red-600">-{formatCurrency(Number(record.deductions || 0))}</TableCell>
                    <TableCell className="font-bold text-green-600">{formatCurrency(Number(record.netSalary || 0))}</TableCell>
                    <TableCell>{record.payDate}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'PAID' ? 'default' : 'destructive'}>
                        {record.status || 'PAID'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openPayslip(record)}>
                        <IndianRupee className="h-8 w-8 text-purple-500" />
                        Payslip
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
                {filteredPayroll.length === 0 && (
                  <tr>
                    <TableCell colSpan={8} className='text-center text-sm text-muted-foreground py-6'>
                      No payroll entries found.
                    </TableCell>
                  </tr>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payslip Dialog */}
      <Dialog open={payslipDialogOpen} onOpenChange={setPayslipDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-purple-500" />
              Payslip - {selectedPayslip?.employeeName || selectedPayslip?.employeeCode}
            </DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b">
                <h2 className="text-lg font-bold">ERP SYSTEM</h2>
                <p className="text-sm text-muted-foreground">PAYSLIP</p>
                <p className="text-sm">Pay Period: {selectedPayslip.payDate}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Employee Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Employee ID:</span>
                      <span>{selectedPayslip.employeeCode || (() => {
                        const emp = (employeesQuery.data || []).find((e: any) => e.id == selectedPayslip.employeeId);
                        return emp ? emp.employeeId : selectedPayslip.employeeId;
                      })()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employee Name:</span>
                      <span>{selectedPayslip.employeeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pay Date:</span>
                      <span>{selectedPayslip.payDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={selectedPayslip.status === 'PAID' ? 'default' : 'destructive'}>
                        {selectedPayslip.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Salary Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Salary:</span>
                      <span>{formatCurrency(Number(selectedPayslip.grossSalary || 0))}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Deductions:</span>
                      <span>-{formatCurrency(Number(selectedPayslip.deductions || 0))}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-green-600 text-lg">
                      <span>Net Salary:</span>
                      <span>{formatCurrency(Number(selectedPayslip.netSalary || 0))}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setPayslipDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={downloadPayslip}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}