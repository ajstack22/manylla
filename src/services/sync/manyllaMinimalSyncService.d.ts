import { ChildProfile } from "../../types/ChildProfile";

export interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  syncError: string | null;
}

export interface SyncService {
  setupSync(recoveryPhrase: string): Promise<void>;
  generateRecoveryPhrase(): string;
  syncProfiles(profiles: ChildProfile[]): Promise<void>;
  pullProfiles(): Promise<ChildProfile[]>;
  clearSync(): Promise<void>;
  getSyncStatus(): SyncStatus;
  isEnabled(): boolean;
  isSyncEnabled(): boolean;
  setDataCallback(callback: (profile: any) => void): void;
  enableSync(recoveryPhrase: string, initialData?: any): Promise<void>;
  getSyncId(): string;
  pushData(data?: any): Promise<void>;
  pullData(ignoreLastPull?: boolean): Promise<any>;
  disableSync(): Promise<void>;
}

declare const manyllaMinimalSyncService: SyncService;
export default manyllaMinimalSyncService;
