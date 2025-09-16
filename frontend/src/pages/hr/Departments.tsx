import { useEffect, useState, useMemo } from 'react';
import { hrService } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, Search, Plus, Eye, Trash2, RefreshCw, Save, X, 
  Building2, Users, TrendingUp, Award, Edit, 
  Filter, Download, Grid, List, Power, PowerOff
} from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtil';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Department {
  id: string;
  name: string;
  description?: string;
  headEmployeeId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  employeeCount?: number;
}

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  departmentId?: string;
  positionId?: string;
  status?: string;
}

interface Position {
  id: string;
  title: string;
}

export default function Departments() {
  const { toast } = useToast();

  // Data States
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departmentEmployees, setDepartmentEmployees] = useState<Employee[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewType, setViewType] = useState<'grid' | 'table'>('table');
  
  // Modal States
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [departmentForm, setDepartmentForm] = useState<Partial<Department>>({
    name: '',
    description: '',
    headEmployeeId: '',
    isActive: true
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [departmentsData, employeesData, positionsData] = await Promise.all([
        hrService.getDepartments(),
        hrService.getEmployees().catch(() => []),
        hrService.getPositions().catch(() => [])
      ]);
      
      // Add employee count to departments
      const departmentsWithCount = (departmentsData || []).map((dept: Department) => {
        const employeeCount = (employeesData || []).filter(
          (emp: any) => emp.departmentId === dept.id || emp.department === dept.name
        ).length;
        return { ...dept, employeeCount };
      });
      
      setDepartments(departmentsWithCount);
      setEmployees(employeesData || []);
      setPositions(positionsData || []);
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load departments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setTimeout(() => setRefreshing(false), 500);
  };

  const fetchDepartmentEmployees = async (departmentId: string) => {
    try {
      setLoadingEmployees(true);
      const employees = await hrService.getEmployeesByDepartment(departmentId);
      setDepartmentEmployees(employees || []);
    } catch (error: any) {
      toast({
        title: 'Error loading employees',
        description: error.message || 'Failed to load department employees',
        variant: 'destructive'
      });
      setDepartmentEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleViewDepartment = (department: Department) => {
    setViewingDepartment(department);
    fetchDepartmentEmployees(department.id);
  };

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(department => {
      const matchesSearch = !searchTerm || 
        department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (department.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && department.isActive) ||
        (statusFilter === 'inactive' && !department.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = departments.length;
    const active = departments.filter(d => d.isActive).length;
    const inactive = total - active;
    const totalEmployees = departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0);
    
    return { total, active, inactive, totalEmployees };
  }, [departments]);

  const openCreate = () => {
    setDepartmentForm({
      name: '',
      description: '',
      headEmployeeId: '',
      isActive: true
    });
    setEditingDepartment(null);
    setCreatingDepartment(true);
  };

  const openEdit = (department: Department) => {
    setDepartmentForm({ ...department });
    setEditingDepartment(department);
    setCreatingDepartment(true);
  };

  const saveDepartment = async () => {
    if (!departmentForm.name?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a department name',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      if (editingDepartment) {
        await hrService.updateDepartment(editingDepartment.id, departmentForm);
        toast({ title: 'Department updated successfully' });
      } else {
        await hrService.createDepartment(departmentForm);
        toast({ title: 'Department created successfully' });
      }
      setCreatingDepartment(false);
      await fetchAll();
    } catch (error: any) {
      toast({
        title: 'Error saving department',
        description: error.message || 'Failed to save department',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDepartmentStatus = async (department: Department) => {
    try {
      if (department.isActive) {
        await hrService.deactivateDepartment(department.id);
        toast({ title: 'Department deactivated successfully' });
      } else {
        await hrService.activateDepartment(department.id);
        toast({ title: 'Department activated successfully' });
      }
      await fetchAll();
    } catch (error: any) {
      toast({
        title: 'Error updating department',
        description: error.message || 'Failed to update department status',
        variant: 'destructive'
      });
    }
  };

  const deleteDepartment = async (department: Department) => {
    if (!window.confirm(`Delete department "${department.name}"? This action cannot be undone.`)) return;
    
    try {
      await hrService.deleteDepartment(department.id);
      toast({ title: 'Department deleted successfully' });
      await fetchAll();
    } catch (error: any) {
      toast({
        title: 'Error deleting department',
        description: error.message || 'Failed to delete department',
        variant: 'destructive'
      });
    }
  };

  const exportDepartments = () => {
    const exportData = filteredDepartments.map(dept => ({
      'Name': dept.name,
      'Description': dept.description || '',
      'Status': dept.isActive ? 'Active' : 'Inactive',
      'Employee Count': dept.employeeCount || 0,
      'Head Employee': getHeadEmployeeName(dept.headEmployeeId),
      'Created': dept.createdAt || 'N/A'
    }));
    exportToCSV('departments.csv', exportData);
  };

  const getHeadEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Not assigned';
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getPositionName = (positionId?: string) => {
    if (!positionId) return 'Not specified';
    const position = positions.find(p => p.id === positionId);
    return position?.title || 'Not specified';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading departments...</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-indigo-600" />
              Department Management
            </h1>
            <p className="text-gray-600 mt-1">Organize your company structure</p>
          </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <PowerOff className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportDepartments}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={viewType === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewType === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department List */}
      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDepartments.map(department => (
            <Card key={department.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {department.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg truncate">{department.name}</h3>
                      <p className="text-sm text-gray-500">
                        {department.employeeCount || 0} employees
                      </p>
                    </div>
                  </div>
                </div>
                
                {department.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {department.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Head:</span>
                    <span className="font-medium truncate">
                      {getHeadEmployeeName(department.headEmployeeId)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{department.employeeCount || 0}</span>
                  </div>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDepartment(department)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View Details</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEdit(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Department</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleDepartmentStatus(department)}
                          className={department.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {department.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{department.isActive ? 'Deactivate Department' : 'Activate Department'}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteDepartment(department)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Department</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Head Employee</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map(department => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {department.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{department.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {department.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>{getHeadEmployeeName(department.headEmployeeId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{department.employeeCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={department.isActive ? 'default' : 'secondary'}>
                        {department.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewDepartment(department)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openEdit(department)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Department</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleDepartmentStatus(department)}
                              className={department.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                            >
                              {department.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{department.isActive ? 'Deactivate Department' : 'Activate Department'}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteDepartment(department)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Department</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Department Dialog */}
      <Dialog open={creatingDepartment} onOpenChange={setCreatingDepartment}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Edit Department' : 'Create New Department'}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment 
                ? 'Update department information below.'
                : 'Enter the department details below.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                value={departmentForm.name || ''}
                onChange={(e) => setDepartmentForm(prev => ({...prev, name: e.target.value}))}
                placeholder="Human Resources"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={departmentForm.description || ''}
                onChange={(e) => setDepartmentForm(prev => ({...prev, description: e.target.value}))}
                placeholder="Brief description of the department's role and responsibilities..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="headEmployee">Head Employee</Label>
              <Select 
                value={departmentForm.headEmployeeId || ''} 
                onValueChange={(value) => setDepartmentForm(prev => ({...prev, headEmployeeId: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select head employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No head assigned</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={departmentForm.isActive ?? true}
                onChange={(e) => setDepartmentForm(prev => ({...prev, isActive: e.target.checked}))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active Department</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setCreatingDepartment(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={saveDepartment} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {editingDepartment ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Department Dialog */}
      <Dialog open={!!viewingDepartment} onOpenChange={() => {
        setViewingDepartment(null);
        setDepartmentEmployees([]);
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
          </DialogHeader>
          
          {viewingDepartment && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {viewingDepartment.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingDepartment.name}</h3>
                  <Badge 
                    variant={viewingDepartment.isActive ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {viewingDepartment.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Department Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p>{viewingDepartment.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Head Employee</p>
                      <p>{getHeadEmployeeName(viewingDepartment.headEmployeeId)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Total Employees</p>
                        <p className="font-semibold text-2xl">{viewingDepartment.employeeCount || 0}</p>
                      </div>
                    </div>
                    {viewingDepartment.createdAt && (
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p>{new Date(viewingDepartment.createdAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Employees List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Department Employees
                  </h4>
                  <Badge variant="outline" className="px-3 py-1">
                    {departmentEmployees.length} {departmentEmployees.length === 1 ? 'employee' : 'employees'}
                  </Badge>
                </div>
                
                {loadingEmployees ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : departmentEmployees.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Employee ID</TableHead>
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Position</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departmentEmployees.map((employee, index) => (
                          <TableRow key={employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <TableCell className="font-medium text-blue-600">{employee.employeeId}</TableCell>
                            <TableCell className="font-medium">{`${employee.firstName} ${employee.lastName}`}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {getPositionName(employee.positionId || employee.position)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{employee.email}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {employee.status || 'Active'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No employees assigned to this department</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => {
              setViewingDepartment(null);
              setDepartmentEmployees([]);
            }}>
              Close
            </Button>
            {viewingDepartment && (
              <Button onClick={() => {
                setViewingDepartment(null);
                setDepartmentEmployees([]);
                openEdit(viewingDepartment);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}