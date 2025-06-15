
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { addDummyBankDetailsForAllEmployees } from '@/utils/employee/dummyBankDetailsGenerator';
import { useToast } from '@/hooks/use-toast';

const AddBankDetailsButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);
  const { toast } = useToast();

  const handleAddBankDetails = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const result = await addDummyBankDetailsForAllEmployees();
      setResult(result);
      
      if (result.errors === 0) {
        toast({
          title: "Success!",
          description: `Successfully added bank details for ${result.success} employees.`,
        });
      } else {
        toast({
          title: "Partially completed",
          description: `Added bank details for ${result.success} employees, ${result.errors} errors occurred.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding bank details:', error);
      toast({
        title: "Error",
        description: "Failed to add bank details. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleAddBankDetails}
        disabled={isProcessing}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding Bank Details...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Add Dummy Bank Details
          </>
        )}
      </Button>

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            {result.errors === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-medium">Bank Details Results</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>✅ Successfully added: {result.success} employees</p>
            {result.errors > 0 && (
              <p>❌ Errors: {result.errors}</p>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 p-3 bg-green-50 rounded">
        <p><strong>Note:</strong> This will add dummy bank details for all employees who don't have bank details yet. Existing bank details will not be modified.</p>
      </div>
    </div>
  );
};

export default AddBankDetailsButton;
