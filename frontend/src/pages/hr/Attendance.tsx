import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Clock, Calendar, Download, Users, UserCheck, UserX, Timer, Plus, Edit, Search, Filter, BarChart3, Loader2 } from 'lucide-react';
import { hrService, formatDate } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Sick Leave' | 'Half Day';
  checkIn: string;
  checkOut: string;
}

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAttendance, setNewAttendance] = useState({
    employeeId: '',
    status: 'Present' as 'Present' | 'Absent' | 'Late' | 'Sick Leave' | 'Half Day',
    checkIn: '',
    checkOut: '',
  });
  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attendanceData, employeesData] = await Promise.all([
        hrService.getAttendance(),
        hrService.getEmployees(),
      ]);

      // Transform attendance data to match the interface
      const transformedAttendance = attendanceData.map(record => ({
        ...record,
        employeeName: `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'Unknown',
        date: formatDate(record.date).split('T')[0], // Extract date part
      }));

      setAttendanceRecords(transformedAttendance);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter attendance records by selected date
  const filteredByDate = useMemo(() => {
    return attendanceRecords.filter(record => record.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  // Filter by search term and status
  const filteredAttendance = useMemo(() => {
    return filteredByDate.filter(record => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status.toLowerCase().replace(' ', '-') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [filteredByDate, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredByDate.length;
    const present = filteredByDate.filter(r => r.status === 'Present').length;
    const late = filteredByDate.filter(r => r.status === 'Late').length;
    const absent = filteredByDate.filter(r => r.status === 'Absent').length;
    const onLeave = filteredByDate.filter(r => r.status === 'Sick Leave').length;
    
    return { total, present, late, absent, onLeave };
  }, [filteredByDate]);

  // Calculate working hours
  const calculateWorkingHours = (checkIn: string, checkOut: string): string => {
    if (!checkIn || !checkOut) return '-';
    
    const checkInTime = new Date(`2024-01-01 ${checkIn}`);
    const checkOutTime = new Date(`2024-01-01 ${checkOut}`);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'Late':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
      case 'Absent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      case 'Sick Leave':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
      case 'Half Day':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Generate attendance ID
  const generateAttendanceId = () => {
    const maxId = Math.max(...attendanceRecords.map(record => parseInt(record.id.replace('ATT', ''))));
    return `ATT${(maxId + 1).toString().padStart(3, '0')}`;
  };

  // Mark attendance
  const handleMarkAttendance = () => {
    if (!newAttendance.employeeId) {
      toast({
        title: "Error",
        description: "Please select an employee.",
        variant: "destructive",
      });
      return;
    }

    const employee = employees.find(emp => emp.id === newAttendance.employeeId);
    if (!employee) return;

    // Check if attendance already exists for this date
    const existingAttendance = attendanceRecords.find(
      record => record.employeeId === newAttendance.employeeId && record.date === selectedDate
    );

    if (existingAttendance) {
      // Update existing record
      const updatedRecords = attendanceRecords.map(record =>
        record.id === existingAttendance.id
          ? {
              ...record,
              status: newAttendance.status,
              checkIn: newAttendance.checkIn,
              checkOut: newAttendance.checkOut,
            }
          : record
      );
      setAttendanceRecords(updatedRecords);
      
      toast({
        title: "Success",
        description: "Attendance updated successfully!",
      });
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: generateAttendanceId(),
        employeeId: newAttendance.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        date: selectedDate,
        status: newAttendance.status,
        checkIn: newAttendance.checkIn,
        checkOut: newAttendance.checkOut,
      };

      setAttendanceRecords([...attendanceRecords, newRecord]);
      
      toast({
        title: "Success",
        description: "Attendance marked successfully!",
      });
    }

    setIsMarkAttendanceOpen(false);
    setNewAttendance({
      employeeId: '',
      status: 'Present',
      checkIn: '',
      checkOut: '',
    });
  };

  // Get available employees for attendance marking
  const availableEmployees = employees.filter(emp => emp.status === 'ACTIVE');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading attendance data...</span>
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
          <h1 className="text-3xl font-bold">Attendance Dashboard</h1>
          <p className="text-muted-foreground">Monitor employee attendance and working hours</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isMarkAttendanceOpen} onOpenChange={setIsMarkAttendanceOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Mark Attendance for {new Date(selectedDate).toDateString()}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Employee</Label>
                  <Select value={newAttendance.employeeId} onValueChange={(value) => setNewAttendance({ ...newAttendance, employeeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.employeeId}>
                          {`${employee.firstName} ${employee.lastName}`} ({employee.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newAttendance.status} onValueChange={(value: any) => setNewAttendance({ ...newAttendance, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Late">Late</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Half Day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newAttendance.status !== 'Absent' && newAttendance.status !== 'Sick Leave' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Check In Time</Label>
                      <Input
                        type="time"
                        value={newAttendance.checkIn}
                        onChange={(e) => setNewAttendance({ ...newAttendance, checkIn: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check Out Time</Label>
                      <Input
                        type="time"
                        value={newAttendance.checkOut}
                        onChange={(e) => setNewAttendance({ ...newAttendance, checkOut: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMarkAttendanceOpen(false)}>Cancel</Button>
                <Button onClick={handleMarkAttendance}>Mark Attendance</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Date Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="date">Select Date:</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
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
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="sick-leave">Sick Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <Card className="erp-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="erp-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="erp-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              </div>
              <Timer className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="erp-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="erp-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-blue-600">{stats.onLeave}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attendance for {new Date(selectedDate).toDateString()} ({filteredAttendance.length} employees)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-secondary"
                    >
                      <TableCell className="font-medium">{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.checkIn || '-'}</TableCell>
                      <TableCell>{record.checkOut || '-'}</TableCell>
                      <TableCell>{calculateWorkingHours(record.checkIn, record.checkOut)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const employee = employees.find(emp => emp.id === record.employeeId);
                              if (employee) {
                                setNewAttendance({
                                  employeeId: record.employeeId,
                                  status: record.status,
                                  checkIn: record.checkIn,
                                  checkOut: record.checkOut,
                                });
                                setIsMarkAttendanceOpen(true);
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
              
              {filteredAttendance.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found for {new Date(selectedDate).toDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}