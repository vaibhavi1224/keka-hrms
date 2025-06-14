
import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LocationCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Current Location</div>
          <div className="font-medium">Office - Floor 3</div>
          <div className="text-xs text-gray-500">Verified via GPS</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
