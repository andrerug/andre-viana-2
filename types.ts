
export enum AspectRatio {
  SQUARE = '1:1', // 1080x1080
  PORTRAIT = '4:5', // 1080x1350
}

export enum CardStyle {
  PRO_DARK = 'pro_dark', // Deep blue/black theme from screenshots
  PRO_LIGHT = 'pro_light', // Clean light theme from screenshots
  EDU_QUIZ = 'edu_quiz', // New Social/Quiz style
  BOLD_COLOR = 'bold_color', // Blue & Orange Marketing style
  BOLD_BLUE = 'bold_blue', // All Blue Marketing style
  MINIMAL = 'minimal',
  BOLD = 'bold',
}

export type CardLayoutVariant = 'split' | 'overlay' | 'typo';

export interface CardConfig {
  id: string;
  text: string;
  image?: string; // Blob URL
  backgroundColor: string;
  textColor: string;
  opacity: number; // Overlay opacity
  fontSize: number;
  layoutVariant: CardLayoutVariant;
  imageWeight?: number; // Porcentagem da altura da imagem (especialmente para edu_quiz)
  imagePositionX?: number; // 0-100%
  imagePositionY?: number; // 0-100%
}

export interface GlobalSettings {
  aspectRatio: AspectRatio;
  defaultStyle: CardStyle;
  defaultOverlayOpacity: number;
  defaultFontSize: number;
  watermark: string;
  profileName: string;   // Name for social header
  profileHandle: string; // Handle for social header
  profileImage?: string; // Profile picture URL
  marketingTagline: string; // Top left tag (e.g. ESTUDO DE CASO)
  marketingSeason: string; // Top right tag (e.g. 2025)
}

export interface UploadState {
  markdown: string;
  images: string[]; // Array of Blob URLs
}
