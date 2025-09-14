import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Banknote, Download, Receipt, Plus } from 'lucide-react';
import { financeService, hrService, formatCurrency } from '@/services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function Payroll() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId:'', employeeName:'', grossSalary:'', payDate: new Date().toISOString().split('T')[0] });

  const employeesQuery = useQuery({ queryKey:['employees-basic'], queryFn: () => hrService.getEmployees() });
  const payrollQuery = useQuery({ queryKey:['payroll'], queryFn: () => financeService.getPayrollEntries() });

  const createMutation = useMutation({
    mutationFn: (payload:any)=> financeService.createPayrollEntry({
      employeeId: Number(payload.employeeId),
      employeeName: payload.employeeName,
      grossSalary: Number(payload.grossSalary),
      payDate: payload.payDate
    }),
    onMutate: async (payload:any) => {
      await qc.cancelQueries({ queryKey:['payroll'] });
      const prev = qc.getQueryData<any[]>(['payroll']);
      const optimistic = {
        id: Date.now(),
        employeeId: Number(payload.employeeId),
        employeeName: payload.employeeName,
        grossSalary: Number(payload.grossSalary),
        deductions: Number(payload.grossSalary)*0.22,
        netSalary: Number(payload.grossSalary)*0.78,
        payDate: payload.payDate,
        status: 'PAID'
      };
      qc.setQueryData<any[]>(['payroll'], (old=[]) => [optimistic, ...old]);
      return { prev };
    },
    onError: (_e,_v,ctx:any)=> { if(ctx?.prev) qc.setQueryData(['payroll'], ctx.prev); toast({ title:'Failed', description:'Could not create payroll entry', variant:'destructive'}); },
    onSuccess: ()=> { toast({ title:'Payroll entry created' }); },
    onSettled: ()=> qc.invalidateQueries({ queryKey:['payroll'] })
  });

  const submit = () => {
    if (!form.employeeId || !form.grossSalary) { toast({ title:'Missing fields', description:'Employee & gross salary required', variant:'destructive'}); return; }
    const emp = (employeesQuery.data||[]).find((e:any)=> (e.employeeId||e.id) == form.employeeId);
    createMutation.mutate({ ...form, employeeName: emp ? `${emp.firstName||''} ${emp.lastName||''}`.trim() : form.employeeName });
    setOpen(false);
    setForm({ employeeId:'', employeeName:'', grossSalary:'', payDate: new Date().toISOString().split('T')[0] });
  };

  const loading = payrollQuery.isLoading || employeesQuery.isLoading;
  const payroll = payrollQuery.data || [];

  if (loading) return <div className='flex items-center justify-center min-h-[300px] gap-2'><span className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full'/>Loading payroll...</div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Process salaries and generate payslips</p>
        </div>
        <div className='flex gap-2'>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className='bg-gradient-primary hover:opacity-90'><Plus className='h-4 w-4 mr-2'/>Add Entry</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[520px]'>
              <DialogHeader><DialogTitle>New Payroll Entry</DialogTitle></DialogHeader>
              <div className='space-y-4 py-2'>
                <div className='space-y-1'>
                  <Label>Employee *</Label>
                  <Select value={form.employeeId} onValueChange={(v)=> setForm(f=> ({...f, employeeId:v}))}>
                    <SelectTrigger><SelectValue placeholder='Select employee' /></SelectTrigger>
                    <SelectContent>
                      {(employeesQuery.data||[]).map((e:any)=> (
                        <SelectItem key={e.employeeId||e.id} value={String(e.employeeId||e.id)}>
                          {(e.firstName||'') + ' ' + (e.lastName||'')} ({e.employeeId||e.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1'><Label>Gross Salary (INR) *</Label><Input type='number' value={form.grossSalary} onChange={e=> setForm(f=> ({...f, grossSalary:e.target.value}))} /></div>
                  <div className='space-y-1'><Label>Pay Date</Label><Input type='date' value={form.payDate} onChange={e=> setForm(f=> ({...f, payDate:e.target.value}))} /></div>
                </div>
                {form.grossSalary && (
                  <div className='p-3 bg-muted rounded-md text-xs space-y-1'>
                    <p>Estimated Deductions (22%): {formatCurrency(Number(form.grossSalary)*0.22)}</p>
                    <p>Estimated Net: {formatCurrency(Number(form.grossSalary)*0.78)}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant='outline' onClick={()=> setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={createMutation.isLoading}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export Payroll
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Current Payroll ({payroll.length})
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
                {payroll.map((record:any, index:number) => (
                  <motion.tr key={record.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-secondary">
                    <TableCell className="font-medium">{record.employeeId}</TableCell>
                    <TableCell>{record.employeeName || '—'}</TableCell>
                    <TableCell>{formatCurrency(Number(record.grossSalary||0))}</TableCell>
                    <TableCell className="text-red-600">-{formatCurrency(Number(record.deductions||0))}</TableCell>
                    <TableCell className="font-bold text-green-600">{formatCurrency(Number(record.netSalary||0))}</TableCell>
                    <TableCell>{record.payDate}</TableCell>
                    <TableCell><span className='text-xs px-2 py-1 rounded-full bg-green-100 text-green-700'>{(record.status||'PAID')}</span></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Receipt className="h-4 w-4 mr-1" />
                        Payslip
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
                {payroll.length===0 && (
                  <tr><TableCell colSpan={8} className='text-center text-sm text-muted-foreground py-6'>No payroll entries yet.</TableCell></tr>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {payroll[0] && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="erp-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Sample Payslip - {payroll[0]?.employeeName || payroll[0]?.employeeId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Earnings</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Gross Salary</span><span>{formatCurrency(Number(payroll[0]?.grossSalary||0))}</span></div>
                    <div className="flex justify-between"><span>Pay Date</span><span>{payroll[0]?.payDate}</span></div>
                    <hr />
                    <div className="flex justify-between font-semibold"><span>Net (Est)</span><span>{formatCurrency(Number(payroll[0]?.netSalary||0))}</span></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Deductions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Deductions</span><span className='text-red-600'>-{formatCurrency(Number(payroll[0]?.deductions||0))}</span></div>
                    <hr />
                    <div className="flex justify-between font-semibold text-green-600"><span>Net Salary</span><span>{formatCurrency(Number(payroll[0]?.netSalary||0))}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}