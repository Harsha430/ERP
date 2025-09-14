import { useEffect, useState, useMemo } from 'react';
import { hrService } from '@/services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Layers, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PositionRec {
  id: string;
  title: string;
  description?: string;
  departmentId?: string;
  minSalary?: number;
  maxSalary?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function Positions() {
  const { toast } = useToast();
  const [positions, setPositions] = useState<PositionRec[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(()=> { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [pos, depts] = await Promise.all([
        hrService.getPositions().catch(()=>[]),
        hrService.getDepartments().catch(()=>[])
      ]);
      setPositions(pos);
      setDepartments(depts.map((d:any)=> d.name || d.id).filter(Boolean));
    } catch (e:any) {
      toast({ title:'Failed to load positions', description:e.message||'Error', variant:'destructive'});
    } finally { setLoading(false); }
  };

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = useMemo(()=> positions.filter(p => {
    const matchesDept = deptFilter==='all' || p.departmentId===deptFilter;
    const t = searchTerm.toLowerCase();
    const matchesSearch = !t || p.title?.toLowerCase().includes(t) || p.description?.toLowerCase().includes(t);
    return matchesDept && matchesSearch;
  }), [positions, deptFilter, searchTerm]);

  if (loading) return <div className='flex items-center justify-center min-h-[300px] gap-2'><RefreshCw className='h-5 w-5 animate-spin'/><span>Loading positions...</span></div>;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'><Layers className='h-7 w-7'/>Positions</h1>
          <p className='text-muted-foreground'>Directory of defined job positions (read-only)</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={refresh} disabled={refreshing}>
            <RefreshCw className={'h-4 w-4 mr-2 '+(refreshing?'animate-spin':'')}/>Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='h-4 w-4 absolute left-2 top-2.5 text-muted-foreground'/>
              <Input placeholder='Search positions...' value={searchTerm} onChange={e=> setSearchTerm(e.target.value)} className='pl-8'/>
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className='w-full md:w-60'><SelectValue placeholder='Department'/></SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Departments</SelectItem>
                {departments.map(d=> <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Positions ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Salary Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p=> (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className='font-medium'>{p.title}</div>
                    <div className='text-xs text-muted-foreground max-w-[260px] truncate'>{p.description}</div>
                  </TableCell>
                  <TableCell className='text-xs'>{p.departmentId || '-'}</TableCell>
                  <TableCell className='text-xs'>
                    {p.minSalary || p.maxSalary ? `${p.minSalary ?? ''}${p.minSalary && p.maxSalary ? ' - ' : ''}${p.maxSalary ?? ''}` : '-'}
                  </TableCell>
                  <TableCell>{p.isActive? <Badge className='status-approved'>Active</Badge>: <Badge variant='secondary'>Inactive</Badge>}</TableCell>
                  <TableCell className='text-xs'>{p.updatedAt? String(p.updatedAt).split('T')[0]: '-'}</TableCell>
                </TableRow>
              ))}
              {!filtered.length && <TableRow><TableCell colSpan={5} className='text-center py-6 text-muted-foreground'>No positions found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

