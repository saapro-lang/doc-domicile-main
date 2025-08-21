import { useState } from "react";
import { 
  FileText, 
  Folder, 
  MoreVertical, 
  Share2, 
  Download, 
  Trash2, 
  Edit, 
  Copy,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FileItem } from "@/types/fileManager";
import { formatFileSize, formatDate } from "@/lib/fileUtils";

interface FileGridProps {
  items: FileItem[];
  selectedItems: Set<string>;
  onItemSelect: (id: string, selected: boolean) => void;
  onItemDoubleClick: (item: FileItem) => void;
  onItemDelete: (id: string) => void;
  onItemShare: (id: string) => void;
  onItemRename: (id: string) => void;
  onItemDownload: (id: string) => void;
  onFolderColorChange: (id: string, color: string) => void;
}

export function FileGrid({
  items,
  selectedItems,
  onItemSelect,
  onItemDoubleClick,
  onItemDelete,
  onItemShare,
  onItemRename,
  onItemDownload,
  onFolderColorChange,
}: FileGridProps) {
  const folderColors = ['blue', 'green', 'purple', 'orange', 'red'];

  const handleItemClick = (item: FileItem, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      onItemSelect(item.id, !selectedItems.has(item.id));
    } else {
      // Single select - clear other selections
      selectedItems.forEach(id => {
        if (id !== item.id) {
          onItemSelect(id, false);
        }
      });
      onItemSelect(item.id, !selectedItems.has(item.id));
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-6">
      {items.map((item) => {
        const isSelected = selectedItems.has(item.id);
        
        return (
          <div
            key={item.id}
            className={cn(
              "group relative p-4 rounded-lg border border-border bg-card cursor-pointer transition-smooth hover:shadow-md hover:bg-file-item-hover",
              isSelected && "bg-file-item-selected border-primary shadow-md"
            )}
            onClick={(e) => handleItemClick(item, e)}
            onDoubleClick={() => onItemDoubleClick(item)}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onItemSelect(item.id, !!checked)}
                className="bg-background border-border"
              />
            </div>

            {/* Actions Menu */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onItemShare(item.id)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onItemDownload(item.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onItemRename(item.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  
                  {item.type === 'folder' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="p-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start h-auto p-2"
                            >
                              <Palette className="h-4 w-4 mr-2" />
                              Change Color
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="left" align="start">
                            {folderColors.map((color) => (
                              <DropdownMenuItem
                                key={color}
                                onClick={() => onFolderColorChange(item.id, color)}
                                className="flex items-center gap-2"
                              >
                                <div 
                                  className={cn(
                                    "w-4 h-4 rounded-full",
                                    `bg-folder-${color}`
                                  )}
                                />
                                <span className="capitalize">{color}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onItemDelete(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* File/Folder Icon */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 flex items-center justify-center">
                {item.type === 'folder' ? (
                  <Folder 
                    className={cn(
                      "w-10 h-10",
                      item.color ? `text-folder-${item.color}` : "text-primary"
                    )} 
                  />
                ) : (
                  <FileText className="w-10 h-10 text-[#605BFF]" />
                )}
              </div>

              {/* File/Folder Name */}
              <div className="w-full">
                <p className="text-sm font-medium text-foreground truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.type === 'file' && item.size ? formatFileSize(item.size) : ''}
                </p>
              </div>

              {/* Metadata */}
              <div className="w-full text-xs text-muted-foreground space-y-1">
                <p>{formatDate(item.modifiedDate)}</p>
                <p className="truncate">{item.modifiedBy}</p>
                {item.isShared && (
                  <div className="flex items-center justify-center">
                    <Share2 className="w-3 h-3 text-[#605BFF]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}