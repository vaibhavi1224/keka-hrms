import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useProfile } from '@/hooks/useProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, MapPin, Shield, Bell, Users } from 'lucide-react';
import OfficeLocationManager from '@/components/hr/OfficeLocationManager';

const Settings = () => {
  const { profile, loading } = useProfile();
  const [activeTab, setActiveTab] = useState('office-locations');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isHR = profile?.role === 'hr';

  if (!isHR) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">
              Configure system-wide settings and preferences
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="office-locations" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Office Locations</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Roles & Permissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="office-locations">
            <OfficeLocationManager />
          </TabsContent>

          <TabsContent value="security">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-gray-600">Security settings coming soon.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-gray-600">Notification settings coming soon.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roles">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-gray-600">Role management coming soon.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings; 