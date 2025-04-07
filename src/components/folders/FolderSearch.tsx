// src/components/templates/FolderSearch.tsx
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FolderSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholderText?: string;
  onReset?: () => void;
  className?: string;
}

/**
 * Search component for folders and templates
 */
export function FolderSearch({
  searchQuery,
  onSearchChange,
  placeholderText = 'Search folders...',
  onReset,
  className = ''
}: FolderSearchProps) {
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };
  
  // Handle reset button click
  const handleReset = () => {
    onSearchChange('');
    if (onReset) {
      onReset();
    }
  };
  
  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center relative mb-2">
        <div className="absolute left-2 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input 
          value={searchQuery} 
          onChange={handleSearchChange}
          placeholder={placeholderText}
          className="w-full pl-8 pr-8"
        />
        {searchQuery && (
          <div className="absolute right-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleReset}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}