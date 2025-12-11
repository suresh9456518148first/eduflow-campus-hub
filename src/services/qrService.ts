// QR Service for EduFlow
// Handles QR code generation and verification for attendance

import QRCode from 'qrcode';

interface AttendancePayload {
  rollNo: string;
  subject: string;
  sessionId: string;
  timestamp: number;
  lat: number;
  lng: number;
  signature: string;
}

// Mock classroom location (demo coordinates)
const CLASSROOM_LOCATION = {
  lat: 28.6139, // Example: Delhi coordinates
  lng: 77.2090,
  radiusMeters: 100 // Acceptable radius
};

// Generate a simple signature for verification
function generateSignature(data: Omit<AttendancePayload, 'signature'>): string {
  const str = `${data.rollNo}-${data.subject}-${data.sessionId}-${data.timestamp}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

// Generate QR code data URL
export async function generateAttendanceQR(
  rollNo: string,
  subject: string,
  sessionId: string
): Promise<{ qrDataUrl: string; payload: AttendancePayload }> {
  // Try to get actual location, fallback to mock
  let lat = CLASSROOM_LOCATION.lat;
  let lng = CLASSROOM_LOCATION.lng;
  
  try {
    if (navigator.geolocation) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      lat = position.coords.latitude;
      lng = position.coords.longitude;
    }
  } catch (e) {
    console.log('Using mock location for demo');
  }
  
  const timestamp = Date.now();
  const payloadWithoutSig = { rollNo, subject, sessionId, timestamp, lat, lng };
  const signature = generateSignature(payloadWithoutSig);
  
  const payload: AttendancePayload = {
    ...payloadWithoutSig,
    signature
  };
  
  const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
    width: 256,
    margin: 2,
    color: {
      dark: '#0ea5e9',
      light: '#ffffff'
    }
  });
  
  return { qrDataUrl, payload };
}

// Verify QR code data
export interface VerificationResult {
  valid: boolean;
  message: string;
  details?: {
    rollNo: string;
    subject: string;
    sessionId: string;
    timestamp: string;
    locationValid: boolean;
    timeValid: boolean;
    signatureValid: boolean;
  };
}

export function verifyAttendanceQR(
  qrData: string,
  currentLat?: number,
  currentLng?: number
): VerificationResult {
  try {
    const payload: AttendancePayload = JSON.parse(qrData);
    
    // Verify signature
    const expectedSig = generateSignature({
      rollNo: payload.rollNo,
      subject: payload.subject,
      sessionId: payload.sessionId,
      timestamp: payload.timestamp,
      lat: payload.lat,
      lng: payload.lng
    });
    const signatureValid = payload.signature === expectedSig;
    
    // Verify time (QR valid for 30 minutes)
    const now = Date.now();
    const qrAge = now - payload.timestamp;
    const timeValid = qrAge < 30 * 60 * 1000; // 30 minutes
    
    // Verify location
    let locationValid = true;
    if (currentLat !== undefined && currentLng !== undefined) {
      const distance = calculateDistance(
        currentLat, currentLng,
        CLASSROOM_LOCATION.lat, CLASSROOM_LOCATION.lng
      );
      locationValid = distance <= CLASSROOM_LOCATION.radiusMeters;
    }
    
    const valid = signatureValid && timeValid && locationValid;
    
    return {
      valid,
      message: valid 
        ? '✅ Attendance marked successfully!' 
        : `❌ Verification failed: ${!signatureValid ? 'Invalid QR' : !timeValid ? 'QR expired' : 'Outside classroom'}`,
      details: {
        rollNo: payload.rollNo,
        subject: payload.subject,
        sessionId: payload.sessionId,
        timestamp: new Date(payload.timestamp).toLocaleString(),
        locationValid,
        timeValid,
        signatureValid
      }
    };
  } catch (e) {
    return {
      valid: false,
      message: '❌ Invalid QR code format'
    };
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}

// Generate session ID
export function generateSessionId(subject: string): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeSlot = Math.floor(date.getHours() / 2); // 2-hour slots
  return `${subject.replace(/\s/g, '').toUpperCase()}-${dateStr}-${timeSlot}`;
}
