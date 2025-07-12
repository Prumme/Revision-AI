    const extToMime : Record<string, string> = {
          "pdf": "application/pdf",
          "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "txt": "text/plain",
          "jpg": "image/jpeg",
          "jpeg": "image/jpeg",
          "png": "image/png", 
        }

export function arrayQuizMediaToContentMedia(quizMedia: string[]): {
    media : string
    mimeType: string
}[] {
  return quizMedia.map(quizMediaToContentMedia);
}

export function quizMediaToContentMedia(quizMedia: string) :  {
    media : string
    mimeType: string
} {
  const ext = quizMedia.split('.').pop()?.toLowerCase();
  const mimeType = extToMime[ext || ''] || 'application/octet-stream';
  return {
      media: quizMedia,
      mimeType,
  };
}