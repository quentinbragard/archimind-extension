// src/components/templates/PinButton.tsx
import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMessage } from '@/core/utils/i18n';
interface PinButtonProps {
  isPinned: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Pin/unpin button component
 */
export function PinButton({
  isPinned,
  onClick,
  className = '',
  disabled = false
}: PinButtonProps) {
  // Handle click with stop propagation to prevent expanding/collapsing folder
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-6 w-6 p-0 flex-shrink-0 ${
        isPinned 
          ? 'text-yellow-500' 
          : 'text-muted-foreground opacity-70 hover:opacity-100'
      } ${className}`}
      onClick={handleClick}
      title={isPinned ? getMessage('unpin_folder', undefined, 'Unpin folder') : getMessage('pin_folder', undefined, 'Pin folder')}
      disabled={disabled}
    >
      <Star className={`h-4 w-4 ${isPinned ? 'fill-yellow-500' : ''}`} />
    </Button>
  );
}