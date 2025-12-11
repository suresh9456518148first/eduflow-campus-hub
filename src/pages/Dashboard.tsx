import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { getDashboardStats, getLeaderboard } from '@/services/dataService';
import { 
  Lightbulb, 
  ShoppingBag, 
  AlertCircle, 
  CalendarCheck, 
  Calendar, 
  Trophy,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  href: string;
  color: 'primary' | 'secondary' | 'accent' | 'destructive' | 'success';
  delay: number;
}

const colorClasses = {
  primary: 'from-primary/20 to-primary/5 border-primary/30 hover:border-primary/50',
  secondary: 'from-secondary/20 to-secondary/5 border-secondary/30 hover:border-secondary/50',
  accent: 'from-accent/20 to-accent/5 border-accent/30 hover:border-accent/50',
  destructive: 'from-destructive/20 to-destructive/5 border-destructive/30 hover:border-destructive/50',
  success: 'from-success/20 to-success/5 border-success/30 hover:border-success/50',
};

const iconColorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  destructive: 'text-destructive',
  success: 'text-success',
};

function StatCard({ title, value, icon: Icon, href, color, delay }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <Link 
      to={href}
      className={cn(
        "glass-card-hover p-6 block animate-slide-up",
        "bg-gradient-to-br border",
        colorClasses[color]
      )}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="stat-number">{displayValue}</p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          "bg-gradient-to-br from-background/50 to-background/30"
        )}>
          <Icon className={cn("w-6 h-6", iconColorClasses[color])} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowUpRight className="w-4 h-4" />
        <span>View details</span>
      </div>
    </Link>
  );
}

function LeaderboardCard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  useEffect(() => {
    setLeaderboard(getLeaderboard(5));
  }, []);
  
  const getBadgeStyle = (index: number) => {
    if (index === 0) return 'badge-gold';
    if (index === 1) return 'badge-silver';
    if (index === 2) return 'badge-bronze';
    return 'bg-muted text-muted-foreground';
  };
  
  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Top Contributors</h3>
      </div>
      <div className="space-y-4">
        {leaderboard.map((student, index) => (
          <div key={student.id} className="flex items-center gap-3">
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              getBadgeStyle(index)
            )}>
              {index + 1}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs text-primary-foreground font-bold">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{student.name}</p>
              <p className="text-xs text-muted-foreground">{student.branch}</p>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Zap className="w-4 h-4 text-accent" />
              <span className="font-medium">{student.xp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: 'Submit Idea', href: '/collaboration', icon: Lightbulb },
    { label: 'Raise Complaint', href: '/complaints', icon: AlertCircle },
    { label: 'Mark Attendance', href: '/attendance', icon: CalendarCheck },
    { label: 'Browse Papers', href: '/study-vault', icon: TrendingUp },
  ];
  
  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <action.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useApp();
  const [stats, setStats] = useState({
    ideasCount: 0,
    marketplaceCount: 0,
    openComplaints: 0,
    upcomingEvents: 0,
    attendanceWarnings: 0,
    totalStudents: 0
  });
  
  useEffect(() => {
    setStats(getDashboardStats());
  }, []);
  
  return (
    <Layout 
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Student'}!`}
      subtitle="Here's what's happening on campus today"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Ideas Shared"
          value={stats.ideasCount}
          icon={Lightbulb}
          href="/collaboration"
          color="primary"
          delay={0}
        />
        <StatCard
          title="Marketplace Items"
          value={stats.marketplaceCount}
          icon={ShoppingBag}
          href="/marketplace"
          color="secondary"
          delay={1}
        />
        <StatCard
          title="Open Complaints"
          value={stats.openComplaints}
          icon={AlertCircle}
          href="/complaints"
          color="destructive"
          delay={2}
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={Calendar}
          href="/events"
          color="accent"
          delay={3}
        />
        <StatCard
          title="Low Attendance"
          value={stats.attendanceWarnings}
          icon={CalendarCheck}
          href="/attendance"
          color={stats.attendanceWarnings > 0 ? 'destructive' : 'success'}
          delay={4}
        />
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <LeaderboardCard />
        </div>
        
        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
      
      {/* Attendance Overview */}
      {user && (
        <div className="mt-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <CalendarCheck className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Your Attendance Overview</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(user.attendance).map(([subject, percentage]) => (
              <div key={subject} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="4"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={percentage >= 75 ? 'hsl(var(--success))' : percentage >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
                      strokeWidth="4"
                      strokeDasharray={`${(percentage / 100) * 176} 176`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {percentage}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{subject}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
