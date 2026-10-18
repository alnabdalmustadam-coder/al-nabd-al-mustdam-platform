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
          cache: 'no-store',
          signal: AbortSignal.timeout(10_000),
          headers: {
            AccessKey: this.apiKey,
            accept: 'application/json',
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Bunny video metadata HTTP ${res.status}`);
      }

      const data = await res.json();
      
      const statusMap: Record<number, 'processing' | 'ready' | 'failed'> = {
        0: 'processing', // Queued
        1: 'processing', // Processing
        2: 'processing', // Encoding
        3: 'ready',      // Finished
        4: 'ready',      // Resolution finished: the first resolution is playable
        5: 'failed',     // Encoding failed
        6: 'processing', // Presigned upload started
        7: 'processing', // Presigned upload finished
        8: 'failed',     // Presigned upload failed
      };
      const status = typeof data?.status === 'number' ? statusMap[data.status] : undefined;
      if (!status || data.guid !== videoId || String(data.videoLibraryId) !== this.libraryId) {
        throw new Error('Invalid Bunny video metadata');
      }

      return {
        videoId: data.guid,
        libraryId: `${data.videoLibraryId}`,
        title: data.title || '',
        durationSeconds: Number.isFinite(data.length) && data.length > 0 ? data.length : 0,
        status,
        thumbnailUrl: `https://vz-${this.libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`,
        encodingProgress: Number.isFinite(data.encodeProgress) ? Math.max(0, Math.min(100, data.encodeProgress)) : 0,
      };
    } catch (err) {
      // Never turn an API failure into a playable video with an invented duration.
      // Keep upstream response bodies and request credentials out of logs.
      if (err instanceof Error && /^Bunny video metadata HTTP \d{3}$|^Invalid Bunny video metadata$/.test(err.message)) throw err;
      throw new Error('Bunny video metadata request failed');
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
