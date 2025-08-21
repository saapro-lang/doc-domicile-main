export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedDate: Date;
  modifiedBy: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  parentId?: string;
  isShared: boolean;
  permissions: Permission[];
  teamId?: string;
  ownerId: string;
  isTeamFile: boolean;
}

export interface Permission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  memberCount: number;
  isPublic: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'member';
  teams: string[];
}

export interface FolderNode {
  item: FileItem;
  children: FolderNode[];
  isExpanded: boolean;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'modified' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';