export interface PlaybackTokenResponse {
  iframeUrl: string;
  embedUrl: string;
  directStreamUrl?: string;
  expiresAt: number;
}

export interface VideoDetails {
  videoId: string;
  libraryId: string;
  title: string;
  durationSeconds: number;
  status: 'processing' | 'ready' | 'failed';
  thumbnailUrl: string;
  encodingProgress: number;
}

export interface DirectUploadSignature {
  videoId: string;
  libraryId: string;
  uploadUrl: string;
  authorizationHeader?: string;
  expirationTimestamp: number;
}

export interface IVideoProvider {
  /**
   * Generates a signed playback token / embed URL for a student.
   * Prevents hotlinking and direct downloading.
   */
  generateSignedPlaybackUrl(
    videoId: string,
    userIp?: string,
    expirationSeconds?: number
  ): Promise<PlaybackTokenResponse>;

  /**
   * Retrieves video status and details directly from provider API.
   */
  getVideoDetails(videoId: string): Promise<VideoDetails>;

  /**
   * Generates a pre-signed direct upload signature for teacher uploads.
   */
  generateUploadSignature(title: string): Promise<DirectUploadSignature>;

  /**
   * Deletes a video from the provider.
   */
  deleteVideo(videoId: string): Promise<boolean>;

  /**
   * Verifies the authenticity of a webhook request from the provider.
   */
  verifyWebhookSignature(signature: string, rawBody: string): boolean;
}
