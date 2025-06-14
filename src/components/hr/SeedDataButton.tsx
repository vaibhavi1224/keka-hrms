
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { seedCompanyData } from '@/utils/seedCompanyData';
import { useToast } from '@/hooks/use-toast';

const SeedDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: number; errors: number } | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedCompanyData();
      setSeedResult(result);
      
      if (result.errors === 0) {
        toast({
          title: "Success!",
          description: `Successfully invited ${result.success} employees to the company.`,
        });
      } else {
        toast({
          title: "Partially completed",
          description: `Invited ${result.success} employees, ${result.errors} errors occurred.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to seed company data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSeedData}
        disabled={isSeeding}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isSeeding ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Seeding Company Data...
          </>
        ) : (
          <>
            <Database className="w-4 h-4 mr-2" />
            Seed Company Data
          </>
        )}
      </Button>

      {seedResult && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            {seedResult.errors === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-medium">Seeding Results</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>✅ Successfully invited: {seedResult.success} employees</p>
            {seedResult.errors > 0 && (
              <p>❌ Errors: {seedResult.errors}</p>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded">
        <p><strong>Note:</strong> This will create invitations for all company employees. They will need to sign up using their company email addresses to complete the process.</p>
      </div>
    </div>
  );
};

export default SeedDataButton;
