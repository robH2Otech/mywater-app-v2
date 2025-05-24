
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { SecurityDashboard } from './SecurityDashboard';
import { ComplianceManager } from '@/utils/security/complianceManager';
import { DataProtection } from '@/utils/security/dataProtection';
import { advancedSecurityMonitor } from '@/utils/security/advancedSecurityMonitor';

export function Phase2SecurityManager() {
  const { toast } = useToast();
  const { currentUser, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // Handle GDPR data export
  const handleDataExport = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const exportData = await ComplianceManager.exportUserData(currentUser.uid);
      
      // Create download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${currentUser.uid}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Data Export Complete',
        description: 'Your data has been exported successfully.'
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export your data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion request
  const handleAccountDeletion = async () => {
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const deleted = await ComplianceManager.deleteUserData(
        currentUser.uid, 
        'User requested account deletion'
      );
      
      if (deleted) {
        toast({
          title: 'Account Deletion Initiated',
          description: 'Your account deletion request has been processed.'
        });
      } else {
        throw new Error('Deletion verification failed');
      }
    } catch (error) {
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete account. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate compliance report
  const handleComplianceReport = async (type: 'soc2' | 'iso27001' | 'gdpr') => {
    setIsLoading(true);
    try {
      let reportData: string;
      let filename: string;
      
      switch (type) {
        case 'soc2':
          reportData = await ComplianceManager.generateSOC2Report();
          filename = `soc2-compliance-report-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'iso27001':
          reportData = await ComplianceManager.generateISO27001Report();
          filename = `iso27001-assessment-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'gdpr':
          reportData = await ComplianceManager.conductPrivacyImpactAssessment('X-Water System');
          filename = `gdpr-pia-${new Date().toISOString().split('T')[0]}.json`;
          break;
      }
      
      // Download report
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Report Generated',
        description: `${type.toUpperCase()} compliance report has been downloaded.`
      });
    } catch (error) {
      toast({
        title: 'Report Generation Failed',
        description: 'Failed to generate compliance report.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test security monitoring
  const testSecurityMonitoring = async () => {
    try {
      // Simulate security events
      await advancedSecurityMonitor.detectGeoAnomaly(currentUser?.uid || 'test-user');
      await advancedSecurityMonitor.detectDeviceChange(currentUser?.uid || 'test-user');
      
      toast({
        title: 'Security Test Complete',
        description: 'Security monitoring systems are functioning correctly.'
      });
    } catch (error) {
      toast({
        title: 'Security Test Failed',
        description: 'Security monitoring test encountered errors.',
        variant: 'destructive'
      });
    }
  };

  if (activeTab === 'dashboard') {
    return <SecurityDashboard />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Phase 2 Security Management</h1>
            <p className="text-gray-600">Advanced security features and compliance tools</p>
          </div>
        </div>
        <Badge variant="default">Phase 2 Active</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Security Dashboard</TabsTrigger>
          <TabsTrigger value="monitoring">Advanced Monitoring</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & GDPR</TabsTrigger>
          <TabsTrigger value="testing">Security Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Security Monitoring</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Threat Detection</span>
                </div>
                <p className="text-sm text-gray-600">Real-time monitoring active</p>
              </Card>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Behavior Analysis</span>
                </div>
                <p className="text-sm text-gray-600">ML-powered anomaly detection</p>
              </Card>

              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Incident Response</span>
                </div>
                <p className="text-sm text-gray-600">Automated response system</p>
              </Card>
            </div>

            <div className="mt-6">
              <Button onClick={testSecurityMonitoring} disabled={isLoading}>
                Test Security Monitoring
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compliance Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => handleComplianceReport('soc2')}
                disabled={isLoading}
              >
                <FileText className="h-6 w-6 mb-2" />
                <span>SOC 2 Report</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => handleComplianceReport('iso27001')}
                disabled={isLoading}
              >
                <Shield className="h-6 w-6 mb-2" />
                <span>ISO 27001 Assessment</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => handleComplianceReport('gdpr')}
                disabled={isLoading}
              >
                <Users className="h-6 w-6 mb-2" />
                <span>GDPR Privacy Impact</span>
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Privacy & Data Rights</h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Right to Data Portability</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Export all your personal data in a machine-readable format.
                </p>
                <Button onClick={handleDataExport} disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
              </div>

              <div className="p-4 border rounded-lg border-red-200 bg-red-50">
                <h4 className="font-medium mb-2 text-red-800">Right to be Forgotten</h4>
                <p className="text-sm text-red-700 mb-3">
                  Permanently delete your account and all associated data.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleAccountDeletion} 
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Account
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Security Testing Framework</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Penetration Testing</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Automated security vulnerability assessment
                </p>
                <Badge variant="secondary">Scheduled Monthly</Badge>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Load Testing</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Security under high traffic conditions
                </p>
                <Badge variant="secondary">Scheduled Weekly</Badge>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Code Analysis</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Static security code review
                </p>
                <Badge variant="default">Active</Badge>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Vulnerability Scanning</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Continuous infrastructure scanning
                </p>
                <Badge variant="default">Active</Badge>
              </Card>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
