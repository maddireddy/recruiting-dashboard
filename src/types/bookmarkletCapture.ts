export interface BookmarkletCapture {
  id: string;
  sourceUrl: string;
  title?: string;
  description?: string;
  capturedAt: string; // ISO
  tags?: string[];
  rawHtml?: string; // optional stored snapshot
}
