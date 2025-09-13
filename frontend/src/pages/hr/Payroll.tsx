import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Banknote, Download, Receipt } from 'lucide-react';
import { payroll } from '@/data/mockData';

export default function Payroll() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Process salaries and generate payslips</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Download className="h-4 w-4 mr-2" />
          Export Payroll
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              January 2024 Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-secondary"
                  >
                    <TableCell className="font-medium">{record.employeeId}</TableCell>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>₹{record.basicSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">+₹{record.allowances.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">-₹{record.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">₹{record.netSalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Receipt className="h-4 w-4 mr-1" />
                        Payslip
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sample Payslip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Sample Payslip - {payroll[0]?.employeeName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Earnings</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span>₹{payroll[0]?.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowances</span>
                    <span className="text-green-600">+₹{payroll[0]?.allowances.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Gross Salary</span>
                    <span>₹{((payroll[0]?.basicSalary || 0) + (payroll[0]?.allowances || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Deductions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="text-red-600">-₹5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span className="text-red-600">-₹2,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span className="text-red-600">-₹1,000</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Net Salary</span>
                    <span className="text-green-600">₹{payroll[0]?.netSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}