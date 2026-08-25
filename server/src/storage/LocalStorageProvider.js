import fs from 'fs/promises';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import path from 'path';
import StorageProvider from './StorageProvider.js';
import config from '../config/index.js';

export class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.basePath = path.resolve(config.storage.localPath || './uploads');
    if (!existsSync(this.basePath)) {
      mkdirSync(this.basePath, { recursive: true });
    }
  }

  async saveFile(fileBuffer, key) {
    const fullPath = path.join(this.basePath, key);
    const dir = path.dirname(fullPath);
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(fullPath, fileBuffer);
    return key;
  }

  async getFileStream(key) {
    const fullPath = path.join(this.basePath, key);
    if (!existsSync(fullPath)) {
      throw new Error('File not found in storage');
    }
    return createReadStream(fullPath);
  }

  async deleteFile(key) {
    const fullPath = path.join(this.basePath, key);
    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }
  }

  async getSignedUrl(key) {
    // For local storage, route downloads through authenticated API endpoint
    return `/api/documents/stream/${encodeURIComponent(key)}`;
  }
}

export default LocalStorageProvider;
