import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Users, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileItem, FolderNode, Team } from "@/types/fileManager";

interface FileManagerSidebarProps {
  teams: Team[];
  currentTeam: Team | null;
  onTeamSelect: (team: Team | null) => void;
  folderTree: FolderNode[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onCreateFolder: (parentId?: string, isTeamFolder?: boolean) => void;
}

export function FileManagerSidebar({
  teams,
  currentTeam,
  onTeamSelect,
  folderTree,
  currentFolderId,
  onFolderSelect,
  onCreateFolder,
}: FileManagerSidebarProps) {
  console.log("FileManagerSidebar: Component loaded without sidebar dependencies");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderFolderNode = (node: FolderNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.item.id);
    const isSelected = currentFolderId === node.item.id;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.item.id}>
        <div 
          className={cn(
            "flex items-center w-full transition-smooth rounded-lg cursor-pointer py-2 px-2 mx-2 my-1",
            isSelected && "bg-file-item-selected text-primary font-medium",
            !isSelected && "hover:bg-file-item-hover"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => onFolderSelect(node.item.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <div
                className="h-4 w-4 p-0 hover:bg-secondary rounded flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.item.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>
            )}
            {!hasChildren && <div className="w-4" />}
            {isExpanded ? (
              <FolderOpen 
                className={cn(
                  "h-4 w-4", 
                  node.item.color && `text-folder-${node.item.color}`
                )} 
              />
            ) : (
              <Folder 
                className={cn(
                  "h-4 w-4",
                  node.item.color && `text-folder-${node.item.color}`
                )} 
              />
            )}
            <span className="truncate text-sm">{node.item.name}</span>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex-1 overflow-auto">
        {/* Team Selector */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-foreground flex items-center justify-between mb-3">
            Teams
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <div className="space-y-1">
              <div
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-smooth",
                  !currentTeam && "text-[#605BFF] font-medium",
                  currentTeam && "hover:bg-file-item-hover"
                )}
                onClick={() => onTeamSelect(null)}
              >
                <User className="h-4 w-4" />
                <span>Personal Files</span>
              </div>
              {teams.map((team) => (
                <div
                  key={team.id}
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-smooth",
                    currentTeam?.id === team.id && "text-[#605BFF] font-medium",
                    currentTeam?.id !== team.id && "hover:bg-file-item-hover"
                  )}
                  onClick={() => onTeamSelect(team)}
                >
                  <Users className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span>{team.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {team.memberCount} members
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Folder Tree */}
        <div>
          <div className="text-sm font-semibold text-foreground flex items-center justify-between mb-3">
            Folders
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onCreateFolder(undefined, !!currentTeam)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <div className="space-y-1">
              <div
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-smooth",
                  !currentFolderId && "bg-file-item-selected text-primary font-medium",
                  currentFolderId && "hover:bg-file-item-hover"
                )}
                onClick={() => onFolderSelect(null)}
              >
                <FolderOpen className="h-4 w-4 text-primary" />
                <span>All Files</span>
              </div>
              {folderTree.map((node) => renderFolderNode(node))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}