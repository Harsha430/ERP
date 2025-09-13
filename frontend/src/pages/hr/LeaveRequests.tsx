import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Check, X, Clock, Plus, Eye, Search, Filter, Users, CalendarDays, FileText, BarChart3, Loader2 } from 'lucide-react';
import { hrService, formatDate } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  days: number;
  reason: string;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

interface LeaveBalance {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

interface AggregatedLeaveBalance {
  employeeId: string;
  employeeName: string;
  annualLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  sickLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  personalLeave: {
    total: number;
    used: number;
    remaining: number;
  };
}

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export default function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isBalanceViewOpen, setIsBalanceViewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [selectedEmployeeBalance, setSelectedEmployeeBalance] = useState<AggregatedLeaveBalance | null>(null);
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    employeeId: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  
  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaveRequestsData, leaveBalancesData, employeesData] = await Promise.all([
        hrService.getLeaveRequests(),
        hrService.getLeaveBalances(),
        hrService.getEmployees(),
      ]);

      // Transform leave requests to match interface
      const transformedRequests = leaveRequestsData.map(request => ({
        ...request,
        employeeName: `${request.firstName || ''} ${request.lastName || ''}`.trim() || 'Unknown',
        startDate: formatDate(request.startDate).split('T')[0],
        endDate: formatDate(request.endDate).split('T')[0],
        appliedDate: formatDate(request.appliedDate).split('T')[0],
        approvedDate: request.approvedDate ? formatDate(request.approvedDate).split('T')[0] : undefined,
      }));

      // Transform leave balances
      const transformedBalances = leaveBalancesData.map(balance => ({
        ...balance,
        employeeName: `${balance.firstName || ''} ${balance.lastName || ''}`.trim() || 'Unknown',
      }));

      // Transform employees to match frontend interface
      const transformedEmployees = employeesData.map(employee => ({
        id: employee.employeeId || employee.id,
        employeeId: employee.employeeId,
        name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown',
        status: employee.status === 'ACTIVE' ? 'Active' as 'Active' : 'Inactive' as 'Inactive'
      }));

      setLeaveRequests(transformedRequests);
      setLeaveBalances(transformedBalances);
      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave request data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter leave requests
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(request => {
      const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter;
      const matchesType = typeFilter === 'all' || request.type.toLowerCase().replace(' ', '-') === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaveRequests, searchTerm, statusFilter, typeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter(r => r.status === 'PENDING').length;
    const approved = leaveRequests.filter(r => r.status === 'APPROVED').length;
    const rejected = leaveRequests.filter(r => r.status === 'REJECTED').length;
    
    return { total, pending, approved, rejected };
  }, [leaveRequests]);

  // Calculate days between dates
  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Generate leave request ID
  const generateLeaveId = () => {
    const maxId = Math.max(...leaveRequests.map(req => parseInt(req.id.replace('LR', ''))));
    return `LR${(maxId + 1).toString().padStart(3, '0')}`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Apply for leave
  const handleApplyLeave = () => {
    if (!newLeaveRequest.employeeId || !newLeaveRequest.type || !newLeaveRequest.startDate || 
        !newLeaveRequest.endDate || !newLeaveRequest.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const employee = employees.find(emp => emp.id === newLeaveRequest.employeeId);
    if (!employee) return;

    const days = calculateDays(newLeaveRequest.startDate, newLeaveRequest.endDate);
    const newRequest: LeaveRequest = {
      id: generateLeaveId(),
      employeeId: newLeaveRequest.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      type: newLeaveRequest.type,
      startDate: newLeaveRequest.startDate,
      endDate: newLeaveRequest.endDate,
      status: 'PENDING' as const,
      days: days,
      reason: newLeaveRequest.reason,
      appliedDate: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    setIsApplyLeaveOpen(false);
    setNewLeaveRequest({
      employeeId: '',
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
    });
    
    toast({
      title: "Success",
      description: "Leave application submitted successfully!",
    });
  };

  // Approve leave request
  const handleApprove = (requestId: string) => {
    const updatedRequests = leaveRequests.map(request =>
      request.id === requestId
        ? {
            ...request,
            status: 'APPROVED' as const,
            approvedBy: 'Current User',
            approvedDate: new Date().toISOString().split('T')[0],
          }
        : request
    );
    
    setLeaveRequests(updatedRequests);
    toast({
      title: "Success",
      description: "Leave request approved successfully!",
    });
  };

  // Reject leave request
  const handleReject = (requestId: string, reason: string = 'No reason provided') => {
    const updatedRequests = leaveRequests.map(request =>
      request.id === requestId
        ? {
            ...request,
            status: 'REJECTED' as const,
            approvedBy: 'Current User',
            approvedDate: new Date().toISOString().split('T')[0],
            rejectionReason: reason,
          }
        : request
    );
    
    setLeaveRequests(updatedRequests);
    toast({
      title: "Success",
      description: "Leave request rejected.",
    });
  };

  // Open details dialog
  const openDetailsDialog = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsViewDetailsOpen(true);
  };

  // Open balance view
  const openBalanceView = (employeeId: string) => {
    const balance = leaveBalances.find(b => b.employeeId === employeeId);
    if (balance) {
      setSelectedEmployeeBalance(balance);
      setIsBalanceViewOpen(true);
    }
  };

  const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Emergency Leave', 'Maternity Leave', 'Paternity Leave'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading leave requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Manage employee leave applications and approvals</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isApplyLeaveOpen} onOpenChange={setIsApplyLeaveOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Employee *</Label>
                  <Select value={newLeaveRequest.employeeId} onValueChange={(value) => setNewLeaveRequest({ ...newLeaveRequest, employeeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter(emp => emp.status === 'Active').map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Leave Type *</Label>
                  <Select value={newLeaveRequest.type} onValueChange={(value) => setNewLeaveRequest({ ...newLeaveRequest, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={newLeaveRequest.startDate}
                      onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, startDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={newLeaveRequest.endDate}
                      onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, endDate: e.target.value })}
                      min={newLeaveRequest.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {newLeaveRequest.startDate && newLeaveRequest.endDate && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total days: <span className="font-medium text-foreground">
                        {calculateDays(newLeaveRequest.startDate, newLeaveRequest.endDate)} days
                      </span>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Reason *</Label>
                  <Textarea
                    value={newLeaveRequest.reason}
                    onChange={(e) => setNewLeaveRequest({ ...newLeaveRequest, reason: e.target.value })}
                    placeholder="Please provide reason for leave..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsApplyLeaveOpen(false)}>Cancel</Button>
                <Button onClick={handleApplyLeave}>Submit Application</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Leave Report
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="erp-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="erp-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="erp-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="erp-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4 items-center flex-wrap"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Leave Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="annual-leave">Annual Leave</SelectItem>
              <SelectItem value="sick-leave">Sick Leave</SelectItem>
              <SelectItem value="personal-leave">Personal Leave</SelectItem>
              <SelectItem value="emergency-leave">Emergency Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Leave Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leave Requests ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request, index) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-secondary"
                    >
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{request.employeeName}</span>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs text-blue-600 hover:text-blue-800 justify-start"
                            onClick={() => openBalanceView(request.employeeId)}
                          >
                            View Balance
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(request.startDate).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">to {new Date(request.endDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.days} days</Badge>
                      </TableCell>
                      <TableCell>{new Date(request.appliedDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openDetailsDialog(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {request.status === 'Pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(request.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject this leave request for {request.employeeName}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleReject(request.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Request Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Request ID</Label>
                  <p className="font-medium">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Employee</Label>
                  <p className="font-medium">{selectedRequest.employeeName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Leave Type</Label>
                  <p className="font-medium">{selectedRequest.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p className="font-medium">{new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <p className="font-medium">{new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Days</Label>
                  <p className="font-medium">{selectedRequest.days} days</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="font-medium mt-1 p-3 bg-muted rounded-lg">{selectedRequest.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Applied Date</Label>
                  <p className="font-medium">{new Date(selectedRequest.appliedDate).toLocaleDateString()}</p>
                </div>
                {selectedRequest.approvedDate && (
                  <div>
                    <Label className="text-muted-foreground">
                      {selectedRequest.status === 'APPROVED' ? 'Approved' : 'Rejected'} Date
                    </Label>
                    <p className="font-medium">{new Date(selectedRequest.approvedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {selectedRequest.rejectionReason && (
                <div>
                  <Label className="text-muted-foreground">Rejection Reason</Label>
                  <p className="font-medium mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Balance Dialog */}
      <Dialog open={isBalanceViewOpen} onOpenChange={setIsBalanceViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Leave Balance</DialogTitle>
          </DialogHeader>
          {selectedEmployeeBalance && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg">{selectedEmployeeBalance?.employeeName || 'Unknown Employee'}</h3>
                <p className="text-muted-foreground">Employee ID: {selectedEmployeeBalance?.employeeId || 'N/A'}</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-green-700 mb-2">Annual Leave</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">{selectedEmployeeBalance?.annualLeave?.total || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Used:</span>
                      <p className="font-medium text-red-600">{selectedEmployeeBalance?.annualLeave?.used || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>
                      <p className="font-medium text-green-600">{selectedEmployeeBalance?.annualLeave?.remaining || 0}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${selectedEmployeeBalance?.annualLeave?.total ? 
                          (selectedEmployeeBalance.annualLeave.remaining / selectedEmployeeBalance.annualLeave.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Sick Leave</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">{selectedEmployeeBalance?.sickLeave?.total || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Used:</span>
                      <p className="font-medium text-red-600">{selectedEmployeeBalance?.sickLeave?.used || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>
                      <p className="font-medium text-blue-600">{selectedEmployeeBalance?.sickLeave?.remaining || 0}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${selectedEmployeeBalance?.sickLeave?.total ? 
                          (selectedEmployeeBalance.sickLeave.remaining / selectedEmployeeBalance.sickLeave.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-purple-700 mb-2">Personal Leave</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">{selectedEmployeeBalance?.personalLeave?.total || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Used:</span>
                      <p className="font-medium text-red-600">{selectedEmployeeBalance?.personalLeave?.used || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>
                      <p className="font-medium text-purple-600">{selectedEmployeeBalance?.personalLeave?.remaining || 0}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${selectedEmployeeBalance?.personalLeave?.total ? 
                          (selectedEmployeeBalance.personalLeave.remaining / selectedEmployeeBalance.personalLeave.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBalanceViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}