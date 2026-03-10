import { Injectable } from '@angular/core';
import imageCompression from 'browser-image-compression';

@Injectable({
  providedIn: 'root'
})
export class ImageCompressionService {
  private readonly MAX_SIZE_MB = 0.25; // 250 Ko
  private readonly MAX_WIDTH_OR_HEIGHT = 1200;

  async compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) {
      throw new Error("Le fichier sélectionné n'est pas une image.");
    }

    const options = {
      maxSizeMB: this.MAX_SIZE_MB,
      maxWidthOrHeight: this.MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.8
    };

    const compressedFile = await imageCompression(file, options);

    if (compressedFile.size > 250 * 1024) {
      throw new Error(
        "Impossible de compresser l'image sous 250 Ko. Merci de choisir une image plus légère."
      );
    }

    const finalName = this.renameToWebp(file.name);

    return new File([compressedFile], finalName, {
      type: 'image/webp'
    });
  }

  private renameToWebp(fileName: string): string {
    const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
    return `${fileNameWithoutExtension}.webp`;
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  }
}