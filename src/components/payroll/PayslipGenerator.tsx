
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Eye } from 'lucide-react';

interface PayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowances: number;
  manual_bonus: number;
  total_earnings: number;
  pf_employee: number;
  manual_deductions: number;
  total_deductions: number;
  net_pay: number;
  payslip_generated_at: string;
  payslip_url: string;
  status: string;
  profiles: {
    first_name: string;
    last_name: string;
    employee_id: string;
    email: string;
  };
}

const PayslipGenerator = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payroll records without payslips
  const { data: payrollRecords = [] } = useQuery({
    queryKey: ['payroll-records-pending-payslips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payrolls')
        .select(`
          id,
          employee_id,
          month,
          year,
          basic_salary,
          hra,
          special_allowance,
          transport_allowance,
          medical_allowance,
          other_allowances,
          manual_bonus,
          total_earnings,
          pf_employee,
          manual_deductions,
          total_deductions,
          net_pay,
          payslip_generated_at,
          payslip_url,
          status,
          profiles!employee_id (
            first_name,
            last_name,
            employee_id,
            email
          )
        `)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data as PayrollRecord[];
    }
  });

  // Generate payslip mutation
  const generatePayslipMutation = useMutation({
    mutationFn: async (payrollId: string) => {
      // For now, we'll create a simple HTML-to-PDF conversion
      // In a real implementation, you would use a PDF generation service
      const payroll = payrollRecords.find(p => p.id === payrollId);
      if (!payroll) throw new Error('Payroll record not found');

      // Generate HTML content for payslip
      const payslipHTML = generatePayslipHTML(payroll);
      
      // In a real implementation, you would:
      // 1. Send this HTML to a PDF generation service
      // 2. Upload the PDF to Supabase storage
      // 3. Save the URL in the database
      
      // For now, we'll just mark it as generated and create a mock URL
      const mockPayslipUrl = `payslip_${payroll.profiles.employee_id}_${payroll.month}_${payroll.year}.pdf`;
      
      const { error } = await supabase
        .from('payrolls')
        .update({
          payslip_generated_at: new Date().toISOString(),
          payslip_url: mockPayslipUrl,
          status: 'processed'
        })
        .eq('id', payrollId);
      
      if (error) throw error;
      
      return { payslipHTML, payslipUrl: mockPayslipUrl };
    },
    onSuccess: (result, payrollId) => {
      toast({
        title: "Success",
        description: "Payslip generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['payroll-records-pending-payslips'] });
      
      // Open payslip in new window for preview
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(result.payslipHTML);
        newWindow.document.close();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const generatePayslipHTML = (payroll: PayrollRecord): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${payroll.profiles.first_name} ${payroll.profiles.last_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .employee-info { margin-bottom: 20px; }
          .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .salary-table th, .salary-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .salary-table th { background-color: #f2f2f2; }
          .totals { font-weight: bold; background-color: #f8f9fa; }
          .net-pay { font-size: 18px; color: #2563eb; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PAYSLIP</h1>
          <h3>For the month of ${monthNames[payroll.month - 1]} ${payroll.year}</h3>
        </div>
        
        <div class="employee-info">
          <p><strong>Employee Name:</strong> ${payroll.profiles.first_name} ${payroll.profiles.last_name}</p>
          <p><strong>Employee ID:</strong> ${payroll.profiles.employee_id}</p>
          <p><strong>Email:</strong> ${payroll.profiles.email}</p>
          <p><strong>Generated On:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
        </div>
        
        <table class="salary-table">
          <thead>
            <tr>
              <th>Earnings</th>
              <th>Amount (₹)</th>
              <th>Deductions</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td>${payroll.basic_salary.toLocaleString('en-IN')}</td>
              <td>PF Employee Contribution</td>
              <td>${payroll.pf_employee.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>HRA</td>
              <td>${payroll.hra.toLocaleString('en-IN')}</td>
              <td>Manual Deductions</td>
              <td>${payroll.manual_deductions.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Special Allowance</td>
              <td>${payroll.special_allowance.toLocaleString('en-IN')}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Transport Allowance</td>
              <td>${payroll.transport_allowance.toLocaleString('en-IN')}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Medical Allowance</td>
              <td>${payroll.medical_allowance.toLocaleString('en-IN')}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Other Allowances</td>
              <td>${payroll.other_allowances.toLocaleString('en-IN')}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Bonus</td>
              <td>${payroll.manual_bonus.toLocaleString('en-IN')}</td>
              <td></td>
              <td></td>
            </tr>
            <tr class="totals">
              <td>Total Earnings</td>
              <td>${payroll.total_earnings.toLocaleString('en-IN')}</td>
              <td>Total Deductions</td>
              <td>${payroll.total_deductions.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="totals net-pay">
              <td colspan="3">Net Pay</td>
              <td>₹${payroll.net_pay.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </body>
      </html>
    `;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Payslip Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payrollRecords?.map((record) => (
            <div key={record.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">
                    {record.profiles?.first_name} {record.profiles?.last_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {record.profiles?.employee_id} • {getMonthName(record.month)} {record.year}
                  </p>
                  <p className="text-sm text-gray-500">
                    Net Pay: {formatCurrency(record.net_pay)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {record.payslip_generated_at ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const payslipHTML = generatePayslipHTML(record);
                          const newWindow = window.open('', '_blank');
                          if (newWindow) {
                            newWindow.document.write(payslipHTML);
                            newWindow.document.close();
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Download",
                            description: "PDF download would be implemented here",
                          });
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => generatePayslipMutation.mutate(record.id)}
                      disabled={generatePayslipMutation.isPending}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Generate Payslip
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Basic:</span>
                  <p className="font-medium">{formatCurrency(record.basic_salary)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Earnings:</span>
                  <p className="font-medium">{formatCurrency(record.total_earnings)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Deductions:</span>
                  <p className="font-medium">{formatCurrency(record.total_deductions)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium capitalize">{record.status}</p>
                </div>
              </div>
              
              {record.payslip_generated_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Payslip generated on: {new Date(record.payslip_generated_at).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          ))}
          
          {!payrollRecords?.length && (
            <div className="text-center py-8 text-gray-500">
              No payroll records found. Generate payroll first to create payslips.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PayslipGenerator;
