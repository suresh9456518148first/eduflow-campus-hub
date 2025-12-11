import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { getStudentById } from '@/services/dataService';
import { generateAttendanceQR, verifyAttendanceQR, generateSessionId } from '@/services/qrService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  QrCode, 
  ScanLine, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function Attendance() {
  const { user } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [qrData, setQrData] = useState<{ url: string; payload: any } | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [searchRoll, setSearchRoll] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<any>(null);
  
  const subjects = user ? Object.keys(user.attendance) : [];
  
  const handleGenerateQR = async () => {
    if (!selectedSubject || !user) return;
    
    const sessionId = generateSessionId(selectedSubject);
    const result = await generateAttendanceQR(user.id, selectedSubject, sessionId);
    setQrData({ url: result.qrDataUrl, payload: result.payload });
    setIsQRDialogOpen(true);
  };
  
  const handleVerifyQR = () => {
    if (!scanInput.trim()) {
      toast({
        title: 'No data',
        description: 'Please paste the QR code data',
        variant: 'destructive'
      });
      return;
    }
    
    // Get current location for verification
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result = verifyAttendanceQR(scanInput, position.coords.latitude, position.coords.longitude);
        setVerificationResult(result);
        
        if (result.valid) {
          toast({
            title: 'Success!',
            description: 'Attendance marked successfully',
          });
        }
      },
      () => {
        // No location, verify without location check
        const result = verifyAttendanceQR(scanInput);
        setVerificationResult(result);
        
        if (result.valid) {
          toast({
            title: 'Success!',
            description: 'Attendance marked (location not verified)',
          });
        }
      }
    );
  };
  
  const handleSearchStudent = () => {
    if (!searchRoll.trim()) return;
    const student = getStudentById(searchRoll);
    setSearchedStudent(student);
    
    if (!student) {
      toast({
        title: 'Not found',
        description: 'No student found with this Roll No',
        variant: 'destructive'
      });
    }
  };
  
  const displayStudent = searchedStudent || user;
  
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };
  
  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) return { label: 'Safe', icon: CheckCircle, color: 'bg-success/20 text-success' };
    if (percentage >= 60) return { label: 'Warning', icon: AlertTriangle, color: 'bg-warning/20 text-warning' };
    return { label: 'Danger', icon: XCircle, color: 'bg-destructive/20 text-destructive' };
  };
  
  return (
    <Layout 
      title="Attendance" 
      subtitle="Track your attendance and generate QR codes"
    >
      <Tabs defaultValue="view" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="view" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            View Attendance
          </TabsTrigger>
          <TabsTrigger value="generate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <QrCode className="w-4 h-4 mr-2" />
            Generate QR
          </TabsTrigger>
          <TabsTrigger value="mark" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ScanLine className="w-4 h-4 mr-2" />
            Mark Attendance
          </TabsTrigger>
        </TabsList>
        
        {/* View Attendance */}
        <TabsContent value="view" className="space-y-6">
          {/* Search */}
          <div className="glass-card p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by Roll No (e.g., 220101)"
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()}
              />
              <Button onClick={handleSearchStudent}>Search</Button>
              {searchedStudent && (
                <Button variant="ghost" onClick={() => setSearchedStudent(null)}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {displayStudent && (
            <>
              {/* Student Info */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl text-white font-bold">
                    {displayStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{displayStudent.name}</h3>
                    <p className="text-muted-foreground">
                      {displayStudent.id} • {displayStudent.branch} • Year {displayStudent.year}
                    </p>
                  </div>
                </div>
                
                {/* Overall Attendance */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Overall Attendance</p>
                    <p className={cn(
                      "text-3xl font-bold",
                      getAttendanceColor(
                        Math.round((Object.values(displayStudent.attendance) as number[]).reduce((a, b) => a + b, 0) / Object.values(displayStudent.attendance).length)
                      )
                    )}>
                      {Math.round((Object.values(displayStudent.attendance) as number[]).reduce((a, b) => a + b, 0) / Object.values(displayStudent.attendance).length)}%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Subject-wise Attendance */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(displayStudent.attendance).map(([subject, percentage]: [string, any], index) => {
                  const status = getAttendanceStatus(percentage);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div 
                      key={subject}
                      className="glass-card p-6 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold">{subject}</h4>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-end gap-4">
                        <span className={cn("text-4xl font-bold", getAttendanceColor(percentage))}>
                          {percentage}%
                        </span>
                        
                        <div className="flex-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                percentage >= 75 ? "bg-success" : percentage >= 60 ? "bg-warning" : "bg-destructive"
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {percentage >= 75 ? 'On track' : percentage >= 60 ? 'Need to improve' : 'Critical'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Generate QR */}
        <TabsContent value="generate">
          <div className="max-w-md mx-auto">
            <div className="glass-card p-6 space-y-6">
              <div className="text-center">
                <QrCode className="w-16 h-16 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Generate Attendance QR</h3>
                <p className="text-muted-foreground text-sm">
                  Select a subject to generate your unique attendance QR code
                </p>
              </div>
              
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleGenerateQR} 
                disabled={!selectedSubject}
                className="w-full btn-glow"
              >
                Generate QR Code
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Mark Attendance */}
        <TabsContent value="mark">
          <div className="max-w-lg mx-auto">
            <div className="glass-card p-6 space-y-6">
              <div className="text-center">
                <ScanLine className="w-16 h-16 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Mark Attendance</h3>
                <p className="text-muted-foreground text-sm">
                  Paste the QR code data to verify and mark your attendance
                </p>
              </div>
              
              <Textarea
                placeholder='Paste QR code data here (JSON format)...'
                rows={6}
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="font-mono text-sm"
              />
              
              <Button 
                onClick={handleVerifyQR}
                className="w-full btn-glow"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Verify & Mark Attendance
              </Button>
              
              {verificationResult && (
                <div className={cn(
                  "p-4 rounded-lg",
                  verificationResult.valid ? "bg-success/20" : "bg-destructive/20"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {verificationResult.valid ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span className="font-semibold">{verificationResult.message}</span>
                  </div>
                  
                  {verificationResult.details && (
                    <div className="text-sm space-y-1 mt-3">
                      <p>Roll No: <span className="font-mono">{verificationResult.details.rollNo}</span></p>
                      <p>Subject: {verificationResult.details.subject}</p>
                      <p>Session: {verificationResult.details.sessionId}</p>
                      <p>Time: {verificationResult.details.timestamp}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={verificationResult.details.locationValid ? "default" : "destructive"}>
                          Location {verificationResult.details.locationValid ? '✓' : '✗'}
                        </Badge>
                        <Badge variant={verificationResult.details.timeValid ? "default" : "destructive"}>
                          Time {verificationResult.details.timeValid ? '✓' : '✗'}
                        </Badge>
                        <Badge variant={verificationResult.details.signatureValid ? "default" : "destructive"}>
                          Signature {verificationResult.details.signatureValid ? '✓' : '✗'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* QR Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Your Attendance QR</DialogTitle>
          </DialogHeader>
          
          {qrData && (
            <div className="text-center space-y-4">
              <div className="qr-container inline-block">
                <img src={qrData.url} alt="Attendance QR" className="w-48 h-48" />
              </div>
              
              <div className="text-left bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Roll No:</span> {qrData.payload.rollNo}</p>
                <p><span className="text-muted-foreground">Subject:</span> {qrData.payload.subject}</p>
                <p><span className="text-muted-foreground">Session:</span> {qrData.payload.sessionId}</p>
                <p className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-muted-foreground">Valid for 30 minutes</span>
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Show this QR code to mark your attendance
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
