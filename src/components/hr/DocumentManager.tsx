
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import FileUpload from '@/components/common/FileUpload';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  file_url: string;
  employee_id?: string;
  uploaded_by: string;
  created_at: string;
}

const DocumentManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const documentCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'hr_policies', label: 'HR Policies' },
    { value: 'employee_handbook', label: 'Employee Handbook' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'performance_reviews', label: 'Performance Reviews' },
    { value: 'payroll_documents', label: 'Payroll Documents' },
    { value: 'compliance', label: 'Compliance Documents' },
    { value: 'training_materials', label: 'Training Materials' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, categoryFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hr_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }

    setFilteredDocuments(filtered);
  };

  const handleFileUpload = async (url: string, fileName: string) => {
    try {
      const { error } = await supabase
        .from('hr_documents')
        .insert({
          name: fileName,
          type: fileName.split('.').pop() || 'unknown',
          category: 'other',
          file_url: url,
          uploaded_by: user?.id || ''
        });

      if (error) throw error;
      
      toast.success('Document uploaded successfully!');
      fetchDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document information');
    }
  };

  const downloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(doc.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('hr_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;
      
      toast.success('Document deleted successfully!');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Document Manager</h2>
      </div>

      {/* Upload Section */}
      <FileUpload
        bucketName="hr-documents"
        folder="documents"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        maxSize={10}
        onUploadSuccess={handleFileUpload}
        multiple={true}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Documents</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-2">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No documents found</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {documentCategories.find(cat => cat.value === doc.category)?.label || doc.category} • 
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManager;
