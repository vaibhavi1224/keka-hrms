
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  bucketName: string;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  onUploadSuccess?: (url: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  className?: string;
}

const FileUpload = ({
  bucketName,
  folder = '',
  accept = "*/*",
  maxSize = 5,
  onUploadSuccess,
  onUploadError,
  multiple = false,
  className = ""
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        const error = `File ${file.name} is too large. Maximum size is ${maxSize}MB.`;
        onUploadError?.(error);
        toast.error(error);
        return null;
      }

      try {
        // Create unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        onUploadSuccess?.(publicUrl, file.name);
        setUploadedFiles(prev => [...prev, file.name]);
        toast.success(`${file.name} uploaded successfully!`);
        
        return { url: publicUrl, fileName: file.name };
      } catch (error: any) {
        const errorMessage = `Failed to upload ${file.name}: ${error.message}`;
        onUploadError?.(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop files here, or click to select
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-2">
            Maximum file size: {maxSize}MB
          </p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Uploaded Files</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUploadedFiles}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Check className="h-4 w-4 text-green-600" />
                  <File className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{fileName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
