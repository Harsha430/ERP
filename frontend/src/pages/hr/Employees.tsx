import { useState, useEffect, useMemo } from 'react';
import { employees as mockEmployees } from '@/data/mockData';
import { hrService, formatCurrency } from '@/services/apiService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, UserPlus, Edit2, Eye, Trash2, RefreshCw, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmployeeRow {
  id: string;            // internal id or employeeId fallback
  internalId?: string;   // actual backend id if available
  name: string;
  department: string;
  email: string;
  status: 'Active' | 'Inactive';
  phone: string;
  position: string;
  joinDate: string;
  salary: number;
}

const STATUS_OPTIONS = ['ACTIVE','INACTIVE'];

export default function Employees() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [newEmployee, setNewEmployee] = useState<{employeeId:string; firstName:string; lastName:string; email:string; department:string; position:string; salary:string; joinDate:string; status:string; phone:string;}>({
    employeeId:'', firstName:'', lastName:'', email:'', department:'', position:'', salary:'0', joinDate:new Date().toISOString().split('T')[0], status:'ACTIVE', phone:''
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchEmployees();
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const [deptList, posList] = await Promise.all([
        hrService.getDepartments().catch(()=>[]),
        hrService.getPositions().catch(()=>[])
      ]);
      setDepartments(deptList.map((d:any)=> d.name || d.departmentName || d.id).filter(Boolean));
      setPositions(posList.map((p:any)=> p.name || p.positionName || p.id).filter(Boolean));
    } catch { /* ignore */ }
  };

  const mapApiEmployee = (emp:any):EmployeeRow => ({
    id: emp.employeeId || emp.id,
    internalId: emp.id,
    name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
    department: emp.department || emp.departmentId || 'Not Assigned',
    email: emp.email || 'N/A',
    status: emp.status === 'ACTIVE' ? 'Active' : 'Inactive',
    phone: emp.phone || 'N/A',
    position: emp.position || 'Not Assigned',
    joinDate: emp.joinDate || 'N/A',
    salary: Number(emp.salary) || 0
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await hrService.getEmployees().catch(()=> mockEmployees);
      const transformed = Array.isArray(data) ? data.map(mapApiEmployee) : mockEmployees;
      setEmployees(transformed);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({ title:'Error', description:'Failed to fetch employees', variant:'destructive'});
      setEmployees(mockEmployees);
    } finally { setLoading(false); }
  };

  const backendSearch = async (term:string) => {
    try {
      if (term.trim().length < 3) { fetchEmployees(); return; }
      const results = await hrService.searchEmployees(term);
      setEmployees(results.map(mapApiEmployee));
    } catch {
      toast({ title:'Search failed', variant:'destructive'});
    }
  };

  // Auto backend search when term length >=3 and debounce
  useEffect(()=>{ const t = setTimeout(()=>{ backendSearch(searchTerm); }, 400); return ()=> clearTimeout(t); }, [searchTerm]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchesDept && matchesStatus;
    });
  }, [employees, departmentFilter, statusFilter]);

  const uniqueDepartments = useMemo(()=>{
    const set = new Set(employees.map(e=> e.department));
    return Array.from(set).filter(Boolean).sort();
  }, [employees]);

  const openEmployeeDetails = (employee: EmployeeRow) => { setSelectedEmployee(employee); setIsViewDetailsOpen(true); };

  const updateStatus = async (row:EmployeeRow, next:'ACTIVE'|'INACTIVE') => {
    try {
      setEmployees(list=> list.map(e=> e.id===row.id? {...e, status: next==='ACTIVE'?'Active':'Inactive'}:e));
      if (row.internalId) await hrService.updateEmployeeStatus(row.internalId, next);
      toast({ title:'Status updated'});
    } catch (e:any) {
      toast({ title:'Update failed', description:e.message||'Error', variant:'destructive'}); fetchEmployees();
    }
  };

  const deleteEmployee = async (row:EmployeeRow) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      if (row.internalId) await hrService.deleteEmployee(row.internalId);
      setEmployees(list=> list.filter(e=> e.id!==row.id));
      toast({ title:'Employee deleted'});
    } catch (e:any) { toast({ title:'Delete failed', description:e.message||'Error', variant:'destructive'}); }
  };

  const openCreate = async () => {
    try {
      setCreating(true);
      const generated = await hrService.generateEmployeeId().catch(()=> 'EMP-'+Date.now());
      setNewEmployee(e=> ({...e, employeeId: generated }));
    } catch { setNewEmployee(e=> ({...e, employeeId:'EMP-'+Date.now()})); }
  };

  const saveNewEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      toast({ title:'Missing fields', description:'First, Last name & Email required', variant:'destructive'}); return; }
    try {
      setSavingNew(true);
      const payload = {
        employeeId: newEmployee.employeeId,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        department: newEmployee.department,
        position: newEmployee.position,
        salary: Number(newEmployee.salary)||0,
        joinDate: newEmployee.joinDate,
        status: newEmployee.status,
        phone: newEmployee.phone
      };
      await hrService.createEmployee(payload);
      toast({ title:'Employee created'});
      setCreating(false);
      setNewEmployee({employeeId:'', firstName:'', lastName:'', email:'', department:'', position:'', salary:'0', joinDate:new Date().toISOString().split('T')[0], status:'ACTIVE', phone:''});
      fetchEmployees();
    } catch (e:any) {
      toast({ title:'Create failed', description:e.message||'Error', variant:'destructive'});
    } finally { setSavingNew(false); }
  };

  const refreshAll = async () => { setRefreshing(true); await fetchEmployees(); setRefreshing(false); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading employees...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage your workforce and employee information
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreate}><UserPlus className="mr-2 h-4 w-4"/>Add Employee</Button>
          <Button variant="outline" onClick={refreshAll} disabled={refreshing}>
            <RefreshCw className={"mr-2 h-4 w-4 "+ (refreshing? 'animate-spin':'')} />Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Employees</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{employees.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Employees</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{employees.filter(e=> e.status==='Active').length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Departments</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{uniqueDepartments.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">New This Month</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{employees.filter(e=>{ if(e.joinDate==='N/A') return false; const d=new Date(e.joinDate); const n=new Date(); return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();}).length}</div></CardContent></Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader><CardTitle>Search & Filter</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search (backend when 3+ chars)..." value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)} className="pl-8" />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map(d=> <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="All Status"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Showing {filteredEmployees.length} of {employees.length} employees</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-muted-foreground">{emp.email}</div>
                      <div className="text-xs text-muted-foreground">{emp.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>
                    <Select value={emp.status==='Active'?'ACTIVE':'INACTIVE'} onValueChange={(v)=> updateStatus(emp, v as 'ACTIVE'|'INACTIVE')}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{emp.joinDate}</TableCell>
                  <TableCell>{formatCurrency(emp.salary)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={()=> openEmployeeDetails(emp)}><Eye className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="sm"><Edit2 className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="sm" onClick={()=> deleteEmployee(emp)}><Trash2 className="h-4 w-4 text-red-600"/></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length===0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No employees match current filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employee Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              View detailed information about the employee
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><h4 className="font-medium text-sm text-muted-foreground">Employee ID</h4><p className="mt-1">{selectedEmployee.id}</p></div>
                <div><h4 className="font-medium text-sm text-muted-foreground">Full Name</h4><p className="mt-1">{selectedEmployee.name}</p></div>
                <div><h4 className="font-medium text-sm text-muted-foreground">Email</h4><p className="mt-1">{selectedEmployee.email}</p></div>
                <div><h4 className="font-medium text-sm text-muted-foreground">Phone</h4><p className="mt-1">{selectedEmployee.phone}</p></div>
                <div><h4 className="font-medium text-sm text-muted-foreground">Department</h4><p className="mt-1">{selectedEmployee.department}</p></div>
                <div><h4 className="font-medium text-sm text-muted-foreground">Position</h4><p className="mt-1">{selectedEmployee.position}</p></div>
                <div><h4 className="font-medium text-sm text-muted-foreground">Join Date</h4><p className="mt-1">{selectedEmployee.joinDate}</p></div>
                <div><h4 className="font-medium text-sm text-muted-foreground">Status</h4><Badge variant={selectedEmployee.status==='Active'?'default':'secondary'} className="mt-1">{selectedEmployee.status}</Badge></div>
                <div><h4 className="font-medium text-sm text-muted-foreground">Salary</h4><p className="mt-1 text-lg font-semibold">{formatCurrency(selectedEmployee.salary)}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Employee Dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Employee</DialogTitle><DialogDescription>Create a new employee record</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Employee ID</label>
                <Input value={newEmployee.employeeId} disabled className="bg-muted" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Join Date</label>
                <Input type="date" value={newEmployee.joinDate} onChange={e=> setNewEmployee(v=>({...v, joinDate:e.target.value}))} />
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">First Name *</label><Input value={newEmployee.firstName} onChange={e=> setNewEmployee(v=>({...v, firstName:e.target.value}))}/></div>
              <div className="space-y-1"><label className="text-xs font-medium">Last Name *</label><Input value={newEmployee.lastName} onChange={e=> setNewEmployee(v=>({...v, lastName:e.target.value}))}/></div>
              <div className="space-y-1 col-span-2"><label className="text-xs font-medium">Email *</label><Input type="email" value={newEmployee.email} onChange={e=> setNewEmployee(v=>({...v, email:e.target.value}))}/></div>
              <div className="space-y-1"><label className="text-xs font-medium">Department</label>
                <Select value={newEmployee.department} onValueChange={val=> setNewEmployee(v=>({...v, department:val}))}>
                  <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                  <SelectContent>
                    {departments.map(d=> <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Position</label>
                <Select value={newEmployee.position} onValueChange={val=> setNewEmployee(v=>({...v, position:val}))}>
                  <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                  <SelectContent>
                    {positions.map(p=> <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Salary</label><Input type="number" value={newEmployee.salary} onChange={e=> setNewEmployee(v=>({...v, salary:e.target.value}))}/></div>
              <div className="space-y-1"><label className="text-xs font-medium">Phone</label><Input value={newEmployee.phone} onChange={e=> setNewEmployee(v=>({...v, phone:e.target.value}))}/></div>
              <div className="space-y-1"><label className="text-xs font-medium">Status</label>
                <Select value={newEmployee.status} onValueChange={val=> setNewEmployee(v=>({...v, status:val}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={()=> setCreating(false)}><X className="h-4 w-4 mr-1"/>Cancel</Button>
            <Button onClick={saveNewEmployee} disabled={savingNew}><Save className="h-4 w-4 mr-1"/>{savingNew? 'Saving...':'Save'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
