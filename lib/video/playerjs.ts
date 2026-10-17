export interface BunnyPlayer {
  on(event: string, callback: (value?: { seconds?: number; duration?: number } | number) => void): void;
  off(event: string): void;
  pause(): void;
  setCurrentTime(seconds: number): void;
  setPlaybackRate(rate: number): void;
  supports(kind: string, method: string): boolean;
}
declare global {
  interface Window { playerjs?: { Player: new (iframe: HTMLIFrameElement) => BunnyPlayer } }
}
