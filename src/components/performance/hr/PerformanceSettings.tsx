
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const PerformanceSettings = () => {
  const [settings, setSettings] = useState({
    enableSelfReview: true,
    enablePeerReview: true,
    enableManagerReview: true,
    enableHRReview: false,
    selfReviewWeight: 20,
    peerReviewWeight: 25,
    managerReviewWeight: 40,
    hrReviewWeight: 15,
    minRatingForPromotion: 4.5,
    defaultSalaryIncrement: 10,
    reminderDays: 3,
    autoCloseReviewCycle: false,
    allowSelfRatingEdit: true,
    requireFeedbackForLowRating: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      enableSelfReview: true,
      enablePeerReview: true,
      enableManagerReview: true,
      enableHRReview: false,
      selfReviewWeight: 20,
      peerReviewWeight: 25,
      managerReviewWeight: 40,
      hrReviewWeight: 15,
      minRatingForPromotion: 4.5,
      defaultSalaryIncrement: 10,
      reminderDays: 3,
      autoCloseReviewCycle: false,
      allowSelfRatingEdit: true,
      requireFeedbackForLowRating: true
    });
    toast.info('Settings reset to defaults');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Performance Settings</h2>
          <p className="text-gray-600">Configure performance review parameters and policies</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset} className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Review Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="self-review">Enable Self Review</Label>
              <Switch
                id="self-review"
                checked={settings.enableSelfReview}
                onCheckedChange={(checked) => setSettings({ ...settings, enableSelfReview: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="peer-review">Enable Peer Review</Label>
              <Switch
                id="peer-review"
                checked={settings.enablePeerReview}
                onCheckedChange={(checked) => setSettings({ ...settings, enablePeerReview: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="manager-review">Enable Manager Review</Label>
              <Switch
                id="manager-review"
                checked={settings.enableManagerReview}
                onCheckedChange={(checked) => setSettings({ ...settings, enableManagerReview: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="hr-review">Enable HR Review</Label>
              <Switch
                id="hr-review"
                checked={settings.enableHRReview}
                onCheckedChange={(checked) => setSettings({ ...settings, enableHRReview: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rating Weights */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Weights (%)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Self Review Weight</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.selfReviewWeight}
                onChange={(e) => setSettings({ ...settings, selfReviewWeight: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Peer Review Weight</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.peerReviewWeight}
                onChange={(e) => setSettings({ ...settings, peerReviewWeight: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Manager Review Weight</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.managerReviewWeight}
                onChange={(e) => setSettings({ ...settings, managerReviewWeight: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>HR Review Weight</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.hrReviewWeight}
                onChange={(e) => setSettings({ ...settings, hrReviewWeight: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="text-sm text-gray-600">
              Total: {settings.selfReviewWeight + settings.peerReviewWeight + settings.managerReviewWeight + settings.hrReviewWeight}%
            </div>
          </CardContent>
        </Card>

        {/* Promotion & Increment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Promotion & Increment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Rating for Promotion</Label>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={settings.minRatingForPromotion}
                onChange={(e) => setSettings({ ...settings, minRatingForPromotion: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Default Salary Increment (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.defaultSalaryIncrement}
                onChange={(e) => setSettings({ ...settings, defaultSalaryIncrement: parseInt(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reminder Days Before Deadline</Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={settings.reminderDays}
                onChange={(e) => setSettings({ ...settings, reminderDays: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-close">Auto-close Review Cycles</Label>
              <Switch
                id="auto-close"
                checked={settings.autoCloseReviewCycle}
                onCheckedChange={(checked) => setSettings({ ...settings, autoCloseReviewCycle: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-edit">Allow Self Rating Edit</Label>
              <Switch
                id="allow-edit"
                checked={settings.allowSelfRatingEdit}
                onCheckedChange={(checked) => setSettings({ ...settings, allowSelfRatingEdit: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="require-feedback">Require Feedback for Low Ratings</Label>
              <Switch
                id="require-feedback"
                checked={settings.requireFeedbackForLowRating}
                onCheckedChange={(checked) => setSettings({ ...settings, requireFeedbackForLowRating: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceSettings;
