/**
 * Abstract storage provider interface.
 * Medical documents MUST NOT be stored in public buckets.
 */
export class StorageProvider {
  async saveFile(fileBuffer, key, mimeType) {
    throw new Error('saveFile must be implemented');
  }

  async getFileStream(key) {
    throw new Error('getFileStream must be implemented');
  }

  async deleteFile(key) {
    throw new Error('deleteFile must be implemented');
  }

  async getSignedUrl(key, expiresInSeconds = 300) {
    throw new Error('getSignedUrl must be implemented');
  }
}

export default StorageProvider;
