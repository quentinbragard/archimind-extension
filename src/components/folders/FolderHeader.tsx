// src/components/folders/FolderHeader.tsx
import { Folder, ChevronDown, ChevronRight } from "lucide-react";

export function FolderHeader({ folder, isExpanded, onToggle, actionButtons }: { folder: any, isExpanded: boolean, onToggle: () => void, actionButtons: React.ReactNode }) {
    return (
      <div 
        className="group flex items-center p-2 hover:bg-accent/60 cursor-pointer rounded-sm"
        onClick={onToggle}
      >
        {isExpanded ? 
          <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" /> : 
          <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
        }
        <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-sm flex-1 truncate">{folder.name}</span>
        
        {folder.templates?.length > 0 && (
          <span className="text-xs text-muted-foreground mr-2">
            {folder.templates.length} {folder.templates.length === 1 ? 'template' : 'templates'}
          </span>
        )}
        
        {actionButtons}
      </div>
    );
  }