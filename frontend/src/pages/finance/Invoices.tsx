import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Search, Download, CheckCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService, formatCurrency } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function Invoices() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: () => financeService.getInvoices(),
  });

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: () => financeService.getAccounts(),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (payload: any) => financeService.createInvoice(payload),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Invoice created successfully' });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create invoice', 
        variant: 'destructive' 
      });
    }
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => financeService.markInvoicePaid(id),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Invoice marked as paid' });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update invoice', 
        variant: 'destructive' 
      });
    }
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    customerName: '',
    customerEmail: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    amount: '',
    taxPercent: '18',
    taxAmount: '0',
    totalAmount: '',
    accountId: '',
    description: ''
  });

  const resetForm = () => {
    setInvoiceForm({
      invoiceNumber: '',
      customerName: '',
      customerEmail: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: '',
      taxPercent: '18',
      taxAmount: '0',
      totalAmount: '',
      accountId: '',
      description: ''
    });
  };

  // Calculate tax and total when amount or tax percent changes
  const calculateTotals = (amount: string, taxPercent: string) => {
    const amt = parseFloat(amount) || 0;
    const taxP = parseFloat(taxPercent) || 0;
    const taxAmt = +(amt * taxP / 100).toFixed(2);
    const total = +(amt + taxAmt).toFixed(2);
    return { taxAmount: taxAmt.toString(), totalAmount: total.toString() };
  };

  const handleAmountChange = (value: string) => {
    const { taxAmount, totalAmount } = calculateTotals(value, invoiceForm.taxPercent);
    setInvoiceForm(prev => ({
      ...prev,
      amount: value,
      taxAmount,
      totalAmount
    }));
  };

  const handleTaxPercentChange = (value: string) => {
    const { taxAmount, totalAmount } = calculateTotals(invoiceForm.amount, value);
    setInvoiceForm(prev => ({
      ...prev,
      taxPercent: value,
      taxAmount,
      totalAmount
    }));
  };

  const handleSubmit = () => {
    if (!invoiceForm.invoiceNumber || !invoiceForm.amount || !invoiceForm.customerName) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }

    const payload = {
      invoiceNumber: invoiceForm.invoiceNumber,
      customerName: invoiceForm.customerName,
      customerEmail: invoiceForm.customerEmail,
      invoiceDate: invoiceForm.invoiceDate,
      dueDate: invoiceForm.dueDate,
      amount: Number(invoiceForm.amount),
      taxAmount: Number(invoiceForm.taxAmount),
      totalAmount: Number(invoiceForm.totalAmount),
      description: invoiceForm.description,
      status: 'PENDING',
      creditAccount: invoiceForm.accountId ? { id: Number(invoiceForm.accountId) } : null
    };

    createInvoiceMutation.mutate(payload);
  };

  const loading = invoicesQuery.isLoading || accountsQuery.isLoading;
  const invoices = invoicesQuery.data || [];
  const accounts = accountsQuery.data || [];

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice: any) => {
      const matchesSearch = !searchTerm || 
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || 
        (invoice.status?.toUpperCase() === statusFilter);
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalAmount = filteredInvoices.reduce((sum: number, invoice: any) => sum + (Number(invoice.totalAmount) || 0), 0);
  const paidAmount = filteredInvoices.filter((inv: any) => inv.status?.toUpperCase() === 'PAID').reduce((sum: number, invoice: any) => sum + (Number(invoice.totalAmount) || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading invoices...</span>
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
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage your customer invoices and payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoices Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoices ({filteredInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice: any, index: number) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-secondary"
                  >
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>
                        {invoice.customerEmail && (
                          <div className="text-sm text-muted-foreground">{invoice.customerEmail}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{invoice.invoiceDate}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.totalAmount || 0)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status?.toUpperCase() !== 'PAID' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPaidMutation.mutate(String(invoice.id))}
                            disabled={markPaidMutation.isLoading}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            {filteredInvoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No invoices found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Invoice Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="INV-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={invoiceForm.customerName}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Customer name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={invoiceForm.customerEmail}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">Account</Label>
                <Select value={invoiceForm.accountId} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, accountId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account: any) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceForm.invoiceDate}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxPercent">Tax %</Label>
                <Input
                  id="taxPercent"
                  type="number"
                  value={invoiceForm.taxPercent}
                  onChange={(e) => handleTaxPercentChange(e.target.value)}
                  placeholder="18"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  value={invoiceForm.totalAmount}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Invoice description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createInvoiceMutation.isLoading}>
              {createInvoiceMutation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Invoice Number</Label>
                  <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                  {selectedInvoice.customerEmail && (
                    <p className="text-sm text-muted-foreground">{selectedInvoice.customerEmail}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                  <p className="text-lg font-bold">{formatCurrency(selectedInvoice.totalAmount || 0)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Invoice Date</Label>
                  <p>{selectedInvoice.invoiceDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
                  <p>{selectedInvoice.dueDate}</p>
                </div>
              </div>
              {selectedInvoice.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p>{selectedInvoice.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}