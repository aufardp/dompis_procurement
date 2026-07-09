export type DashboardStats = {
  totalBerkas: number;
  draft: number;
  pending: number;
  completed: number;
  rejected: number;
  recentBerkas: Array<{
    id: string;
    nomor: string;
    currentStage: string;
    approvalStatus: string;
    createdAt: string;
  }>;
};

export type BerkasResponse = {
  id: string;
  nomor: string;
  currentStage: string;
  approvalStatus: string;
  currentPosisiId: string;
  createdAt: string;
  updatedAt: string;
};

export type MasterEntity = {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
};