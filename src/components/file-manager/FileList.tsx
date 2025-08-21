import { useState } from "react";
import { 
  FileText, 
  Folder, 
  MoreVertical, 
  Share, 
  Download, 
  Trash2, 
  Edit, 
  Copy,
  Palette,
  ChevronUp,
  ChevronDown
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FileItem, SortBy, SortOrder } from "@/types/fileManager";
import { formatFileSize, formatDate } from "@/lib/fileUtils";

interface FileListProps {
  items: FileItem[];
  selectedItems: Set<string>;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onItemSelect: (id: string, selected: boolean) => void;
  onItemDoubleClick: (item: FileItem) => void;
  onItemDelete: (id: string) => void;
  onItemShare: (id: string) => void;
  onItemRename: (id: string) => void;
  onItemDownload: (id: string) => void;
  onFolderColorChange: (id: string, color: string) => void;
  onSort: (sortBy: SortBy) => void;
}

export function FileList({
  items,
  selectedItems,
  sortBy,
  sortOrder,
  onItemSelect,
  onItemDoubleClick,
  onItemDelete,
  onItemShare,
  onItemRename,
  onItemDownload,
  onFolderColorChange,
  onSort,
}: FileListProps) {
  const folderColors = ['blue', 'green', 'purple', 'orange', 'red'];

  const handleSelectAll = (checked: boolean) => {
    items.forEach(item => {
      onItemSelect(item.id, checked);
    });
  };

  const allSelected = items.length > 0 && items.every(item => selectedItems.has(item.id));
  const someSelected = items.some(item => selectedItems.has(item.id));

  const handleItemClick = (item: FileItem, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      onItemSelect(item.id, !selectedItems.has(item.id));
    } else {
      selectedItems.forEach(id => {
        if (id !== item.id) {
          onItemSelect(id, false);
        }
      });
      onItemSelect(item.id, !selectedItems.has(item.id));
    }
  };

  const SortableHeader = ({ column, children }: { column: SortBy; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => onSort(column)}
        className="h-auto p-0 font-semibold hover:bg-transparent"
      >
        <div className="flex items-center gap-1">
          {children}
          {sortBy === column && (
            sortOrder === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          )}
        </div>
      </Button>
    </TableHead>
  );

  return (
    <div className="px-6 pb-6">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el && el.querySelector('button')) {
                    (el.querySelector('button') as any).indeterminate = someSelected && !allSelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <SortableHeader column="name">Name</SortableHeader>
            <SortableHeader column="modified">Modified</SortableHeader>
            <TableHead>Modified By</TableHead>
            <SortableHeader column="size">Size</SortableHeader>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isSelected = selectedItems.has(item.id);
            
            return (
              <TableRow
                key={item.id}
                className={cn(
                  "group cursor-pointer transition-smooth border-border hover:bg-file-item-hover",
                  isSelected && "bg-file-item-selected"
                )}
                onClick={(e) => handleItemClick(item, e)}
                onDoubleClick={() => onItemDoubleClick(item)}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onItemSelect(item.id, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.type === 'folder' ? (
                      <Folder 
                        className={cn(
                          "w-5 h-5",
                          item.color ? `text-folder-${item.color}` : "text-primary"
                        )} 
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-500" />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.name}</span>
                      {item.isShared && (
                        <Share className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="text-muted-foreground">
                  {formatDate(item.modifiedDate)}
                </TableCell>
                
                <TableCell className="text-muted-foreground">
                  {item.modifiedBy}
                </TableCell>
                
                <TableCell className="text-muted-foreground">
                  {item.type === 'file' && item.size ? formatFileSize(item.size) : '—'}
                </TableCell>
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onItemShare(item.id)}>
                        <Share className="h-4 w-4 mr-2" />
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}