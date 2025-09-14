import { useEffect, useMemo, useRef, useState } from 'react';
import { hrService, formatCurrency } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, UserPlus, Eye, Trash2, RefreshCw, Save, X } from 'lucide-react';

interface EmployeeRow {
  id: string;
  internalId?: string;
  name: string;
  department: string;
  email: string;
  status: 'Active' | 'Inactive';
  phone: string;
  position: string;
  joinDate: string;
  salary: number;
}

const STATUS_CODES = ['ACTIVE','INACTIVE'] as const;
const CODE_REGEX = /^[a-f0-9]{16,}$/i;

export default function Employees() {
  const { toast } = useToast();

  // Data States
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [deptMap, setDeptMap] = useState<Record<string, string>>({});
  const [posMap, setPosMap] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState<EmployeeRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEmp, setNewEmp] = useState({ employeeId: '', firstName: '', lastName: '', email: '', department: '', position: '', salary: '0', joinDate: new Date().toISOString().split('T')[0], status: 'ACTIVE', phone: '' });

  // Caches to prevent re-fetching bad IDs
  const deptFetchCache = useRef<Set<string>>(new Set());
  const posFetchCache = useRef<Set<string>>(new Set());

  const mapEmployee = (e: any): EmployeeRow => {
    const first = e.firstName || '';
    const last = e.lastName || '';
    const deptVal = (e.department && (e.department.name || e.department.departmentName)) || e.departmentName || e.departmentId || e.department || 'Not Assigned';
    const posVal = (e.position && (e.position.title || e.position.name || e.position.positionName)) || e.positionName || e.positionId || e.position || 'Not Assigned';
    return {
      id: e.employeeId || e.id,
      internalId: e.id,
      name: `${first} ${last}`.trim() || e.name || 'Unknown',
      department: String(deptVal),
      email: e.email || 'N/A',
      status: (e.status === 'ACTIVE' || e.status === 'Active') ? 'Active' : 'Inactive',
      phone: e.phone || 'N/A',
      position: String(posVal),
      joinDate: e.joinDate || e.hireDate || 'N/A',
      salary: Number(e.salary) || 0,
    };
  };

  const loadMeta = async () => {
    try {
      const [deps, poss] = await Promise.all([
        hrService.getDepartments().catch(() => []),
        hrService.getPositions().catch(() => [])
      ]);
      const dM: Record<string, string> = {};
      (deps || []).forEach((d: any) => { const id = d.id || d.departmentId; const name = d.name || d.departmentName || id; if (id) { dM[id] = name; dM[name] = name; } });
      const pM: Record<string, string> = {};
      (poss || []).forEach((p: any) => { const id = p.id || p.positionId; const name = p.title || p.name || p.positionName || id; if (id) { pM[id] = name; pM[name] = name; } });
      setDeptMap(dM);
      setPosMap(pM);
      setDepartments(Array.from(new Set(Object.values(dM))).sort());
      setPositions(Array.from(new Set(Object.values(pM))).sort());
    } catch (e: any) {
      toast({ title: 'Metadata load failed', description: e.message || 'Error', variant: 'destructive' });
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await hrService.getEmployees();
      setEmployees(Array.isArray(data) ? data.map(mapEmployee) : []);
    } catch (e: any) {
      toast({ title: 'Employee load failed', description: e.message || 'Error', variant: 'destructive' });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const searchEmployees = async (term: string) => {
    if (term.trim().length < 3) { loadEmployees(); return; }
    try {
      setLoading(true);
      const res = await hrService.searchEmployees(term);
      setEmployees(res.map(mapEmployee));
    } catch {
      toast({ title: 'Search failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resolveUnknowns = async () => {
    const deptIds = Array.from(new Set(employees.filter(e => CODE_REGEX.test(e.department) && !deptMap[e.department] && !deptFetchCache.current.has(e.department)).map(e => e.department)));
    const posIds = Array.from(new Set(employees.filter(e => CODE_REGEX.test(e.position) && !posMap[e.position] && !posFetchCache.current.has(e.position)).map(e => e.position)));

    if (deptIds.length === 0 && posIds.length === 0) return;

    const deptPromises = deptIds.map(async id => {
      deptFetchCache.current.add(id);
      try {
        const dep = await hrService.getDepartmentById(id, true); // Suppress 404 errors
        if (dep) {
          const depId = dep.id || dep.departmentId || id;
          const name = dep.name || dep.departmentName || depId;
          return { [depId]: name };
        }
      } catch {}
      return null;
    });

    const posPromises = posIds.map(async id => {
      posFetchCache.current.add(id);
      try {
        const pos = await hrService.getPositionById(id, true); // Suppress 404 errors
        if (pos) {
          const posId = pos.id || pos.positionId || id;
          const name = pos.title || pos.name || pos.positionName || posId;
          return { [posId]: name };
        }
      } catch {}
      return null;
    });

    const [deptResults, posResults] = await Promise.all([
      Promise.all(deptPromises),
      Promise.all(posPromises)
    ]);

    const deptUpdates = Object.assign({}, ...deptResults.filter(Boolean));
    const posUpdates = Object.assign({}, ...posResults.filter(Boolean));

    if (Object.keys(deptUpdates).length > 0 || Object.keys(posUpdates).length > 0) {
      setDeptMap(prev => ({ ...prev, ...deptUpdates }));
      setPosMap(prev => ({ ...prev, ...posUpdates }));
    }
  };

  useEffect(() => { (async () => { await loadMeta(); await loadEmployees(); })(); }, []);
  useEffect(() => { const t = setTimeout(() => searchEmployees(search), 450); return () => clearTimeout(t); }, [search]);
  useEffect(() => { if (employees.length) resolveUnknowns(); }, [employees]);

  const filtered = useMemo(() => employees.filter(e => (deptFilter === 'all' || (deptMap[e.department] || e.department) === deptFilter) && (statusFilter === 'all' || e.status === statusFilter)), [employees, deptFilter, statusFilter, deptMap, posMap]);
  const uniqueDepartments = useMemo(() => Array.from(new Set(employees.map(e => deptMap[e.department] || e.department).filter(Boolean))).sort(), [employees, deptMap]);

  const refreshAll = async () => { setRefreshing(true); await loadMeta(); await loadEmployees(); setRefreshing(false); };

  const updateStatus = async (row: EmployeeRow, next: 'ACTIVE' | 'INACTIVE') => {
    try {
      setEmployees(list => list.map(e => e.id === row.id ? { ...e, status: next === 'ACTIVE' ? 'Active' : 'Inactive' } : e));
      if (row.internalId) await hrService.updateEmployeeStatus(row.internalId, next);
    } catch (e: any) {
      toast({ title: 'Status update failed', description: e.message || 'Error', variant: 'destructive' });
      refreshAll();
    }
  };

  const deleteEmployee = async (row: EmployeeRow) => {
    if (!row.internalId) return;
    if (!window.confirm('Delete employee?')) return;
    try {
      await hrService.deleteEmployee(row.internalId);
      setEmployees(list => list.filter(e => e.id !== row.id));
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message || 'Error', variant: 'destructive' });
    }
  };

  const openCreate = async () => {
    try {
      setCreating(true);
      const gen = await hrService.generateEmployeeId().catch(() => 'EMP-' + Date.now());
      setNewEmp(v => ({ ...v, employeeId: gen }));
    } catch {
      setNewEmp(v => ({ ...v, employeeId: 'EMP-' + Date.now() }));
    }
  };

  const saveNew = async () => {
    if (!newEmp.firstName || !newEmp.lastName || !newEmp.email) {
      toast({ title: 'Missing required fields', description: 'First Name, Last Name, and Email are required.', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      const payload = { ...newEmp, salary: Number(newEmp.salary) || 0 };
      await hrService.createEmployee(payload);
      toast({ title: 'Employee Created' });
      setCreating(false);
      setNewEmp({ employeeId: '', firstName: '', lastName: '', email: '', department: '', position: '', salary: '0', joinDate: new Date().toISOString().split('T')[0], status: 'ACTIVE', phone: '' });
      refreshAll();
    } catch (e: any) {
      toast({ title: 'Create failed', description: e.message || 'Error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const showDept = (val: string) => deptMap[val] || (CODE_REGEX.test(val) ? 'Resolving...' : val);
  const showPos = (val: string) => posMap[val] || (CODE_REGEX.test(val) ? 'Resolving...' : val);

  if (loading) return <div className='flex items-center justify-center min-h-[400px] gap-2'><Loader2 className='h-6 w-6 animate-spin' /><span>Loading employees...</span></div>;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Employees</h1>
          <p className='text-muted-foreground'>Manage employee records</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={openCreate}><UserPlus className='h-4 w-4 mr-2' />Add</Button>
          <Button variant='outline' onClick={refreshAll} disabled={refreshing}><RefreshCw className={'h-4 w-4 mr-2 ' + (refreshing ? 'animate-spin' : '')} />Refresh</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Search by name or email (min 3 chars) and filter by department or status.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='relative md:col-span-2'>
              <Search className='h-4 w-4 absolute left-2 top-2.5 text-muted-foreground' />
              <Input className='pl-8' placeholder='Search employees...' value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger><SelectValue placeholder='Department' /></SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Departments</SelectItem>
                {uniqueDepartments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder='Status' /></SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='Active'>Active</SelectItem>
                <SelectItem value='Inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='text-xs text-muted-foreground'>Showing {filtered.length} of {employees.length} employees.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Employee Directory</CardTitle></CardHeader>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className='font-medium'>{emp.name}</div>
                    <div className='text-xs text-muted-foreground'>{emp.email}</div>
                    <div className='text-[10px] text-muted-foreground'>{emp.id}</div>
                  </TableCell>
                  <TableCell className='text-xs'>{showDept(emp.department)}</TableCell>
                  <TableCell className='text-xs'>{showPos(emp.position)}</TableCell>
                  <TableCell className='text-xs'>{formatCurrency(emp.salary)}</TableCell>
                  <TableCell className='text-xs'>{emp.joinDate}</TableCell>
                  <TableCell className='text-xs'>
                    <Select value={emp.status === 'Active' ? 'ACTIVE' : 'INACTIVE'} onValueChange={v => updateStatus(emp, v as 'ACTIVE' | 'INACTIVE')}>
                      <SelectTrigger className='w-28 h-8 text-xs'><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS_CODES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex gap-2 justify-end'>
                      <Button size='sm' variant='outline' onClick={() => setViewing(emp)}><Eye className='h-4 w-4' /></Button>
                      <Button size='sm' variant='outline' onClick={() => deleteEmployee(emp)}><Trash2 className='h-4 w-4 text-red-500' /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>No employees found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewing} onOpenChange={o => !o && setViewing(null)}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>Basic information</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div><span className='text-xs text-muted-foreground'>ID</span><div className='mt-1'>{viewing.id}</div></div>
              <div><span className='text-xs text-muted-foreground'>Name</span><div className='mt-1'>{viewing.name}</div></div>
              <div><span className='text-xs text-muted-foreground'>Email</span><div className='mt-1 break-all'>{viewing.email}</div></div>
              <div><span className='text-xs text-muted-foreground'>Phone</span><div className='mt-1'>{viewing.phone}</div></div>
              <div><span className='text-xs text-muted-foreground'>Department</span><div className='mt-1'>{showDept(viewing.department)}</div></div>
              <div><span className='text-xs text-muted-foreground'>Position</span><div className='mt-1'>{showPos(viewing.position)}</div></div>
              <div><span className='text-xs text-muted-foreground'>Join Date</span><div className='mt-1'>{viewing.joinDate}</div></div>
              <div><span className='text-xs text-muted-foreground'>Status</span><div className='mt-1'><Badge variant={viewing.status === 'Active' ? 'default' : 'secondary'}>{viewing.status}</Badge></div></div>
              <div className='col-span-2'><span className='text-xs text-muted-foreground'>Salary</span><div className='mt-1 font-semibold'>{formatCurrency(viewing.salary)}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={creating} onOpenChange={o => !o && setCreating(false)}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>New Employee</DialogTitle>
            <DialogDescription>Create a new record</DialogDescription>
          </DialogHeader>
          <div className='grid gap-3 text-sm max-h-[60vh] overflow-y-auto pr-1'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'><label className='text-xs font-medium'>Employee ID</label><Input value={newEmp.employeeId} disabled className='bg-muted' /></div>
              <div className='space-y-1'><label className='text-xs font-medium'>Join Date</label><Input type='date' value={newEmp.joinDate} onChange={e => setNewEmp(v => ({ ...v, joinDate: e.target.value }))} /></div>
              <div className='space-y-1'><label className='text-xs font-medium'>First Name *</label><Input value={newEmp.firstName} onChange={e => setNewEmp(v => ({ ...v, firstName: e.target.value }))} /></div>
              <div className='space-y-1'><label className='text-xs font-medium'>Last Name *</label><Input value={newEmp.lastName} onChange={e => setNewEmp(v => ({ ...v, lastName: e.target.value }))} /></div>
              <div className='space-y-1 col-span-2'><label className='text-xs font-medium'>Email *</label><Input type='email' value={newEmp.email} onChange={e => setNewEmp(v => ({ ...v, email: e.target.value }))} /></div>
              <div className='space-y-1'><label className='text-xs font-medium'>Department</label><Select value={newEmp.department} onValueChange={val => setNewEmp(v => ({ ...v, department: val }))}><SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className='space-y-1'><label className='text-xs font-medium'>Position</label><Select value={newEmp.position} onValueChange={val => setNewEmp(v => ({ ...v, position: val }))}><SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger><SelectContent>{positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
              <div className='space-y-1'><label className='text-xs font-medium'>Salary</label><Input type='number' value={newEmp.salary} onChange={e => setNewEmp(v => ({ ...v, salary: e.target.value }))} /></div>
              <div className='space-y-1'><label className='text-xs font-medium'>Phone</label><Input value={newEmp.phone} onChange={e => setNewEmp(v => ({ ...v, phone: e.target.value }))} /></div>
              <div className='space-y-1'><label className='text-xs font-medium'>Status</label><Select value={newEmp.status} onValueChange={val => setNewEmp(v => ({ ...v, status: val }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_CODES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' onClick={() => setCreating(false)}><X className='h-4 w-4 mr-1' />Cancel</Button>
            <Button onClick={saveNew} disabled={saving}><Save className='h-4 w-4 mr-1' />{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
