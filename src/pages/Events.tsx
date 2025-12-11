import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { getEvents, registerForEvent, isRegisteredForEvent, updateStudentXP } from '@/services/dataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Search, 
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Star,
  Sparkles,
  Trophy,
  Music,
  Code,
  Mic,
  Dumbbell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const categoryIcons: Record<string, any> = {
  Festival: Sparkles,
  Workshop: Code,
  Competition: Trophy,
  Cultural: Music,
  Seminar: Mic,
  Sports: Dumbbell,
};

const categoryColors: Record<string, string> = {
  Festival: 'from-purple-500 to-pink-500',
  Workshop: 'from-blue-500 to-cyan-500',
  Competition: 'from-orange-500 to-red-500',
  Cultural: 'from-pink-500 to-rose-500',
  Seminar: 'from-green-500 to-emerald-500',
  Sports: 'from-yellow-500 to-orange-500',
};

export default function Events() {
  const { user } = useApp();
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    loadEvents();
  }, []);
  
  useEffect(() => {
    filterEvents();
  }, [events, search]);
  
  const loadEvents = () => {
    const data = getEvents();
    setEvents(data);
    
    // Check registrations
    if (user) {
      const registered = new Set<string>();
      data.forEach((event: any) => {
        if (isRegisteredForEvent(event.id, user.id)) {
          registered.add(event.id);
        }
      });
      setRegisteredEvents(registered);
    }
  };
  
  const filterEvents = () => {
    let filtered = [...events];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.category.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredEvents(filtered);
  };
  
  const handleRegister = (eventId: string) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to register for events',
        variant: 'destructive'
      });
      return;
    }
    
    if (registeredEvents.has(eventId)) {
      toast({
        title: 'Already registered',
        description: 'You have already registered for this event',
      });
      return;
    }
    
    const success = registerForEvent(eventId, user.id);
    
    if (success) {
      updateStudentXP(user.id, 25);
      setRegisteredEvents(prev => new Set([...prev, eventId]));
      loadEvents();
      
      toast({
        title: 'Registered successfully!',
        description: 'You earned 25 XP for registering.',
      });
    }
  };
  
  const upcomingEvents = filteredEvents.filter(e => e.isUpcoming);
  const pastEvents = filteredEvents.filter(e => !e.isUpcoming);
  
  const EventCard = ({ event, index }: { event: any; index: number }) => {
    const CategoryIcon = categoryIcons[event.category] || Calendar;
    const isRegistered = registeredEvents.has(event.id);
    const isFull = event.registrations >= event.maxCapacity;
    
    return (
      <div 
        className="glass-card-hover overflow-hidden animate-slide-up cursor-pointer"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => setSelectedEvent(event)}
      >
        {/* Gradient header */}
        <div className={cn(
          "h-32 relative bg-gradient-to-br",
          categoryColors[event.category] || 'from-primary to-secondary'
        )}>
          <div className="absolute inset-0 bg-black/20" />
          <CategoryIcon className="absolute top-4 right-4 w-12 h-12 text-white/30" />
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
              {event.category}
            </Badge>
          </div>
          {isRegistered && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-success text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Registered
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {event.description}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {event.time}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {event.venue}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{event.registrations}/{event.maxCapacity}</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(event.registrations / event.maxCapacity) * 100}%` }}
                />
              </div>
            </div>
            
            {event.isUpcoming && (
              <Button
                size="sm"
                variant={isRegistered ? "secondary" : "default"}
                disabled={isRegistered || isFull}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegister(event.id);
                }}
              >
                {isRegistered ? 'Registered' : isFull ? 'Full' : 'Register'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Layout 
      title="Events" 
      subtitle="Discover and register for campus events"
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Past Events ({pastEvents.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
          
          {upcomingEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
          
          {pastEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No past events found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          {selectedEvent && (
            <>
              <div className={cn(
                "h-40 -mx-6 -mt-6 mb-4 relative bg-gradient-to-br",
                categoryColors[selectedEvent.category] || 'from-primary to-secondary'
              )}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-4 left-6">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm mb-2">
                    {selectedEvent.category}
                  </Badge>
                  <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">{selectedEvent.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="glass-card p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{selectedEvent.time}</span>
                    </div>
                  </div>
                  <div className="glass-card p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{selectedEvent.venue}</span>
                    </div>
                  </div>
                  <div className="glass-card p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{selectedEvent.registrations}/{selectedEvent.maxCapacity} registered</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Organized by: {selectedEvent.organizer}
                </p>
                
                {selectedEvent.isUpcoming && (
                  <Button 
                    className="w-full btn-glow"
                    disabled={registeredEvents.has(selectedEvent.id) || selectedEvent.registrations >= selectedEvent.maxCapacity}
                    onClick={() => handleRegister(selectedEvent.id)}
                  >
                    {registeredEvents.has(selectedEvent.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Already Registered
                      </>
                    ) : selectedEvent.registrations >= selectedEvent.maxCapacity ? (
                      'Event Full'
                    ) : (
                      'Register Now'
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
