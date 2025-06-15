
import React from 'react';

interface LeaveFormErrorsProps {
  errors: Record<string, string>;
}

const LeaveFormErrors = ({ errors }: LeaveFormErrorsProps) => {
  return (
    <>
      {errors.dates && (
        <p className="text-sm text-red-600">{errors.dates}</p>
      )}
      {errors.balance && (
        <p className="text-sm text-red-600">{errors.balance}</p>
      )}
      {errors.leaveType && (
        <p className="text-sm text-red-600">{errors.leaveType}</p>
      )}
      {errors.reason && (
        <p className="text-sm text-red-600">{errors.reason}</p>
      )}
    </>
  );
};

export default LeaveFormErrors;
