
import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { validateSearchTerm } from '@/utils/validation/inputValidation';
import { useDebounce } from '@/hooks/useDebounce';

interface EmployeeSearchSecureProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

const EmployeeSearchSecure = ({ onSearch, placeholder = "Search employees..." }: EmployeeSearchSecureProps) => {
  const [searchInput, setSearchInput] = useState('');
  
  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sanitize and validate search term
  const sanitizedSearchTerm = useMemo(() => {
    return validateSearchTerm(debouncedSearch);
  }, [debouncedSearch]);

  // Execute search with sanitized term
  React.useEffect(() => {
    onSearch(sanitizedSearchTerm);
  }, [sanitizedSearchTerm, onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Immediate basic validation
    if (value.length <= 50) {
      setSearchInput(value);
    }
  }, []);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchInput}
        onChange={handleInputChange}
        className="pl-10"
        maxLength={50}
        autoComplete="off"
        spellCheck="false"
      />
      {searchInput.length >= 50 && (
        <p className="text-xs text-amber-600 mt-1">
          Search term limited to 50 characters
        </p>
      )}
    </div>
  );
};

export default EmployeeSearchSecure;
