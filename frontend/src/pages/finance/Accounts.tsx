import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Plus, TrendingUp, Loader2, Power, Ban } from 'lucide-react';
import { financeService } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface Account {
  id: string;
  name: string;
  code: string;
  type: string;
  description: string;
  isActive: boolean;
}

const ACCOUNT_TYPES = ['ASSET','LIABILITY','INCOME','EXPENSE','EQUITY'];

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newAccount, setNewAccount] = useState({ name:'', code:'', type:'ASSET', description:'' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await financeService.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch accounts data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newAccount.name || !newAccount.code) {
      toast({ title: 'Missing fields', description: 'Name and Code are required', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      await financeService.createAccount({ ...newAccount, isActive: true });
      toast({ title: 'Account created' });
      setCreating(false);
      setNewAccount({ name:'', code:'', type:'ASSET', description:'' });
      fetchAccounts();
    } catch (e:any) {
      toast({ title:'Create failed', description: e.message || 'Error', variant:'destructive'});
    } finally { setSaving(false); }
  };

  const deactivateAccount = async (id: string) => {
    if (!window.confirm('Deactivate this account?')) return;
    try {
      await financeService.deactivateAccount(id);
      toast({ title: 'Account deactivated' });
      fetchAccounts();
    } catch (e:any) {
      toast({ title:'Deactivate failed', description: e.message || 'Error', variant:'destructive'});
    }
  };
  const activateAccount = async (id: string) => {
    try {
      await financeService.activateAccount(id);
      toast({ title: 'Account activated' });
      fetchAccounts();
    } catch (e:any) {
      toast({ title:'Activate failed', description: e.message || 'Error', variant:'destructive'});
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading accounts...</span>
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
          <h1 className="text-3xl font-bold">Account Management</h1>
          <p className="text-muted-foreground">Create, view and deactivate financial accounts</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      </motion.div>

      {/* Summary Cards (removed obsolete Total Balance) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                  <p className="text-2xl font-bold">{accounts.filter(a=>a.isActive).length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                  <p className="text-2xl font-bold">{accounts.length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-600">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="erp-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              All Accounts ({accounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account, index) => (
                  <motion.tr
                    key={account.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-secondary"
                  >
                    <TableCell className="font-medium">{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell><Badge variant="outline">{account.type}</Badge></TableCell>
                    <TableCell>
                      <Badge className={account.isActive ? 'status-approved' : 'status-rejected'}>{account.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {account.isActive ? (
                        <Button variant="outline" size="sm" onClick={() => deactivateAccount(String(account.id))}>
                          <Power className="h-4 w-4 mr-1" />Deactivate
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => activateAccount(String(account.id))}>
                          <Power className="h-4 w-4 mr-1" />Activate
                        </Button>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name *</label>
                <Input value={newAccount.name} onChange={e=>setNewAccount(a=>({...a,name:e.target.value}))} placeholder="Salary Expense" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Code *</label>
                <Input value={newAccount.code} onChange={e=>setNewAccount(a=>({...a,code:e.target.value}))} placeholder="5001" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Type *</label>
              <Select value={newAccount.type} onValueChange={v=>setNewAccount(a=>({...a,type:v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map(t=> <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Input value={newAccount.description} onChange={e=>setNewAccount(a=>({...a,description:e.target.value}))} placeholder="Employee salaries" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}