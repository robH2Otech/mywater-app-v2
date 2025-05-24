
import { useEffect, useRef } from 'react';
import { auth } from '@/integrations/firebase/client';
import { logAuditEvent } from '@/utils/auth/securityUtils';

interface SecurityConfig {
  maxInactivityTime?: number;
  maxSessionTime?: number;
  detectAnomalies?: boolean;
}

export function useSecurityMonitor(config: SecurityConfig = {}) {
  const {
    maxInactivityTime = 30 * 60 * 1000, // 30 minutes
    maxSessionTime = 8 * 60 * 60 * 1000, // 8 hours
    detectAnomalies = true
  } = config;

  const lastActivity = useRef(Date.now());
  const sessionStart = useRef(Date.now());
  const inactivityTimer = useRef<NodeJS.Timeout>();
  const sessionTimer = useRef<NodeJS.Timeout>();
  const userAgent = useRef(navigator.userAgent);
  const initialIP = useRef<string>('');

  // Get user's IP address for security monitoring
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        initialIP.current = data.ip;
      })
      .catch(() => {
        // Fallback if IP detection fails
        initialIP.current = 'unknown';
      });
  }, []);

  // Reset activity timer
  const resetActivityTimer = () => {
    lastActivity.current = Date.now();
    
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    inactivityTimer.current = setTimeout(() => {
      handleInactivityTimeout();
    }, maxInactivityTime);
  };

  // Handle inactivity timeout
  const handleInactivityTimeout = async () => {
    const user = auth.currentUser;
    if (user) {
      await logAuditEvent('security_event', {
        type: 'inactivity_timeout',
        user_id: user.uid,
        session_duration: Date.now() - sessionStart.current,
        ip_address: initialIP.current
      }, 'warning');
      
      // Force logout
      await auth.signOut();
      window.location.href = '/auth';
    }
  };

  // Handle session timeout
  const handleSessionTimeout = async () => {
    const user = auth.currentUser;
    if (user) {
      await logAuditEvent('security_event', {
        type: 'session_timeout',
        user_id: user.uid,
        session_duration: maxSessionTime,
        ip_address: initialIP.current
      }, 'warning');
      
      // Force logout
      await auth.signOut();
      window.location.href = '/auth';
    }
  };

  // Detect suspicious activity
  const detectSuspiciousActivity = () => {
    if (!detectAnomalies) return;
    
    // Check for user agent changes
    if (navigator.userAgent !== userAgent.current) {
      logAuditEvent('security_event', {
        type: 'user_agent_change',
        original_ua: userAgent.current,
        new_ua: navigator.userAgent,
        ip_address: initialIP.current
      }, 'warning');
    }

    // Check for rapid successive logins (potential session hijacking)
    const timeSinceStart = Date.now() - sessionStart.current;
    if (timeSinceStart < 1000) { // Less than 1 second
      logAuditEvent('security_event', {
        type: 'rapid_login_detected',
        time_since_start: timeSinceStart,
        ip_address: initialIP.current
      }, 'critical');
    }
  };

  // Monitor for token expiry
  const monitorTokenExpiry = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const tokenResult = await user.getIdTokenResult();
      const expiryTime = new Date(tokenResult.expirationTime).getTime();
      const timeUntilExpiry = expiryTime - Date.now();
      const warningTime = 5 * 60 * 1000; // 5 minutes

      if (timeUntilExpiry < warningTime && timeUntilExpiry > 0) {
        // Token is about to expire, refresh it
        await user.getIdToken(true);
        
        logAuditEvent('security_event', {
          type: 'token_refreshed',
          time_until_expiry: timeUntilExpiry,
          ip_address: initialIP.current
        });
      } else if (timeUntilExpiry <= 0) {
        // Token has expired
        logAuditEvent('security_event', {
          type: 'token_expired',
          ip_address: initialIP.current
        }, 'warning');
        
        await auth.signOut();
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Error monitoring token expiry:', error);
    }
  };

  // Setup security monitoring
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Reset timers when component mounts
    resetActivityTimer();
    
    // Set session timeout
    sessionTimer.current = setTimeout(handleSessionTimeout, maxSessionTime);
    
    // Activity event listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, resetActivityTimer, true);
    });

    // Monitor token expiry every minute
    const tokenMonitor = setInterval(monitorTokenExpiry, 60 * 1000);

    // Detect suspicious activity
    detectSuspiciousActivity();

    // Log session start
    logAuditEvent('security_event', {
      type: 'session_started',
      user_agent: navigator.userAgent,
      ip_address: initialIP.current,
      timestamp: new Date().toISOString()
    });

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetActivityTimer, true);
      });
      
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      
      if (sessionTimer.current) {
        clearTimeout(sessionTimer.current);
      }
      
      clearInterval(tokenMonitor);
    };
  }, [maxInactivityTime, maxSessionTime, detectAnomalies]);

  // Public methods
  const forceLogout = async (reason: string) => {
    const user = auth.currentUser;
    if (user) {
      await logAuditEvent('security_event', {
        type: 'forced_logout',
        reason,
        user_id: user.uid,
        ip_address: initialIP.current
      }, 'warning');
      
      await auth.signOut();
      window.location.href = '/auth';
    }
  };

  const reportSecurityIncident = async (incident: {
    type: string;
    details: Record<string, any>;
    severity?: 'info' | 'warning' | 'critical';
  }) => {
    await logAuditEvent('security_incident', {
      ...incident.details,
      incident_type: incident.type,
      ip_address: initialIP.current,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }, incident.severity || 'warning');
  };

  return {
    forceLogout,
    reportSecurityIncident,
    resetActivityTimer
  };
}
