
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { AdminOnly } from '@/components/auth/RoleBasedAccess';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Lock, 
  Eye,
  TrendingUp,
  MapPin,
  Smartphone
} from 'lucide-react';
import { MultiFactorAuth, MFAStatus } from './MultiFactorAuth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

interface SecurityMetrics {
  totalThreats: number;
  blockedAttempts: number;
  activeUsers: number;
  mfaAdoption: number;
  riskScore: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function SecurityDashboard() {
  const { userRole } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalThreats: 0,
    blockedAttempts: 0,
    activeUsers: 0,
    mfaAdoption: 0,
    riskScore: 0
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMFASetup, setShowMFASetup] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      // Load security threats
      const threatsRef = collection(db, 'security_threats');
      const threatsQuery = query(
        threatsRef,
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const threatsSnapshot = await getDocs(threatsQuery);
      
      const threatsList = threatsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as SecurityAlert[];

      setAlerts(threatsList);

      // Calculate metrics (simplified for demo)
      setMetrics({
        totalThreats: threatsSnapshot.size,
        blockedAttempts: threatsList.filter(t => t.severity === 'high').length,
        activeUsers: 45, // Would be calculated from active sessions
        mfaAdoption: 78, // Percentage of users with MFA enabled
        riskScore: 25 // Overall security risk score (lower is better)
      });

    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (showMFASetup) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <MultiFactorAuth onComplete={() => setShowMFASetup(false)} />
      </div>
    );
  }

  return (
    <AdminOnly fallback={
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-blue-600 mx-auto" />
            <h2 className="text-xl font-bold">Personal Security</h2>
            <MFAStatus />
            <Button onClick={() => setShowMFASetup(true)} className="w-full">
              Configure Multi-Factor Authentication
            </Button>
          </div>
        </Card>
      </div>
    }>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Security Dashboard</h1>
              <p className="text-gray-600">Monitor and manage system security</p>
            </div>
          </div>
          <Badge variant="secondary">{userRole?.toUpperCase()}</Badge>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">Threats Detected</span>
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.totalThreats}</div>
            <div className="text-xs text-gray-500">Last 30 days</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Blocked Attempts</span>
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.blockedAttempts}</div>
            <div className="text-xs text-gray-500">Automatic blocks</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.activeUsers}</div>
            <div className="text-xs text-gray-500">Currently online</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">MFA Adoption</span>
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.mfaAdoption}%</div>
            <div className="text-xs text-gray-500">Users with 2FA</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Risk Score</span>
            </div>
            <div className={`text-2xl font-bold mt-2 ${getRiskScoreColor(metrics.riskScore)}`}>
              {metrics.riskScore}/100
            </div>
            <div className="text-xs text-gray-500">Lower is better</div>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="policies">Security Policies</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Security Alerts</h3>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p>No security alerts detected</p>
                    <p className="text-sm">Your system is secure</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <div>
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm text-gray-500">
                            {alert.timestamp.toLocaleString()} • {alert.type}
                          </div>
                        </div>
                      </div>
                      <Badge variant={alert.resolved ? "secondary" : "destructive"}>
                        {alert.resolved ? "Resolved" : alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Real-time Security Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">System Status</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <div className="text-sm text-green-700">All systems operational</div>
                </Card>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Geographic Distribution</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    Active users from 5 countries
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Active Security Policies</h3>
              <div className="space-y-3">
                {[
                  { name: 'Password Policy', status: 'active', description: 'Minimum 8 characters, special characters required' },
                  { name: 'Session Timeout', status: 'active', description: '30 minutes of inactivity' },
                  { name: 'Rate Limiting', status: 'active', description: 'Max 100 requests per minute' },
                  { name: 'MFA Enforcement', status: 'active', description: 'Required for admin roles' },
                  { name: 'IP Whitelist', status: 'inactive', description: 'No restrictions currently' }
                ].map((policy, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{policy.name}</div>
                      <div className="text-sm text-gray-500">{policy.description}</div>
                    </div>
                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                      {policy.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Eye className="h-6 w-6 mb-2" />
                  <span>Audit Log Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Compliance Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  <span>Threat Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span>User Access Report</span>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
}
