/** Durée maximale vidéo PNIGVS — 3 minutes. */
export const MAX_VIDEO_DURATION_SECONDS = 180;

export function getVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        reject(new Error('Durée vidéo illisible.'));
        return;
      }
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de lire la vidéo.'));
    };

    video.src = url;
  });
}
