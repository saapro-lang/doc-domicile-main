import { useState, useMemo } from "react";
import { FileManagerSidebar } from "@/components/file-manager/FileManagerSidebar";
import { FileManagerHeader } from "@/components/file-manager/FileManagerHeader";
import { FileGrid } from "@/components/file-manager/FileGrid";
import { FileList } from "@/components/file-manager/FileList";
import { FileItem, FolderNode, Team, ViewMode, SortBy, SortOrder } from "@/types/fileManager";
import { sortItems, generateId } from "@/lib/fileUtils";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockTeams: Team[] = [
  { id: "team1", name: "Design Team", memberCount: 8, isPublic: false },
  { id: "team2", name: "Development Team", memberCount: 12, isPublic: false },
  { id: "team3", name: "Marketing Team", memberCount: 6, isPublic: true },
];

const mockFiles: FileItem[] = [
  {
    id: "1",
    name: "Project Requirements",
    type: "folder",
    modifiedDate: new Date("2024-01-15"),
    modifiedBy: "Alice Chen",
    color: "blue",
    isShared: true,
    permissions: [],
    ownerId: "user1",
    isTeamFile: false,
  },
  {
    id: "2",
    name: "Meeting Transcripts",
    type: "folder",
    modifiedDate: new Date("2024-01-20"),
    modifiedBy: "Bob Smith",
    color: "green",
    parentId: "1",
    isShared: false,
    permissions: [],
    ownerId: "user1",
    isTeamFile: false,
  },
  {
    id: "3",
    name: "Q1_Planning_Meeting.transcript",
    type: "file",
    size: 2048576,
    modifiedDate: new Date("2024-01-22"),
    modifiedBy: "Carol Williams",
    parentId: "2",
    isShared: true,
    permissions: [],
    ownerId: "user1",
    isTeamFile: false,
  },
  {
    id: "4",
    name: "Team Standup Jan 23.transcript",
    type: "file",
    size: 1024768,
    modifiedDate: new Date("2024-01-23"),
    modifiedBy: "David Brown",
    parentId: "2",
    isShared: false,
    permissions: [],
    ownerId: "user1",
    isTeamFile: false,
  },
  {
    id: "5",
    name: "Design Assets",
    type: "folder",
    modifiedDate: new Date("2024-01-18"),
    modifiedBy: "Eva Davis",
    color: "purple",
    isShared: true,
    permissions: [],
    ownerId: "user1",
    isTeamFile: true,
    teamId: "team1",
  },
];

export function FileManager() {
  const { toast } = useToast();
  
  // State
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<FileItem[]>(mockFiles);

  // Filter files based on current context
  const filteredFiles = useMemo(() => {
    let filtered = files;

    // Filter by team context
    if (currentTeam) {
      filtered = filtered.filter(file => file.teamId === currentTeam.id);
    } else {
      filtered = filtered.filter(file => !file.isTeamFile);
    }

    // Filter by current folder
    if (currentFolderId) {
      filtered = filtered.filter(file => file.parentId === currentFolderId);
    } else {
      filtered = filtered.filter(file => !file.parentId);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return sortItems(filtered, sortBy, sortOrder);
  }, [files, currentTeam, currentFolderId, searchQuery, sortBy, sortOrder]);

  // Build folder tree for sidebar
  const folderTree = useMemo(() => {
    const buildTree = (parentId?: string): FolderNode[] => {
      const folders = files.filter(
        file => file.type === 'folder' && 
        file.parentId === parentId &&
        (currentTeam ? file.teamId === currentTeam.id : !file.isTeamFile)
      );

      return folders.map(folder => ({
        item: folder,
        children: buildTree(folder.id),
        isExpanded: false,
      }));
    };

    return buildTree();
  }, [files, currentTeam]);

  // Build breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs = [{ id: null, name: currentTeam ? currentTeam.name : "Personal Files" }];
    
    if (currentFolderId) {
      const buildPath = (folderId: string): Array<{ id: string; name: string }> => {
        const folder = files.find(f => f.id === folderId);
        if (!folder) return [];
        
        const path = folder.parentId ? buildPath(folder.parentId) : [];
        return [...path, { id: folder.id, name: folder.name }];
      };
      
      crumbs.push(...buildPath(currentFolderId));
    }
    
    return crumbs;
  }, [currentFolderId, files, currentTeam]);

  // Event handlers
  const handleItemSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
    }
  };

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleCreateFolder = (parentId?: string, isTeamFolder = false) => {
    const newFolder: FileItem = {
      id: generateId(),
      name: "New Folder",
      type: "folder",
      modifiedDate: new Date(),
      modifiedBy: "Current User",
      parentId,
      color: "blue",
      isShared: false,
      permissions: [],
      ownerId: "user1",
      isTeamFile: isTeamFolder,
      teamId: isTeamFolder ? currentTeam?.id : undefined,
    };

    setFiles(prev => [...prev, newFolder]);
    toast({
      title: "Folder created",
      description: `"${newFolder.name}" has been created successfully.`,
    });
  };

  const handleItemDelete = (id: string) => {
    const item = files.find(f => f.id === id);
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    toast({
      title: "Item deleted",
      description: `"${item?.name}" has been deleted.`,
    });
  };

  const handleItemShare = (id: string) => {
    const item = files.find(f => f.id === id);
    toast({
      title: "Share link copied",
      description: `Share link for "${item?.name}" has been copied to clipboard.`,
    });
  };

  const handleItemRename = (id: string) => {
    // In a real app, this would open a rename dialog
    toast({
      title: "Rename",
      description: "Rename functionality would be implemented here.",
    });
  };

  const handleItemDownload = (id: string) => {
    const item = files.find(f => f.id === id);
    toast({
      title: "Download started",
      description: `Downloading "${item?.name}"...`,
    });
  };

  const handleFolderColorChange = (id: string, color: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, color: color as any } : file
    ));
  };

  const handleBulkDownload = () => {
    toast({
      title: "Download started",
      description: `Downloading ${selectedItems.size} items...`,
    });
  };

  const handleBulkDelete = () => {
    const itemNames = Array.from(selectedItems).map(id => 
      files.find(f => f.id === id)?.name
    ).filter(Boolean);
    
    setFiles(prev => prev.filter(f => !selectedItems.has(f.id)));
    setSelectedItems(new Set());
    
    toast({
      title: "Items deleted",
      description: `${itemNames.length} items have been deleted.`,
    });
  };

  const handleBulkShare = () => {
    toast({
      title: "Share links copied",
      description: `Share links for ${selectedItems.size} items have been copied.`,
    });
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Transcript Folder</h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Easily and efficiently manage your transcript files.
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <div className="w-80 border shrink-0 bg-white">
          <FileManagerSidebar
            teams={mockTeams}
            currentTeam={currentTeam}
            onTeamSelect={setCurrentTeam}
            folderTree={folderTree}
            currentFolderId={currentFolderId}
            onFolderSelect={setCurrentFolderId}
            onCreateFolder={handleCreateFolder}
          />
        </div>
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <FileManagerHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(sortBy, sortOrder) => {
                setSortBy(sortBy);
                setSortOrder(sortOrder);
              }}
              selectedCount={selectedItems.size}
              onUploadFile={() => toast({ title: "Upload", description: "File upload would be implemented here." })}
              onCreateFolder={() => handleCreateFolder(currentFolderId, !!currentTeam)}
              onDownloadSelected={handleBulkDownload}
              onDeleteSelected={handleBulkDelete}
              onShareSelected={handleBulkShare}
              breadcrumbs={breadcrumbs}
              onBreadcrumbClick={setCurrentFolderId}
            />
            
            <div className="flex-1 overflow-auto">
              {viewMode === 'grid' ? (
                <FileGrid
                  items={filteredFiles}
                  selectedItems={selectedItems}
                  onItemSelect={handleItemSelect}
                  onItemDoubleClick={handleItemDoubleClick}
                  onItemDelete={handleItemDelete}
                  onItemShare={handleItemShare}
                  onItemRename={handleItemRename}
                  onItemDownload={handleItemDownload}
                  onFolderColorChange={handleFolderColorChange}
                />
              ) : (
                <FileList
                  items={filteredFiles}
                  selectedItems={selectedItems}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onItemSelect={handleItemSelect}
                  onItemDoubleClick={handleItemDoubleClick}
                  onItemDelete={handleItemDelete}
                  onItemShare={handleItemShare}
                  onItemRename={handleItemRename}
                  onItemDownload={handleItemDownload}
                  onFolderColorChange={handleFolderColorChange}
                  onSort={handleSort}
                />
              )}
            </div>
          </main>
      </div>
    </div>
  );
}