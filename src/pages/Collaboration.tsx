import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { getIdeas, addIdea, supportIdea, updateStudentXP } from '@/services/dataService';
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
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  Search, 
  Filter,
  Sparkles,
  Calendar,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const branches = ['All', 'CSE', 'IT', 'ECE', 'ME', 'CE'];
const years = ['All', '1', '2', '3', '4'];

export default function Collaboration() {
  const { user } = useApp();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [supportedIds, setSupportedIds] = useState<Set<string>>(new Set());
  
  // Form state
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    tags: ''
  });
  
  useEffect(() => {
    loadIdeas();
  }, []);
  
  useEffect(() => {
    filterIdeas();
  }, [ideas, search, branchFilter, yearFilter]);
  
  const loadIdeas = () => {
    const data = getIdeas();
    setIdeas(data);
  };
  
  const filterIdeas = () => {
    let filtered = [...ideas];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchLower) ||
        idea.description.toLowerCase().includes(searchLower) ||
        idea.tags.some((t: string) => t.toLowerCase().includes(searchLower))
      );
    }
    
    if (branchFilter !== 'All') {
      filtered = filtered.filter(idea => idea.branch === branchFilter);
    }
    
    if (yearFilter !== 'All') {
      filtered = filtered.filter(idea => idea.year === parseInt(yearFilter));
    }
    
    setFilteredIdeas(filtered);
  };
  
  const handleSubmit = () => {
    if (!newIdea.title || !newIdea.description) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in title and description',
        variant: 'destructive'
      });
      return;
    }
    
    const idea = addIdea({
      ...newIdea,
      tags: newIdea.tags.split(',').map(t => t.trim()).filter(Boolean),
      author: user?.name || 'Anonymous',
      authorId: user?.id || '0',
      branch: user?.branch || 'CSE',
      year: user?.year || 1,
      attachments: []
    });
    
    if (user) {
      updateStudentXP(user.id, 50);
    }
    
    loadIdeas();
    setIsDialogOpen(false);
    setNewIdea({ title: '', description: '', tags: '' });
    
    toast({
      title: 'Idea submitted!',
      description: 'You earned 50 XP for sharing your idea.',
    });
  };
  
  const handleSupport = (ideaId: string) => {
    if (supportedIds.has(ideaId)) {
      toast({
        title: 'Already supported',
        description: 'You have already supported this idea',
      });
      return;
    }
    
    supportIdea(ideaId);
    setSupportedIds(prev => new Set([...prev, ideaId]));
    
    if (user) {
      updateStudentXP(user.id, 10);
    }
    
    loadIdeas();
    
    toast({
      title: 'Support added!',
      description: 'You earned 10 XP for supporting an idea.',
    });
  };
  
  return (
    <Layout 
      title="Collaboration Hub" 
      subtitle="Share ideas, get support, and collaborate with peers"
    >
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-glow">
                <Plus className="w-4 h-4 mr-2" />
                Share Idea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Share Your Idea
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    placeholder="Give your idea a catchy title"
                    value={newIdea.title}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    placeholder="Describe your idea in detail..."
                    rows={4}
                    value={newIdea.description}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
                  <Input
                    placeholder="AI, Mobile, Web..."
                    value={newIdea.tags}
                    onChange={(e) => setNewIdea(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                
                <Button onClick={handleSubmit} className="w-full btn-glow">
                  Submit Idea
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.map((idea, index) => (
          <div 
            key={idea.id} 
            className="glass-card-hover p-6 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg">{idea.title}</h3>
              <Badge variant="secondary">{idea.branch}</Badge>
            </div>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {idea.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {idea.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Year {idea.year}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSupport(idea.id)}
                  className={cn(
                    "gap-1",
                    supportedIds.has(idea.id) && "text-primary"
                  )}
                >
                  <ThumbsUp className={cn(
                    "w-4 h-4",
                    supportedIds.has(idea.id) && "fill-current"
                  )} />
                  {idea.supports}
                </Button>
                
                <Button variant="ghost" size="sm" className="gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {idea.comments}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredIdeas.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No ideas found. Be the first to share!</p>
        </div>
      )}
    </Layout>
  );
}
