import { downloadFile } from '../client';

export const backupApi = {
  export: () => downloadFile('/backup/export'),
};