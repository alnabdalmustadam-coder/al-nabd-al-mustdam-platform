import crypto from 'crypto';
import { IVideoProvider, PlaybackTokenResponse, VideoDetails, DirectUploadSignature } from '../video-provider.interface';

export class BunnyStreamProvider implements IVideoProvider {
  private libraryId: string;
  private apiKey: string;
  private tokenKey: string;
  private embedHost: string;

  constructor() {
    this.libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || '729792';
    this.apiKey = process.env.BUNNY_STREAM_API_KEY || '6887d568-bc32-4e3a-94e34bab80e6-2cd2-450d';
    this.tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || 'c12446aa-69f3-4f18-b607-dd9d2b7c4865';
    this.embedHost = process.env.BUNNY_STREAM_EMBED_HOST || 'https://iframe.mediadelivery.net';
  }

  /**
   * Generates a signed Bunny Stream iframe embed URL with expiring token authentication.
   */
  async generateSignedPlaybackUrl(
    videoId: string,
    userIp?: string,
    expirationSeconds: number = 7200 // 2 hours default
  ): Promise<PlaybackTokenResponse> {
    const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
    
    // Bunny Stream Token Hash Formula
    // Official standard: SHA256(tokenKey + videoId + expires)
    let tokenParam = '';
    if (this.tokenKey) {
      const hashInput = `${this.tokenKey}${videoId}${expires}`;
      
      const token = crypto
        .createHash('sha256')
        .update(hashInput)
        .digest('hex');
        
      tokenParam = `?token=${token}&expires=${expires}&autoplay=true&preload=true`;
    } else {
      tokenParam = `?expires=${expires}&autoplay=true&preload=true`;
    }

    const iframeUrl = `${this.embedHost}/embed/${this.libraryId}/${videoId}${tokenParam}`;
    const embedUrl = `${this.embedHost}/play/${this.libraryId}/${videoId}${tokenParam}`;

    return {
      iframeUrl,
      embedUrl,
      expiresAt: expires,
    };
  }

  /**
   * Fetches video details from Bunny Stream REST API.
   */
  async getVideoDetails(videoId: string): Promise<VideoDetails> {
    if (!this.apiKey || !this.libraryId) {
      return {
        videoId,
        libraryId: this.libraryId,
        title: 'فيديو تجريبي',
        durationSeconds: 300,
        status: 'ready',
        thumbnailUrl: `https://vz-${this.libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`,
        encodingProgress: 100,
      };
    }

    try {
      const res = await fetch(
        `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
        {
          headers: {
            AccessKey: this.apiKey,
            accept: 'application/json',
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Bunny API error: ${res.statusText}`);
      }

      const data = await res.json();
      
      const statusMap: Record<number, 'processing' | 'ready' | 'failed'> = {
        0: 'processing', // Created
        1: 'processing', // Uploaded
        2: 'processing', // Processing
        3: 'ready',      // Transcoded
        4: 'failed',     // Error
      };

      return {
        videoId: data.guid,
        libraryId: `${data.videoLibraryId}`,
        title: data.title || '',
        durationSeconds: data.length || 0,
        status: statusMap[data.status] || 'ready',
        thumbnailUrl: `https://vz-${this.libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`,
        encodingProgress: data.encodeProgress || 100,
      };
    } catch (err) {
      console.error('Error fetching Bunny video details:', err);
      return {
        videoId,
        libraryId: this.libraryId,
        title: '',
        durationSeconds: 0,
        status: 'ready',
        thumbnailUrl: '',
        encodingProgress: 100,
      };
    }
  }

  /**
   * Generates direct upload signature for teacher uploads to Bunny Stream.
   */
  async generateUploadSignature(title: string): Promise<DirectUploadSignature> {
    const expirationTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    if (!this.apiKey || !this.libraryId) {
      const mockId = `mock_vid_${Date.now()}`;
      return {
        videoId: mockId,
        libraryId: 'mock_lib',
        uploadUrl: `https://video.bunnycdn.com/library/mock_lib/videos/${mockId}`,
        expirationTimestamp,
      };
    }

    // 1. Create Video Object in Bunny Stream
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${this.libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          AccessKey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      }
    );

    const videoData = await createRes.json();
    const videoId = videoData.guid;

    return {
      videoId,
      libraryId: this.libraryId,
      uploadUrl: `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
      authorizationHeader: this.apiKey,
      expirationTimestamp,
    };
  }

  /**
   * Deletes a video from Bunny Stream.
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    if (!this.apiKey || !this.libraryId) return true;

    try {
      const res = await fetch(
        `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
        {
          method: 'DELETE',
          headers: {
            AccessKey: this.apiKey,
          },
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Verifies Webhook signature from Bunny.
   */
  verifyWebhookSignature(signature: string, rawBody: string): boolean {
    if (!this.tokenKey) return true;
    const computed = crypto
      .createHmac('sha256', this.tokenKey)
      .update(rawBody)
      .digest('hex');
    return computed === signature;
  }
}
