import { useEffect, useState, useMemo } from 'react';
import { hrService, formatCurrency } from '@/services/apiService';
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
  Briefcase, Users, TrendingUp, Award, Edit, Building2,
  Filter, Download, Grid, List, MapPin, DollarSign
} from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtil';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Position {
  id: string;
  title: string;
  description?: string;
  departmentId?: string;
  department?: string;
  minSalary?: number;
  maxSalary?: number;
  requirements?: string;
  isActive?: boolean;
  employeeCount?: number;
}

interface Department {
  id: string;
  name: string;
}

export default function Positions() {
  const { toast } = useToast();

  // Data States
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewType, setViewType] = useState<'grid' | 'table'>('table');
  
  // Modal States
  const [viewingPosition, setViewingPosition] = useState<Position | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [creatingPosition, setCreatingPosition] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [positionForm, setPositionForm] = useState<Partial<Position>>({
    title: '',
    description: '',
    departmentId: '',
    minSalary: 0,
    maxSalary: 0,
    requirements: '',
    isActive: true
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [positionsData, departmentsData, employeesData] = await Promise.all([
        hrService.getPositions(),
        hrService.getDepartments().catch(() => []),
        hrService.getEmployees().catch(() => [])
      ]);
      
      // Add employee count to positions
      const positionsWithCount = (positionsData || []).map((pos: Position) => {
        const employeeCount = (employeesData || []).filter(
          (emp: any) => emp.positionId === pos.id || emp.position === pos.title
        ).length;
        return { ...pos, employeeCount };
      });
      
      setPositions(positionsWithCount);
      setDepartments(departmentsData || []);
      setEmployees(employeesData || []);
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load positions',
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

  // Filtered positions
  const filteredPositions = useMemo(() => {
    return positions.filter(position => {
      const matchesSearch = !searchTerm || 
        position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (position.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (position.requirements || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || 
        position.departmentId === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  }, [positions, searchTerm, departmentFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = positions.length;
    const withEmployees = positions.filter(p => (p.employeeCount || 0) > 0).length;
    const vacant = total - withEmployees;
    const totalEmployees = positions.reduce((sum, pos) => sum + (pos.employeeCount || 0), 0);
    const avgSalary = positions.length > 0 
      ? positions.reduce((sum, pos) => sum + ((pos.minSalary || 0) + (pos.maxSalary || 0)) / 2, 0) / positions.length 
      : 0;
    
    return { total, withEmployees, vacant, totalEmployees, avgSalary };
  }, [positions]);

  const openCreate = () => {
    setPositionForm({
      title: '',
      description: '',
      departmentId: '',
      minSalary: 0,
      maxSalary: 0,
      requirements: '',
      isActive: true
    });
    setEditingPosition(null);
    setCreatingPosition(true);
  };

  const openEdit = (position: Position) => {
    setPositionForm({ ...position });
    setEditingPosition(position);
    setCreatingPosition(true);
  };

  const savePosition = async () => {
    if (!positionForm.title?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a position title',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      if (editingPosition) {
        await hrService.updatePosition(editingPosition.id, positionForm);
        toast({ title: 'Position updated successfully' });
      } else {
        await hrService.createPosition(positionForm);
        toast({ title: 'Position created successfully' });
      }
      setCreatingPosition(false);
      await fetchAll();
    } catch (error: any) {
      toast({
        title: 'Error saving position',
        description: error.message || 'Failed to save position',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePosition = async (position: Position) => {
    if (!window.confirm(`Delete position "${position.title}"? This action cannot be undone.`)) return;
    
    try {
      await hrService.deletePosition(position.id);
      toast({ title: 'Position deleted successfully' });
      await fetchAll();
    } catch (error: any) {
      toast({
        title: 'Error deleting position',
        description: error.message || 'Failed to delete position',
        variant: 'destructive'
      });
    }
  };

  const exportPositions = () => {
    const exportData = filteredPositions.map(pos => ({
      'Title': pos.title,
      'Department': getDepartmentName(pos.departmentId),
      'Description': pos.description || '',
      'Min Salary': pos.minSalary || 0,
      'Max Salary': pos.maxSalary || 0,
      'Employee Count': pos.employeeCount || 0,
      'Requirements': pos.requirements || '',
      'Status': pos.isActive ? 'Active' : 'Inactive'
    }));
    exportToCSV('positions.csv', exportData);
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'No department';
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || departmentId;
  };

  const getSalaryRange = (position: Position) => {
    if (!position.minSalary && !position.maxSalary) return 'Not specified';
    if (position.minSalary && position.maxSalary) {
      return `${formatCurrency(position.minSalary)} - ${formatCurrency(position.maxSalary)}`;
    }
    if (position.minSalary) return `From ${formatCurrency(position.minSalary)}`;
    if (position.maxSalary) return `Up to ${formatCurrency(position.maxSalary)}`;
    return 'Not specified';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading positions...</span>
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
              <Briefcase className="h-8 w-8 text-emerald-600" />
              Position Management
            </h1>
            <p className="text-gray-600 mt-1">Define and manage job positions</p>
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
            Add Position
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Filled</p>
                <p className="text-2xl font-bold text-green-600">{stats.withEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vacant</p>
                <p className="text-2xl font-bold text-orange-600">{stats.vacant}</p>
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
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgSalary)}</p>
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
                  placeholder="Search positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportPositions}>
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

      {/* Position List */}
      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPositions.map(position => (
            <Card key={position.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {position.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight line-clamp-2">{position.title}</h3>
                      <p className="text-sm text-gray-500">
                        {position.employeeCount || 0} employees
                      </p>
                    </div>
                  </div>
                  <Badge variant={position.isActive !== false ? 'default' : 'secondary'}>
                    {position.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{getDepartmentName(position.departmentId)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{getSalaryRange(position)}</span>
                  </div>
                </div>
                
                {position.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {position.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{position.employeeCount || 0}</span>
                  </div>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewingPosition(position)}
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
                          onClick={() => openEdit(position)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Position</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deletePosition(position)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Position</p>
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
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary Range</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map(position => (
                  <TableRow key={position.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {position.title.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{position.title}</div>
                          {position.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {position.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getDepartmentName(position.departmentId)}</TableCell>
                    <TableCell>
                      <span className="font-medium text-emerald-600">
                        {getSalaryRange(position)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{position.employeeCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={position.isActive !== false ? 'default' : 'secondary'}>
                        {position.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setViewingPosition(position)}
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
                              onClick={() => openEdit(position)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Position</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deletePosition(position)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Position</p>
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

      {/* Create/Edit Position Dialog */}
      <Dialog open={creatingPosition} onOpenChange={setCreatingPosition}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? 'Edit Position' : 'Create New Position'}
            </DialogTitle>
            <DialogDescription>
              {editingPosition 
                ? 'Update position information below.'
                : 'Enter the position details below.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Position Title *</Label>
                <Input
                  id="title"
                  value={positionForm.title || ''}
                  onChange={(e) => setPositionForm(prev => ({...prev, title: e.target.value}))}
                  placeholder="Software Engineer"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={positionForm.departmentId || ''} 
                  onValueChange={(value) => setPositionForm(prev => ({...prev, departmentId: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No department</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={positionForm.description || ''}
                onChange={(e) => setPositionForm(prev => ({...prev, description: e.target.value}))}
                placeholder="Brief description of the position and its responsibilities..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minSalary">Minimum Salary</Label>
                <Input
                  id="minSalary"
                  type="number"
                  value={positionForm.minSalary || 0}
                  onChange={(e) => setPositionForm(prev => ({...prev, minSalary: parseFloat(e.target.value) || 0}))}
                  placeholder="50000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxSalary">Maximum Salary</Label>
                <Input
                  id="maxSalary"
                  type="number"
                  value={positionForm.maxSalary || 0}
                  onChange={(e) => setPositionForm(prev => ({...prev, maxSalary: parseFloat(e.target.value) || 0}))}
                  placeholder="80000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={positionForm.requirements || ''}
                onChange={(e) => setPositionForm(prev => ({...prev, requirements: e.target.value}))}
                placeholder="Required skills, qualifications, and experience..."
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={positionForm.isActive !== false}
                onChange={(e) => setPositionForm(prev => ({...prev, isActive: e.target.checked}))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active Position</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setCreatingPosition(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={savePosition} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {editingPosition ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Position Dialog */}
      <Dialog open={!!viewingPosition} onOpenChange={() => setViewingPosition(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Position Details</DialogTitle>
          </DialogHeader>
          
          {viewingPosition && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {viewingPosition.title.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingPosition.title}</h3>
                  <p className="text-gray-600">{getDepartmentName(viewingPosition.departmentId)}</p>
                  <Badge 
                    variant={viewingPosition.isActive !== false ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {viewingPosition.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Position Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p>{viewingPosition.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p>{getDepartmentName(viewingPosition.departmentId)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Salary Range</p>
                        <p className="font-semibold text-emerald-600">{getSalaryRange(viewingPosition)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Requirements & Stats</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Current Employees</p>
                        <p className="font-semibold text-2xl">{viewingPosition.employeeCount || 0}</p>
                      </div>
                    </div>
                    {viewingPosition.requirements && (
                      <div>
                        <p className="text-sm text-gray-600">Requirements</p>
                        <p className="text-sm">{viewingPosition.requirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setViewingPosition(null)}>
              Close
            </Button>
            {viewingPosition && (
              <Button onClick={() => {
                setViewingPosition(null);
                openEdit(viewingPosition);
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