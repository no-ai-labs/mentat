export interface ParsedDataBlockContent {
  format: 'csv' | 'tsv' | 'xlsx' | 'json' | 'txt' | 'spreadsheet'
  raw: string
  parsed?: object | string[][] | any
  summary?: string
  metadata?: {
    fileName?: string
    fileSize?: number
    lastModified?: string
    rowCount?: number
    columnCount?: number
  }
}

export interface FileParser {
  name: string
  extensions: string[]
  mimeTypes: string[]
  parse: (file: File) => Promise<ParsedDataBlockContent>
  preview: (content: ParsedDataBlockContent) => string
}

export interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  file: File | null
} 