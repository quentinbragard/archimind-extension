import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { getMessage } from '@/core/utils/i18n';

export function PinButton({ isPinned, onClick, className }: { isPinned: boolean, onClick: () => void, className: string }) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 w-6 p-0 ${isPinned ? 'text-yellow-500' : 'text-muted-foreground opacity-70 hover:opacity-100'} ${className}`}
        onClick={onClick}
        title={isPinned ? getMessage('unpin_folder', undefined, 'Unpin folder') : getMessage('pin_folder', undefined, 'Pin folder')}
      >
        <Star className={`h-4 w-4 ${isPinned ? 'fill-yellow-500' : ''}`} />
      </Button>
    );
  }