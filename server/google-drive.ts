import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { 
  exportEquipmentToExcel,
  exportMaintenanceToExcel,
  exportFaultReportsToExcel
} from './excel';

export class GoogleDriveService {
  private drive: any;
  private auth: any;

  constructor() {
    // Initialize Google Auth
    this.auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  // Upload file to Google Drive
  async uploadFile(fileName: string, buffer: Buffer, folderId?: string) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined
      };

      const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from(buffer)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      return response.data.id;
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  // Download file from Google Drive
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'arraybuffer' });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading file from Google Drive:', error);
      throw error;
    }
  }

  // Create folder in Google Drive
  async createFolder(folderName: string, parentFolderId?: string) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      return response.data.id;
    } catch (error) {
      console.error('Error creating folder in Google Drive:', error);
      throw error;
    }
  }

  // List files in folder
  async listFiles(folderId?: string) {
    try {
      const query = folderId ? `'${folderId}' in parents` : undefined;
      
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, modifiedTime, size)'
      });

      return response.data.files;
    } catch (error) {
      console.error('Error listing files from Google Drive:', error);
      throw error;
    }
  }

  // Auto backup data to Google Drive
  async autoBackup() {
    try {
      console.log('Starting auto backup to Google Drive...');
      
      // Export all data
      const equipmentBuffer = await exportEquipmentToExcel();
      const maintenanceBuffer = await exportMaintenanceToExcel();
      const faultReportsBuffer = await exportFaultReportsToExcel();

      // Create backup folder with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const backupFolderName = `Medical_Equipment_Backup_${timestamp}`;
      const folderId = await this.createFolder(backupFolderName);

      // Upload files
      await Promise.all([
        this.uploadFile(`الأجهزة_الطبية_${timestamp}.xlsx`, equipmentBuffer, folderId),
        this.uploadFile(`سجلات_الصيانة_${timestamp}.xlsx`, maintenanceBuffer, folderId),
        this.uploadFile(`تقارير_الأعطال_${timestamp}.xlsx`, faultReportsBuffer, folderId)
      ]);

      console.log('Auto backup completed successfully!');
      return folderId;
    } catch (error) {
      console.error('Auto backup failed:', error);
      throw error;
    }
  }

  // Schedule auto backup (every 24 hours)
  startAutoBackup() {
    // Initial backup
    this.autoBackup().catch(console.error);

    // Schedule daily backup at 2 AM
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() === 0) {
        await this.autoBackup().catch(console.error);
      }
    }, 60000); // Check every minute
  }
}

export const googleDriveService = new GoogleDriveService();