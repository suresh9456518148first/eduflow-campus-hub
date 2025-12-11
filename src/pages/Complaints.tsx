import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { getComplaints, addComplaint, updateComplaintStatus } from '@/services/dataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const categories = ['Academics', 'Hostel', 'Mess', 'Exam', 'Other'];
const priorities = ['LOW', 'MEDIUM', 'HIGH'];

const statusConfig = {
  OPEN: { label: 'Open', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-500', icon: AlertCircle },
  RESOLVED: { label: 'Resolved', color: 'bg-green-500/20 text-green-500', icon: CheckCircle },
};

export default function Complaints() {
  const { user, isFacultyMode } = useApp();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  
  // Form state
  const [newComplaint, setNewComplaint] = useState({
    category: 'Academics',
    title: '',
    description: '',
    priority: 'MEDIUM'
  });
  
  useEffect(() => {
    loadComplaints();
  }, []);
  
  useEffect(() => {
    filterComplaints();
  }, [complaints, search, statusFilter, isFacultyMode, user]);
  
  const loadComplaints = () => {
    const data = getComplaints();
    setComplaints(data);
  };
  
  const filterComplaints = () => {
    let filtered = [...complaints];
    
    // In student mode, show only their complaints
    if (!isFacultyMode && user) {
      filtered = filtered.filter(c => c.authorId === user.id);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.id.toLowerCase().includes(searchLower) ||
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    setFilteredComplaints(filtered);
  };
  
  const handleSubmit = () => {
    if (!newComplaint.title || !newComplaint.description) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in title and description',
        variant: 'destructive'
      });
      return;
    }
    
    const complaint = addComplaint({
      ...newComplaint,
      author: user?.name || 'Anonymous',
      authorId: user?.id || '0',
    });
    
    loadComplaints();
    setIsDialogOpen(false);
    setNewComplaint({ category: 'Academics', title: '', description: '', priority: 'MEDIUM' });
    
    toast({
      title: 'Complaint submitted!',
      description: `Your ticket ID is ${complaint.id}`,
    });
  };
  
  const handleStatusChange = (id: string, newStatus: string) => {
    updateComplaintStatus(id, newStatus, responseText || undefined);
    setResponseText('');
    loadComplaints();
    
    toast({
      title: 'Status updated',
      description: `Complaint ${id} is now ${newStatus}`,
    });
  };
  
  return (
    <Layout 
      title={isFacultyMode ? "Complaints Management" : "My Complaints"}
      subtitle={isFacultyMode ? "Review and resolve student complaints" : "Track your submitted complaints"}
    >
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket ID or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
          
          {!isFacultyMode && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Raise Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    Raise a Complaint
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Category</label>
                      <Select 
                        value={newComplaint.category} 
                        onValueChange={(v) => setNewComplaint(prev => ({ ...prev, category: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Priority</label>
                      <Select 
                        value={newComplaint.priority} 
                        onValueChange={(v) => setNewComplaint(prev => ({ ...prev, priority: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input
                      placeholder="Brief summary of the issue"
                      value={newComplaint.title}
                      onChange={(e) => setNewComplaint(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Textarea
                      placeholder="Describe the issue in detail..."
                      rows={4}
                      value={newComplaint.description}
                      onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  
                  <Button onClick={handleSubmit} className="w-full btn-glow">
                    Submit Complaint
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Faculty Table View */}
      {isFacultyMode ? (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => {
                const StatusIcon = statusConfig[complaint.status as keyof typeof statusConfig].icon;
                return (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                    <TableCell>{complaint.category}</TableCell>
                    <TableCell className="max-w-xs truncate">{complaint.title}</TableCell>
                    <TableCell>{complaint.author}</TableCell>
                    <TableCell>
                      <Badge variant={complaint.priority === 'HIGH' ? 'destructive' : complaint.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[complaint.status as keyof typeof statusConfig].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[complaint.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={complaint.status}
                        onValueChange={(v) => handleStatusChange(complaint.id, v)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Student Card View */
        <div className="space-y-4">
          {filteredComplaints.map((complaint, index) => {
            const StatusIcon = statusConfig[complaint.status as keyof typeof statusConfig].icon;
            return (
              <div 
                key={complaint.id}
                className="glass-card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {complaint.id}
                      </code>
                      <Badge variant="outline">{complaint.category}</Badge>
                      <Badge className={statusConfig[complaint.status as keyof typeof statusConfig].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[complaint.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{complaint.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{complaint.description}</p>
                    
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(complaint.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {complaint.responses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Responses
                    </h4>
                    <div className="space-y-3">
                      {complaint.responses.map((response: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{response.by}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(response.at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {filteredComplaints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{isFacultyMode ? 'No complaints to review' : 'No complaints submitted yet'}</p>
        </div>
      )}
    </Layout>
  );
}
