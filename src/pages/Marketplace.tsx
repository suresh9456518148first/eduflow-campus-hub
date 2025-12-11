import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { getMarketplaceItems, addMarketplaceItem, addMessage } from '@/services/dataService';
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
  Search, 
  Star, 
  ExternalLink,
  ShoppingBag,
  Tag,
  MessageCircle,
  Send
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const categories = ['All', 'Notes', 'Course', 'Templates', 'Resources', 'Career'];

export default function Marketplace() {
  const { user } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState('');
  
  // Form state
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    tags: '',
    demoUrl: '',
    category: 'Notes'
  });
  
  useEffect(() => {
    loadItems();
  }, []);
  
  useEffect(() => {
    filterItems();
  }, [items, search, categoryFilter, priceFilter]);
  
  const loadItems = () => {
    const data = getMarketplaceItems();
    setItems(data);
  };
  
  const filterItems = () => {
    let filtered = [...items];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.tags.some((t: string) => t.toLowerCase().includes(searchLower))
      );
    }
    
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    if (priceFilter === 'Free') {
      filtered = filtered.filter(item => item.price === 0);
    } else if (priceFilter === 'Paid') {
      filtered = filtered.filter(item => item.price > 0);
    }
    
    setFilteredItems(filtered);
  };
  
  const handleSubmit = () => {
    if (!newItem.title || !newItem.description) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in title and description',
        variant: 'destructive'
      });
      return;
    }
    
    addMarketplaceItem({
      ...newItem,
      price: parseInt(newItem.price) || 0,
      tags: newItem.tags.split(',').map(t => t.trim()).filter(Boolean),
      author: user?.name || 'Anonymous',
      authorId: user?.id || '0',
    });
    
    loadItems();
    setIsAddDialogOpen(false);
    setNewItem({ title: '', description: '', price: '', tags: '', demoUrl: '', category: 'Notes' });
    
    toast({
      title: 'Listing created!',
      description: 'Your item is now visible in the marketplace.',
    });
  };
  
  const handleRequest = () => {
    if (!requestMessage.trim()) {
      toast({
        title: 'Message required',
        description: 'Please write a message to the seller',
        variant: 'destructive'
      });
      return;
    }
    
    addMessage({
      itemId: selectedItem.id,
      sellerId: selectedItem.authorId,
      buyerId: user?.id,
      buyerName: user?.name,
      message: requestMessage
    });
    
    setIsRequestDialogOpen(false);
    setRequestMessage('');
    
    toast({
      title: 'Request sent!',
      description: 'The seller will be notified of your interest.',
    });
  };
  
  return (
    <Layout 
      title="Marketplace" 
      subtitle="Buy, sell, and share resources with your peers"
    >
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Create Listing
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    placeholder="What are you offering?"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    placeholder="Describe your offering..."
                    rows={3}
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select 
                      value={newItem.category} 
                      onValueChange={(v) => setNewItem(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== 'All').map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Price (₹)</label>
                    <Input
                      type="number"
                      placeholder="0 for free"
                      value={newItem.price}
                      onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
                  <Input
                    placeholder="React, Notes, Interview..."
                    value={newItem.tags}
                    onChange={(e) => setNewItem(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Demo URL (optional)</label>
                  <Input
                    placeholder="https://github.com/..."
                    value={newItem.demoUrl}
                    onChange={(e) => setNewItem(prev => ({ ...prev, demoUrl: e.target.value }))}
                  />
                </div>
                
                <Button onClick={handleSubmit} className="w-full btn-glow">
                  Create Listing
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => (
          <div 
            key={item.id} 
            className="glass-card-hover p-6 animate-slide-up flex flex-col"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <Badge variant="outline">{item.category}</Badge>
              <span className="font-bold text-lg">
                {item.price === 0 ? (
                  <span className="text-success">Free</span>
                ) : (
                  <span className="text-accent">₹{item.price}</span>
                )}
              </span>
            </div>
            
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
              {item.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] text-white font-bold">
                  {item.author.charAt(0)}
                </div>
                <span className="text-sm text-muted-foreground">{item.author}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  {item.rating}
                </div>
                
                {item.demoUrl && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={item.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedItem(item);
                    setIsRequestDialogOpen(true);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Request
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No items found. Add the first listing!</p>
        </div>
      )}
      
      {/* Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request: {selectedItem?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Send a message to {selectedItem?.author} about this resource.
            </p>
            
            <Textarea
              placeholder="Hi, I'm interested in your resource..."
              rows={4}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
            />
            
            <Button onClick={handleRequest} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
