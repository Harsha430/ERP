// Position Management Page
import { useEffect, useState, useMemo } from 'react';
import { hrService } from '@/services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, RefreshCw, Search, Edit2, X, Save, Layers, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtil';

interface Position {
  id?: string;
  title: string;
  description?: string;
  departmentId?: string;
}

export default function Positions() {
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [form, setForm] = useState<Position>({ title:'', description:'' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(()=> { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const posData = await hrService.getPositions();
      setPositions(posData);
    } catch (e:any) {
      toast({ title:'Load failed', description:e.message||'Error', variant:'destructive'});
    } finally { setLoading(false); }
  };

  const search = async (term:string) => {
    // This will require a backend search endpoint for positions
    if (!term) { fetchAll(); return; }
    if (term.length < 2) return;
    // try {
    //   const res = await hrService.searchPositions(term);
    //   setPositions(res);
    // } catch {}
    const filtered = positions.filter(p => p.title.toLowerCase().includes(term.toLowerCase()));
    setPositions(filtered);
  };

  useEffect(()=> { const t=setTimeout(()=> search(searchTerm), 400); return ()=> clearTimeout(t); }, [searchTerm]);

  const openCreate = () => { setForm({ title:'', description:'' }); setEditingPos(null); setCreating(true); };
  const openEdit = (pos:Position) => { setForm({ ...pos }); setEditingPos(pos); setCreating(true); };

  const save = async () => {
    if (!form.title.trim()) { toast({ title:'Title required', variant:'destructive'}); return; }
    try {
      setSaving(true);
      if (editingPos && editingPos.id) {
        // await hrService.updatePosition(editingPos.id, form);
        toast({ title:'Position updated'});
      } else {
        // await hrService.createPosition(form);
        toast({ title:'Position created'});
      }
      setCreating(false);
      fetchAll();
    } catch (e:any) { toast({ title:'Save failed', description:e.message||'Error', variant:'destructive'}); }
    finally { setSaving(false); }
  };

  const remove = async (pos:Position) => {
    if (!pos.id) return;
    if (!window.confirm('Delete position?')) return;
    try {
      // await hrService.deletePosition(pos.id);
      setPositions(list=> list.filter(p=> p.id!==pos.id));
      toast({ title:'Deleted'});
    } catch (e:any) { toast({ title:'Delete failed', description:e.message||'Error', variant:'destructive'}); }
  };

  const exportCSV = () => {
    exportToCSV('positions.csv', positions.map(p=> ({ id:p.id, title:p.title, description:p.description })) );
  };

  const refresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  if (loading) return <div className='flex items-center justify-center min-h-[300px] gap-2'><RefreshCw className='h-5 w-5 animate-spin'/><span>Loading positions...</span></div>;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'><Layers className='h-7 w-7'/>Positions</h1>
          <p className='text-muted-foreground'>Manage company job positions</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={exportCSV}><Download className='h-4 w-4 mr-2'/>Export</Button>
          <Button variant='outline' onClick={refresh} disabled={refreshing}><RefreshCw className={'h-4 w-4 mr-2 '+(refreshing?'animate-spin':'')}/>Refresh</Button>
          <Button onClick={openCreate}><Plus className='h-4 w-4 mr-2'/>New</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Search</CardTitle></CardHeader>
        <CardContent>
          <div className='relative'>
            <Search className='h-4 w-4 absolute left-2 top-2.5 text-muted-foreground'/>
            <Input className='pl-8' placeholder='Search positions (min 2 chars)...' value={searchTerm} onChange={e=> setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Position List</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map(p=> (
                <TableRow key={p.id||p.title}>
                  <TableCell>
                    <div className='font-medium'>{p.title}</div>
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground max-w-md truncate'>{p.description}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button size='sm' variant='outline' onClick={()=> openEdit(p)}><Edit2 className='h-4 w-4'/></Button>
                      <Button size='sm' variant='outline' onClick={()=> remove(p)}><X className='h-4 w-4 text-red-500'/></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {positions.length===0 && <TableRow><TableCell colSpan={3} className='text-center py-6 text-muted-foreground'>No positions found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader><DialogTitle>{editingPos? 'Edit Position':'New Position'}</DialogTitle></DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-1'>
              <label className='text-xs font-medium'>Title *</label>
              <Input value={form.title} onChange={e=> setForm(f=> ({...f, title:e.target.value}))} />
            </div>
            <div className='space-y-1'>
              <label className='text-xs font-medium'>Description</label>
              <Input value={form.description} onChange={e=> setForm(f=> ({...f, description:e.target.value}))} />
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

