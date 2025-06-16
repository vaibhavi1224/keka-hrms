import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, PlusCircle, Trash2, Pencil, Save, X } from 'lucide-react';

interface OfficeLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  address?: string;
  is_active: boolean;
  created_at: string;
}

const OfficeLocationManager = () => {
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius_meters: '100',
    address: ''
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('office_locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching office locations:', error);
      toast.error('Failed to load office locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);
    const radius = parseInt(formData.radius_meters);
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
      toast.error('Please enter valid coordinates and radius');
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error('Please enter a location name');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('office_locations')
        .insert({
          name: formData.name,
          latitude,
          longitude,
          radius_meters: radius,
          address: formData.address,
          is_active: true
        });

      if (error) throw error;
      
      toast.success(`Added office location: ${formData.name}`);
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        radius_meters: '100',
        address: ''
      });
      fetchLocations();
    } catch (error) {
      console.error('Error adding office location:', error);
      toast.error('Failed to add office location');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLocation = (location: OfficeLocation) => {
    setEditingLocation(location.id);
    setFormData({
      name: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius_meters: location.radius_meters.toString(),
      address: location.address || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingLocation) return;
    
    // Validate inputs
    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);
    const radius = parseInt(formData.radius_meters);
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
      toast.error('Please enter valid coordinates and radius');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('office_locations')
        .update({
          name: formData.name,
          latitude,
          longitude,
          radius_meters: radius,
          address: formData.address
        })
        .eq('id', editingLocation);

      if (error) throw error;
      
      toast.success('Office location updated');
      setEditingLocation(null);
      fetchLocations();
    } catch (error) {
      console.error('Error updating office location:', error);
      toast.error('Failed to update office location');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius_meters: '100',
      address: ''
    });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('office_locations')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Office location ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchLocations();
    } catch (error) {
      console.error('Error toggling office location status:', error);
      toast.error('Failed to update office location status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    // Confirm before deletion
    if (!window.confirm(`Are you sure you want to delete the office location "${name}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('office_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Deleted office location: ${name}`);
      fetchLocations();
    } catch (error) {
      console.error('Error deleting office location:', error);
      toast.error('Failed to delete office location');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    toast.info('Getting your current location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        toast.success('Current location fetched');
      },
      (error) => {
        toast.error(`Location error: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>Office Locations</span>
          </CardTitle>
          <CardDescription>
            Configure approved office locations for attendance check-in/out. Employees can only check-in/out when they are within the specified radius of these locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddLocation} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Location Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Main Office"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Latitude</label>
              <Input
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder="18.5204"
                required
                type="number"
                step="any"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Longitude</label>
              <Input
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="73.8567"
                required
                type="number"
                step="any"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Radius (meters)</label>
              <Input
                name="radius_meters"
                value={formData.radius_meters}
                onChange={handleInputChange}
                placeholder="100"
                required
                type="number"
                min="10"
                max="1000"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium mb-1 block">Address (optional)</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City"
              />
            </div>
            <div className="flex items-end space-x-2">
              {editingLocation ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleSaveEdit} 
                    disabled={loading}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleGetCurrentLocation}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Location
                  </Button>
                </>
              )}
            </div>
          </form>

          <Table>
            <TableCaption>List of configured office locations</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Radius</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading office locations...
                  </TableCell>
                </TableRow>
              ) : locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No office locations configured yet.
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow 
                    key={location.id}
                    className={location.is_active ? '' : 'opacity-60'}
                  >
                    <TableCell className="font-medium">
                      {location.name}
                      {location.address && (
                        <div className="text-xs text-gray-500 mt-1">{location.address}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </TableCell>
                    <TableCell>{location.radius_meters} meters</TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          location.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {location.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(location.id, location.is_active)}
                        >
                          {location.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLocation(location)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLocation(location.id, location.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficeLocationManager; 