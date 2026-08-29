import crypto from 'crypto';
import { IVideoProvider, PlaybackTokenResponse, VideoDetails, DirectUploadSignature } from '../video-provider.interface';

export class BunnyStreamProvider implements IVideoProvider {
  private libraryId: string;
  private apiKey: string;
  private tokenKey: string;
  private embedHost: string;

  constructor() {
    this.libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || '';
    this.apiKey = process.env.BUNNY_STREAM_API_KEY || '';
    this.tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || '';
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
    if (!this.libraryId || !this.tokenKey) {
      throw new Error('Bunny Stream playback is not configured');
    }
    const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
    
    // Bunny Stream Token Hash Formula
    // Official standard: SHA256(tokenKey + videoId + expires)
    const hashInput = `${this.tokenKey}${videoId}${expires}`;
    const token = crypto.createHash('sha256').update(hashInput).digest('hex');
    const tokenParam = `?token=${token}&expires=${expires}&autoplay=true&preload=true`;

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
    if (!this.apiKey || !this.libraryId) throw new Error('Bunny Stream is not configured');

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

    if (!this.apiKey || !this.libraryId) throw new Error('Bunny Stream is not configured');

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

    if (!createRes.ok) {
      throw new Error(`Bunny API error: ${createRes.status}`);
    }
    const videoData = await createRes.json();
    const videoId = videoData.guid;

    return {
      videoId,
      libraryId: this.libraryId,
      uploadUrl: 'https://video.bunnycdn.com/tusupload',
      signature: crypto
        .createHash('sha256')
        .update(`${this.libraryId}${this.apiKey}${expirationTimestamp}${videoId}`)
        .digest('hex'),
      expirationTimestamp,
    };
  }

  /**
   * Deletes a video from Bunny Stream.
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    if (!this.apiKey || !this.libraryId) return false;

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
    if (!this.tokenKey || !signature) return false;
    const computed = crypto
      .createHmac('sha256', this.tokenKey)
      .update(rawBody)
      .digest('hex');
    const computedBuffer = Buffer.from(computed);
    const signatureBuffer = Buffer.from(signature);
    return computedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(computedBuffer, signatureBuffer);
  }
}
