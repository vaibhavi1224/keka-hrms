
// Input validation utilities for security enhancement
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
  return phoneRegex.test(phone);
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim()
    .substring(0, 1000); // Limit length
};

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  const now = new Date();
  const maxFutureDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now
  
  return (
    startDate <= endDate &&
    startDate >= now &&
    endDate <= maxFutureDate
  );
};

export const validateTextLength = (text: string, maxLength: number = 500): boolean => {
  return text.length <= maxLength;
};

export const validateNumericInput = (value: number, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): boolean => {
  return value >= min && value <= max && Number.isFinite(value);
};

export const validateSearchTerm = (searchTerm: string): string => {
  return searchTerm
    .replace(/[^a-zA-Z0-9\s]/g, '') // Only allow alphanumeric and spaces
    .trim()
    .substring(0, 50); // Limit search term length
};
