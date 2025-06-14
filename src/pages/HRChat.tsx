
import React from 'react';
import Layout from '@/components/layout/Layout';
import HRChatbot from '@/components/hr/HRChatbot';

const HRChat = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Assistant</h1>
          <p className="mt-2 text-gray-600">
            Get instant answers to your HR questions, check your leave balance, and learn about company policies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HRChatbot />
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Quick Help</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• "What's my leave balance?"</p>
                <p>• "How do I apply for sick leave?"</p>
                <p>• "What are the working hours?"</p>
                <p>• "Who is my manager?"</p>
                <p>• "Reimbursement process?"</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Contact HR</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Email: hr@company.com</p>
                <p>Phone: +91 XXX XXX XXXX</p>
                <p>Office Hours: 9 AM - 6 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HRChat;
