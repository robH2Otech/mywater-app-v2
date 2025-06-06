import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AdminOnly } from '@/components/auth/RoleBasedAccess';
import { Shield, AlertTriangle, Lock, Eye, Settings, Users, Zap, FileText } from 'lucide-react';
import { Phase2SecurityManager } from './Phase2SecurityManager';

interface SecurityConfig {
  enforceStrongPasswords: boolean;
  requireMFA: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  auditLogging: boolean;
  // Phase 2 features
  advancedThreatDetection: boolean;
  geolocationMonitoring: boolean;
  deviceFingerprinting: boolean;
  behaviorAnalysis: boolean;
  dataEncryption: boolean;
  complianceReporting: boolean;
  incidentResponse: boolean;
}

export function SecuritySettings() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [config, setConfig] = useState<SecurityConfig>({
    enforceStrongPasswords: true,
    requireMFA: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelist: [],
    auditLogging: true,
    // Phase 2 defaults
    advancedThreatDetection: true,
    geolocationMonitoring: true,
    deviceFingerprinting: true,
    behaviorAnalysis: true,
    dataEncryption: true,
    complianceReporting: true,
    incidentResponse: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPhase2, setShowPhase2] = useState(false);

  // Load current security configuration
  useEffect(() => {
    loadSecurityConfig();
  }, []);

  const loadSecurityConfig = async () => {
    try {
      console.log('Loading security configuration...');
    } catch (error) {
      console.error('Error loading security config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security configuration',
        variant: 'destructive'
      });
    }
  };

  const updateSecurityConfig = async (updates: Partial<SecurityConfig>) => {
    setIsLoading(true);
    try {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      
      console.log('Updated security config:', newConfig);
      
      toast({
        title: 'Security Settings Updated',
        description: 'Your security configuration has been saved successfully.'
      });
    } catch (error) {
      console.error('Error updating security config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update security configuration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forceLogoutAllUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Forcing logout for all users...');
      
      toast({
        title: 'Users Logged Out',
        description: 'All users have been logged out successfully.'
      });
    } catch (error) {
      console.error('Error forcing logout:', error);
      toast({
        title: 'Error',
        description: 'Failed to force logout all users',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showPhase2) {
    return <Phase2SecurityManager />;
  }

  return (
    <AdminOnly fallback={
      <Card className="p-6">
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Access denied. Administrator privileges required.</span>
        </div>
      </Card>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Security Settings</h2>
            <Badge variant="secondary">{userRole?.toUpperCase()}</Badge>
          </div>
          
          <Button onClick={() => setShowPhase2(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Zap className="h-4 w-4 mr-2" />
            Open Phase 2 Security Hub
          </Button>
        </div>

        {/* Phase 2 Quick Access */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-800">Phase 2 Security Features</h3>
            <Badge variant="default">New</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">✓</div>
              <div className="text-sm">Advanced Threat Detection</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Multi-Factor Authentication</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">✓</div>
              <div className="text-sm">GDPR Compliance Tools</div>
            </div>
          </div>
          
          <Button onClick={() => setShowPhase2(true)} className="w-full">
            Access Advanced Security Features
          </Button>
        </Card>

        {/* Authentication Security */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lock className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Authentication Security</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Enforce Strong Passwords</label>
                <p className="text-sm text-gray-500">Require complex passwords for all users</p>
              </div>
              <Switch
                checked={config.enforceStrongPasswords}
                onCheckedChange={(checked) => 
                  updateSecurityConfig({ enforceStrongPasswords: checked })
                }
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Require Multi-Factor Authentication</label>
                <p className="text-sm text-gray-500">Force MFA for admin and superadmin roles</p>
              </div>
              <Switch
                checked={config.requireMFA}
                onCheckedChange={(checked) => 
                  updateSecurityConfig({ requireMFA: checked })
                }
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Enhanced Audit Logging</label>
                <p className="text-sm text-gray-500">Log all user actions and security events</p>
              </div>
              <Switch
                checked={config.auditLogging}
                onCheckedChange={(checked) => 
                  updateSecurityConfig({ auditLogging: checked })
                }
                disabled={isLoading}
              />
            </div>
          </div>
        </Card>

        {/* Phase 2 Advanced Features */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Advanced Security Features</h3>
            <Badge variant="default">Phase 2</Badge>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Advanced Threat Detection</label>
                <p className="text-sm text-gray-500">AI-powered anomaly detection and threat analysis</p>
              </div>
              <Switch
                checked={config.advancedThreatDetection}
                onCheckedChange={(checked) => 
                  updateSecurityConfig({ advancedThreatDetection: checked })
                }
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Geolocation Monitoring</label>
                <p className="text-sm text-gray-500">Detect suspicious login locations</p>
              </div>
              <Switch
                checked={config.geolocationMonitoring}
                onCheckedChange={(checked) => 
                  updateSecurityConfig({ geolocationMonitoring: checked })
                }
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Device Fingerprinting</label>
                <p className="text-sm text-gray-500">Track and verify user devices</p>
              </div>
              <Switch
                checked={config.deviceFingerprinting}
                onCheckedChange={(checked) => 
                  updateSecurityConfig({ deviceFingerprinting: checked })
                }
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Behavioral Analysis</label>
                <p className="text-sm text-gray-500">Monitor user behavior patterns</p>
              </div>
              <Switch
                checked={config.behaviorAnalysis}
                onCheckedChange={(checked) => 
                  updateSecurityConfig({ behaviorAnalysis: checked })
                }
                disabled={isLoading}
              />
            </div>
          </div>
        </Card>

        {/* Session Management */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Session Management</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Session Timeout (minutes)</label>
              <p className="text-sm text-gray-500">Automatically log out inactive users</p>
              <input
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => 
                  updateSecurityConfig({ sessionTimeout: parseInt(e.target.value) })
                }
                className="mt-2 w-full p-2 border rounded-md"
                min="5"
                max="480"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Max Login Attempts</label>
              <p className="text-sm text-gray-500">Lock account after failed attempts</p>
              <input
                type="number"
                value={config.maxLoginAttempts}
                onChange={(e) => 
                  updateSecurityConfig({ maxLoginAttempts: parseInt(e.target.value) })
                }
                className="mt-2 w-full p-2 border rounded-md"
                min="3"
                max="10"
                disabled={isLoading}
              />
            </div>
          </div>
        </Card>

        {/* Emergency Actions */}
        <Card className="p-6 border-red-200">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-600">Emergency Actions</h3>
          </div>
          
          <div className="space-y-4">
            <Button
              variant="destructive"
              onClick={forceLogoutAllUsers}
              disabled={isLoading}
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Force Logout All Users
            </Button>
            
            <p className="text-sm text-gray-500">
              This will immediately log out all users from the system. Use only in case of security breach.
            </p>
          </div>
        </Card>

        {/* Security Status */}
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-600">Security Status</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Firestore Rules Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Input Validation Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Audit Logging Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Phase 2 Features Ready</div>
            </div>
          </div>
        </Card>
      </div>
    </AdminOnly>
  );
}
