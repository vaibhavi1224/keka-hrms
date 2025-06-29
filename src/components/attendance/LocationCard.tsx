import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LocationCardProps {
  isLocationValid?: boolean;
  onRefreshLocation?: () => void;
  loading?: boolean;
  currentAddress?: string;
  isRequired?: boolean;
}

const LocationCard = ({ 
  isLocationValid = false, 
  onRefreshLocation = () => {}, 
  loading = false,
  currentAddress = '',
  isRequired = false
}: LocationCardProps) => {
  return (
    <Card className={isLocationValid ? 'border-green-500' : 'border-amber-500'}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className={`w-5 h-5 ${isLocationValid ? 'text-green-500' : 'text-amber-500'}`} />
          <span>Location</span>
          {isRequired && (
            <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Required</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">Current Location</div>
          <div className="font-medium flex items-center gap-2">
            {isLocationValid ? (
              'Office - Valid Location'
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-amber-500">Not at office location</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 break-words">
            {currentAddress || 'Location details unavailable'}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefreshLocation}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Refresh Location'
            )}
          </Button>
          
          {isRequired && !isLocationValid && (
            <div className="text-xs text-red-600 mt-2">
              Location verification is required for your chosen attendance method
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
