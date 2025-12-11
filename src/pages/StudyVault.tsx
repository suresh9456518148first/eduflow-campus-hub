import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { getPapers, addPaper, incrementDownload, updateStudentXP } from '@/services/dataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Plus, 
  Search, 
  Download,
  FileText,
  Upload,
  Filter,
  BookOpen,
  Calendar,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const branches = ['All', 'CSE', 'IT', 'ECE', 'ME', 'CE'];
const types = ['All', 'PYQ', 'CT', 'Notes', 'Book'];
const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

const typeColors: Record<string, string> = {
  PYQ: 'bg-blue-500/20 text-blue-400',
  CT: 'bg-purple-500/20 text-purple-400',
  Notes: 'bg-green-500/20 text-green-400',
  Book: 'bg-orange-500/20 text-orange-400',
};

export default function StudyVault() {
  const { user } = useApp();
  const [papers, setPapers] = useState<any[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [newPaper, setNewPaper] = useState({
    title: '',
    subject: '',
    branch: 'CSE',
    semester: '1',
    type: 'PYQ',
    year: new Date().getFullYear().toString(),
    fileSize: '1.5 MB'
  });
  
  useEffect(() => {
    loadPapers();
  }, []);
  
  useEffect(() => {
    filterPapers();
  }, [papers, search, branchFilter, typeFilter, semesterFilter]);
  
  const loadPapers = () => {
    const data = getPapers();
    setPapers(data);
  };
  
  const filterPapers = () => {
    let filtered = [...papers];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(paper => 
        paper.title.toLowerCase().includes(searchLower) ||
        paper.subject.toLowerCase().includes(searchLower)
      );
    }
    
    if (branchFilter !== 'All') {
      filtered = filtered.filter(paper => paper.branch === branchFilter);
    }
    
    if (typeFilter !== 'All') {
      filtered = filtered.filter(paper => paper.type === typeFilter);
    }
    
    if (semesterFilter !== 'All') {
      filtered = filtered.filter(paper => paper.semester === parseInt(semesterFilter));
    }
    
    setFilteredPapers(filtered);
  };
  
  const handleSubmit = () => {
    if (!newPaper.title || !newPaper.subject) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in title and subject',
        variant: 'destructive'
      });
      return;
    }
    
    addPaper({
      ...newPaper,
      semester: parseInt(newPaper.semester),
      year: parseInt(newPaper.year),
      uploader: user?.name || 'Anonymous',
      uploaderId: user?.id || '0',
    });
    
    if (user) {
      updateStudentXP(user.id, 30);
    }
    
    loadPapers();
    setIsDialogOpen(false);
    setNewPaper({
      title: '',
      subject: '',
      branch: 'CSE',
      semester: '1',
      type: 'PYQ',
      year: new Date().getFullYear().toString(),
      fileSize: '1.5 MB'
    });
    
    toast({
      title: 'Resource uploaded!',
      description: 'You earned 30 XP for sharing study material.',
    });
  };
  
  const handleDownload = (paper: any) => {
    incrementDownload(paper.id);
    loadPapers();
    
    // Simulate download
    toast({
      title: 'Download started',
      description: `Downloading ${paper.title}...`,
    });
  };
  
  return (
    <Layout 
      title="Study Vault" 
      subtitle="Access and share study materials, PYQs, and notes"
    >
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search papers, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Sem" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map(s => (
                <SelectItem key={s} value={s}>{s === 'All' ? 'All Sem' : `Sem ${s}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-glow">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Upload Study Material
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    placeholder="e.g., Data Structures Mid-Sem 2023"
                    value={newPaper.title}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Subject</label>
                  <Input
                    placeholder="e.g., Data Structures"
                    value={newPaper.subject}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Branch</label>
                    <Select 
                      value={newPaper.branch} 
                      onValueChange={(v) => setNewPaper(prev => ({ ...prev, branch: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.filter(b => b !== 'All').map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Semester</label>
                    <Select 
                      value={newPaper.semester} 
                      onValueChange={(v) => setNewPaper(prev => ({ ...prev, semester: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.filter(s => s !== 'All').map(s => (
                          <SelectItem key={s} value={s}>Semester {s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <Select 
                      value={newPaper.type} 
                      onValueChange={(v) => setNewPaper(prev => ({ ...prev, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {types.filter(t => t !== 'All').map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Year</label>
                    <Input
                      type="number"
                      value={newPaper.year}
                      onChange={(e) => setNewPaper(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to upload PDF
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Demo mode - file upload simulated)
                  </p>
                </div>
                
                <Button onClick={handleSubmit} className="w-full btn-glow">
                  Upload Resource
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPapers.map((paper, index) => (
          <div 
            key={paper.id}
            className="glass-card-hover p-6 animate-slide-up flex flex-col"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <Badge className={typeColors[paper.type] || 'bg-muted'}>
                {paper.type}
              </Badge>
            </div>
            
            <h3 className="font-semibold mb-1 line-clamp-2">{paper.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{paper.subject}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">{paper.branch}</Badge>
              <Badge variant="outline">Sem {paper.semester}</Badge>
              <Badge variant="outline">{paper.year}</Badge>
            </div>
            
            <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {paper.downloads} downloads
                </p>
                <p className="text-xs">{paper.fileSize}</p>
              </div>
              
              <Button onClick={() => handleDownload(paper)} size="sm">
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredPapers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No resources found. Be the first to upload!</p>
        </div>
      )}
    </Layout>
  );
}
