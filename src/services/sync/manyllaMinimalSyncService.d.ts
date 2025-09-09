import { ChildProfile } from '../../types/ChildProfile';

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
  setDataCallback(callback: () => any): void;
  enableSync(recoveryPhrase: string): Promise<void>;
  getSyncId(): string;
  pushData(): Promise<void>;
  pullData(): Promise<any>;
  disableSync(): Promise<void>;
}

declare const manyllaMinimalSyncService: SyncService;
export default manyllaMinimalSyncService;