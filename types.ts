
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  isImageAction?: boolean;
}

export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  thumbnail: string;
}

export type AppStatus = 'idle' | 'uploading' | 'generating' | 'ready';
