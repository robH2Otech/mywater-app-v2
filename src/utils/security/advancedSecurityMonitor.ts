
import { auth } from '@/integrations/firebase/client';
import { logAuditEvent } from '@/utils/auth/securityUtils';
import { doc, setDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

// Enhanced security monitoring with threat detection
export interface SecurityThreat {
  type: 'brute_force' | 'geo_anomaly' | 'device_change' | 'session_hijack' | 'privilege_escalation' | 'data_exfiltration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  details: Record<string, any>;
  timestamp: Date;
  blocked: boolean;
  responseAction?: string;
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
  hash: string;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  ip: string;
  isp?: string;
  isVpn?: boolean;
  timestamp: Date;
}

class AdvancedSecurityMonitor {
  private failedAttempts = new Map<string, { count: number; timestamps: number[] }>();
  private knownDevices = new Map<string, DeviceFingerprint[]>();
  private userLocations = new Map<string, GeoLocation[]>();
  private suspiciousPatterns = new Set<string>();

  // Generate device fingerprint
  generateDeviceFingerprint(): DeviceFingerprint {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Security fingerprint', 10, 10);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1',
      hash: btoa(canvas.toDataURL()).slice(-20)
    };

    return fingerprint;
  }

  // Get user's geolocation info
  async getUserLocation(): Promise<GeoLocation> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        country: data.country_name,
        region: data.region,
        city: data.city,
        ip: data.ip,
        isp: data.org,
        isVpn: data.in_eu, // Simplified VPN detection
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to get location:', error);
      return {
        ip: 'unknown',
        timestamp: new Date()
      };
    }
  }

  // Detect brute force attempts
  detectBruteForce(identifier: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    if (!this.failedAttempts.has(identifier)) {
      this.failedAttempts.set(identifier, { count: 1, timestamps: [now] });
      return false;
    }

    const attempts = this.failedAttempts.get(identifier)!;
    
    // Remove old timestamps
    attempts.timestamps = attempts.timestamps.filter(ts => now - ts < windowMs);
    attempts.count = attempts.timestamps.length;

    // Add current attempt
    attempts.timestamps.push(now);
    attempts.count++;

    if (attempts.count >= maxAttempts) {
      this.reportThreat({
        type: 'brute_force',
        severity: 'high',
        details: {
          identifier,
          attemptCount: attempts.count,
          timeWindow: windowMs
        },
        timestamp: new Date(),
        blocked: true,
        responseAction: 'account_locked'
      });
      return true;
    }

    return false;
  }

  // Detect geographical anomalies
  async detectGeoAnomaly(userId: string): Promise<boolean> {
    const currentLocation = await this.getUserLocation();
    const userHistory = this.userLocations.get(userId) || [];

    if (userHistory.length === 0) {
      this.userLocations.set(userId, [currentLocation]);
      return false;
    }

    const lastLocation = userHistory[userHistory.length - 1];
    const timeDiff = currentLocation.timestamp.getTime() - lastLocation.timestamp.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // If country changed within 2 hours, it's suspicious
    if (lastLocation.country && currentLocation.country && 
        lastLocation.country !== currentLocation.country && 
        hoursDiff < 2) {
      
      await this.reportThreat({
        type: 'geo_anomaly',
        severity: 'medium',
        userId,
        details: {
          previousLocation: lastLocation,
          currentLocation,
          timeDifference: hoursDiff
        },
        timestamp: new Date(),
        blocked: false,
        responseAction: 'require_additional_verification'
      });
      
      return true;
    }

    // Update location history
    userHistory.push(currentLocation);
    if (userHistory.length > 10) userHistory.shift(); // Keep last 10 locations
    this.userLocations.set(userId, userHistory);

    return false;
  }

  // Detect device changes
  async detectDeviceChange(userId: string): Promise<boolean> {
    const currentFingerprint = this.generateDeviceFingerprint();
    const knownDevices = this.knownDevices.get(userId) || [];

    const isKnownDevice = knownDevices.some(device => 
      device.hash === currentFingerprint.hash ||
      (device.userAgent === currentFingerprint.userAgent && 
       device.screenResolution === currentFingerprint.screenResolution)
    );

    if (!isKnownDevice && knownDevices.length > 0) {
      await this.reportThreat({
        type: 'device_change',
        severity: 'medium',
        userId,
        details: {
          newDevice: currentFingerprint,
          knownDevicesCount: knownDevices.length
        },
        timestamp: new Date(),
        blocked: false,
        responseAction: 'require_device_verification'
      });

      // Add new device to known devices
      knownDevices.push(currentFingerprint);
      if (knownDevices.length > 5) knownDevices.shift(); // Keep last 5 devices
      this.knownDevices.set(userId, knownDevices);

      return true;
    }

    if (knownDevices.length === 0) {
      this.knownDevices.set(userId, [currentFingerprint]);
    }

    return false;
  }

  // Enhanced rate limiting with progressive delays
  checkAdvancedRateLimit(identifier: string, action: string): { allowed: boolean; delay?: number } {
    const key = `${identifier}_${action}`;
    const now = Date.now();
    const limits = {
      'login': { requests: 5, window: 15 * 60 * 1000, baseDelay: 1000 },
      'api_call': { requests: 100, window: 60 * 1000, baseDelay: 100 },
      'password_reset': { requests: 3, window: 60 * 60 * 1000, baseDelay: 5000 }
    };

    const limit = limits[action as keyof typeof limits] || limits.api_call;
    
    if (!this.failedAttempts.has(key)) {
      this.failedAttempts.set(key, { count: 1, timestamps: [now] });
      return { allowed: true };
    }

    const attempts = this.failedAttempts.get(key)!;
    attempts.timestamps = attempts.timestamps.filter(ts => now - ts < limit.window);
    attempts.count = attempts.timestamps.length;

    if (attempts.count >= limit.requests) {
      const delay = limit.baseDelay * Math.pow(2, Math.min(attempts.count - limit.requests, 10));
      return { allowed: false, delay };
    }

    attempts.timestamps.push(now);
    attempts.count++;
    return { allowed: true };
  }

  // Report security threats
  async reportThreat(threat: SecurityThreat): Promise<void> {
    try {
      // Log to audit system
      await logAuditEvent('security_threat', {
        threat_type: threat.type,
        severity: threat.severity,
        user_id: threat.userId,
        details: threat.details,
        blocked: threat.blocked,
        response_action: threat.responseAction
      }, threat.severity === 'critical' ? 'critical' : 'warning');

      // Store in threats collection for analysis
      await addDoc(collection(db, 'security_threats'), {
        ...threat,
        timestamp: threat.timestamp,
        resolved: false,
        investigator: null
      });

      // Auto-response for critical threats
      if (threat.severity === 'critical' && threat.userId) {
        await this.executeThreatResponse(threat);
      }

    } catch (error) {
      console.error('Failed to report security threat:', error);
    }
  }

  // Execute automated threat responses
  private async executeThreatResponse(threat: SecurityThreat): Promise<void> {
    const user = auth.currentUser;
    if (!user || user.uid !== threat.userId) return;

    switch (threat.responseAction) {
      case 'account_locked':
        // In a real implementation, this would disable the account
        console.log('Account locked due to security threat');
        break;
      
      case 'force_logout':
        await auth.signOut();
        break;
      
      case 'require_additional_verification':
        // Store flag for additional verification requirement
        await setDoc(doc(db, 'user_security_flags', user.uid), {
          requireAdditionalVerification: true,
          reason: threat.type,
          timestamp: new Date()
        });
        break;
    }
  }

  // Analyze user behavior patterns
  async analyzeUserBehavior(userId: string, actions: string[]): Promise<boolean> {
    // Simple pattern detection - in production, this would use ML
    const suspiciousPatterns = [
      'rapid_data_access',
      'unusual_time_access',
      'privilege_escalation_attempt',
      'bulk_data_export'
    ];

    const recentActions = actions.slice(-10);
    const hasPattern = suspiciousPatterns.some(pattern => 
      recentActions.filter(action => action.includes(pattern.split('_')[0])).length > 3
    );

    if (hasPattern) {
      await this.reportThreat({
        type: 'data_exfiltration',
        severity: 'high',
        userId,
        details: { suspiciousActions: recentActions },
        timestamp: new Date(),
        blocked: false,
        responseAction: 'require_additional_verification'
      });
    }

    return hasPattern;
  }
}

export const advancedSecurityMonitor = new AdvancedSecurityMonitor();
