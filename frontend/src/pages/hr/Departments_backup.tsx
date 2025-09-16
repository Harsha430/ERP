// Department Management Page
import { useEffect, useState, useMemo } from 'react';
import { hrService } from '@/services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, RefreshCw, Search, Edit2, X, Save, Layers, Power, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtil';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface Department {
  id?: string;
  name: string;
  description?: string;
  headEmployeeId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
interface EmployeeMinimal { id?: string; employeeId?: string; name?: string; fullName?: string; }

export default function Departments() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form, setForm] = useState<Department>({ name:'', description:'', headEmployeeId:'', isActive:true });
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState<EmployeeMinimal[]>([]);

  useEffect(()=> { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [deptData, empData] = await Promise.all([
        hrService.getDepartments(),
        hrService.getEmployees().catch(()=> [])
      ]);
      setDepartments(deptData);
      setEmployees(empData);
    } catch (e:any) {
      toast({ title:'Load failed', description:e.message||'Error', variant:'destructive'});
    } finally { setLoading(false); }
  };

  const search = async (term:string) => {
    if (!term) { fetchAll(); return; }
    if (term.length < 2) return;
    try {
      const res = await hrService.searchDepartments(term);
      setDepartments(res);
    } catch {}
  };

  useEffect(()=> { const t=setTimeout(()=> search(searchTerm), 400); return ()=> clearTimeout(t); }, [searchTerm]);

  const openCreate = () => { setForm({ name:'', description:'', headEmployeeId:'', isActive:true }); setEditingDept(null); setCreating(true); };
  const openEdit = (dept:Department) => { setForm({ ...dept }); setEditingDept(dept); setCreating(true); };

  const save = async () => {
    if (!form.name.trim()) { toast({ title:'Name required', variant:'destructive'}); return; }
    try {
      setSaving(true);
      if (editingDept && editingDept.id) {
        await hrService.updateDepartment(editingDept.id, form);
        toast({ title:'Department updated'});
      } else {
        await hrService.createDepartment(form);
        toast({ title:'Department created'});
      }
      setCreating(false);
      fetchAll();
    } catch (e:any) { toast({ title:'Save failed', description:e.message||'Error', variant:'destructive'}); }
    finally { setSaving(false); }
  };

  const toggleActive = async (dept:Department) => {
    if (!dept.id) return;
    try {
      if (dept.isActive) await hrService.deactivateDepartment(dept.id); else await hrService.activateDepartment(dept.id);
      setDepartments(list=> list.map(d=> d.id===dept.id? {...d, isActive: !dept.isActive}: d));
    } catch (e:any) { toast({ title:'Status change failed', description:e.message||'Error', variant:'destructive'}); }
  };

  const remove = async (dept:Department) => {
    if (!dept.id) return;
    if (!window.confirm('Delete department?')) return;
    try {
      await hrService.deleteDepartment(dept.id);
      setDepartments(list=> list.filter(d=> d.id!==dept.id));
      toast({ title:'Deleted'});
    } catch (e:any) { toast({ title:'Delete failed', description:e.message||'Error', variant:'destructive'}); }
  };

  const exportCSV = () => {
    exportToCSV('departments.csv', departments.map(d=> ({ id:d.id, name:d.name, description:d.description, headEmployeeId:d.headEmployeeId, active:d.isActive, createdAt:d.createdAt })) );
  };

  const activeCount = useMemo(()=> departments.filter(d=> d.isActive).length, [departments]);

  const refresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  const getHeadName = (id?: string) => {
    if (!id) return '-';
    const emp = employees.find(e=> e.id===id || e.employeeId===id);
    return emp?.name || emp?.fullName || id;
  };

  if (loading) return <div className='flex items-center justify-center min-h-[300px] gap-2'><RefreshCw className='h-5 w-5 animate-spin'/><span>Loading departments...</span></div>;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'><Layers className='h-7 w-7'/>Departments</h1>
          <p className='text-muted-foreground'>Manage company departments</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={exportCSV}><Download className='h-4 w-4 mr-2'/>Export</Button>
          <Button variant='outline' onClick={refresh} disabled={refreshing}><RefreshCw className={'h-4 w-4 mr-2 '+(refreshing?'animate-spin':'')}/>Refresh</Button>
          <Button onClick={openCreate}><Plus className='h-4 w-4 mr-2'/>New</Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card><CardHeader><CardTitle className='text-sm'>Total</CardTitle></CardHeader><CardContent><p className='text-2xl font-bold'>{departments.length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className='text-sm'>Active</CardTitle></CardHeader><CardContent><p className='text-2xl font-bold text-green-600'>{activeCount}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className='text-sm'>Inactive</CardTitle></CardHeader><CardContent><p className='text-2xl font-bold text-red-600'>{departments.length-activeCount}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Search</CardTitle></CardHeader>
        <CardContent>
          <div className='relative'>
            <Search className='h-4 w-4 absolute left-2 top-2.5 text-muted-foreground'/>
            <Input className='pl-8' placeholder='Search departments (min 2 chars)...' value={searchTerm} onChange={e=> setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Department List</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map(d=> (
                <TableRow key={d.id||d.name}>
                  <TableCell>
                    <div className='font-medium'>{d.name}</div>
                    <div className='text-xs text-muted-foreground max-w-[240px] truncate'>{d.description}</div>
                  </TableCell>
                  <TableCell className='text-xs'>{getHeadName(d.headEmployeeId)}</TableCell>
                  <TableCell>{d.isActive? <Badge className='status-approved'>Active</Badge>: <Badge variant='secondary'>Inactive</Badge>}</TableCell>
                  <TableCell className='text-xs'>{d.createdAt? String(d.createdAt).split('T')[0]: '-'}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button size='sm' variant='outline' onClick={()=> toggleActive(d)}>
                        <Power className='h-4 w-4 mr-1'/>{d.isActive? 'Disable':'Enable'}
                      </Button>
                      <Button size='sm' variant='outline' onClick={()=> openEdit(d)}><Edit2 className='h-4 w-4'/></Button>
                      <Button size='sm' variant='outline' onClick={()=> remove(d)}><X className='h-4 w-4 text-red-500'/></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {departments.length===0 && <TableRow><TableCell colSpan={5} className='text-center py-6 text-muted-foreground'>No departments found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader><DialogTitle>{editingDept? 'Edit Department':'New Department'}</DialogTitle></DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-1'>
              <label className='text-xs font-medium'>Name *</label>
              <Input value={form.name} onChange={e=> setForm(f=> ({...f, name:e.target.value}))} />
            </div>
            <div className='space-y-1'>
              <label className='text-xs font-medium'>Description</label>
              <Input value={form.description} onChange={e=> setForm(f=> ({...f, description:e.target.value}))} />
            </div>
            <div className='space-y-1'>
              <label className='text-xs font-medium'>Head</label>
              <Select value={form.headEmployeeId||''} onValueChange={v=> setForm(f=> ({...f, headEmployeeId:v}))}>
                <SelectTrigger><SelectValue placeholder='Select head employee'/></SelectTrigger>
                <SelectContent>
                  {employees.map(emp=> <SelectItem key={emp.id||emp.employeeId} value={String(emp.id||emp.employeeId)}>{emp.name||emp.fullName||emp.employeeId}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={()=> setCreating(false)}><X className='h-4 w-4 mr-1'/>Cancel</Button>
            <Button onClick={save} disabled={saving}><Save className='h-4 w-4 mr-1'/>{saving? 'Saving...':'Save'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
