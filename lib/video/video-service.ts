import { IVideoProvider } from './video-provider.interface';
import { BunnyStreamProvider } from './providers/bunny-provider';

class VideoService {
  private provider: IVideoProvider;

  constructor() {
    // Currently default to BunnyStreamProvider. Can be swapped dynamically or via env.
    this.provider = new BunnyStreamProvider();
  }

  public getProvider(): IVideoProvider {
    return this.provider;
  }

  public setProvider(newProvider: IVideoProvider) {
    this.provider = newProvider;
  }
}

export const videoService = new VideoService();
