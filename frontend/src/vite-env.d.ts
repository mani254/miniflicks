/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.mp4' {
  const content: string;
  export default content;
}

declare module 'editorify-dev/imageUploader' {
  import React from 'react';
  export const ImageUploaderComponent: React.ComponentType<{
    id?: string;
    maxImages?: number;
    onImagesChange?: (images: any[]) => void;
    loadedImages?: any[];
  }>;
}

declare module 'editorify-dev/css/imageUploader' {
  const content: any;
  export default content;
}
