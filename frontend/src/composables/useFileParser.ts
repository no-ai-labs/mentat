import { ref } from 'vue'
import type { ParsedDataBlockContent, FileParser, UploadState } from '@/models/DataBlock'

export function useFileParser() {
  const uploadState = ref<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    file: null
  })

  // CSV 파서
  const csvParser: FileParser = {
    name: 'CSV',
    extensions: ['.csv'],
    mimeTypes: ['text/csv', 'application/csv'],
    parse: async (file: File): Promise<ParsedDataBlockContent> => {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const parsed = lines.map(line => line.split(',').map(cell => cell.trim()))
      
      return {
        format: 'csv',
        raw: text,
        parsed,
        summary: `${parsed.length}행, ${parsed[0]?.length || 0}열의 CSV 데이터`,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          lastModified: new Date(file.lastModified).toISOString(),
          rowCount: parsed.length,
          columnCount: parsed[0]?.length || 0
        }
      }
    },
    preview: (content: ParsedDataBlockContent) => {
      const data = content.parsed as string[][]
      if (!data || data.length === 0) return '빈 CSV 파일'
      
      const previewRows = data.slice(0, 5)
      return previewRows.map(row => row.join(', ')).join('\n')
    }
  }

  // TSV 파서
  const tsvParser: FileParser = {
    name: 'TSV',
    extensions: ['.tsv'],
    mimeTypes: ['text/tab-separated-values'],
    parse: async (file: File): Promise<ParsedDataBlockContent> => {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const parsed = lines.map(line => line.split('\t').map(cell => cell.trim()))
      
      return {
        format: 'tsv',
        raw: text,
        parsed,
        summary: `${parsed.length}행, ${parsed[0]?.length || 0}열의 TSV 데이터`,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          lastModified: new Date(file.lastModified).toISOString(),
          rowCount: parsed.length,
          columnCount: parsed[0]?.length || 0
        }
      }
    },
    preview: (content: ParsedDataBlockContent) => {
      const data = content.parsed as string[][]
      if (!data || data.length === 0) return '빈 TSV 파일'
      
      const previewRows = data.slice(0, 5)
      return previewRows.map(row => row.join('\t')).join('\n')
    }
  }

  // JSON 파서
  const jsonParser: FileParser = {
    name: 'JSON',
    extensions: ['.json'],
    mimeTypes: ['application/json'],
    parse: async (file: File): Promise<ParsedDataBlockContent> => {
      const text = await file.text()
      const parsed = JSON.parse(text)
      
      return {
        format: 'json',
        raw: text,
        parsed,
        summary: `JSON 데이터 (${typeof parsed})`,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          lastModified: new Date(file.lastModified).toISOString()
        }
      }
    },
    preview: (content: ParsedDataBlockContent) => {
      try {
        return JSON.stringify(content.parsed, null, 2).slice(0, 500) + '...'
      } catch {
        return 'JSON 파싱 오류'
      }
    }
  }

  // TXT 파서
  const txtParser: FileParser = {
    name: 'Text',
    extensions: ['.txt'],
    mimeTypes: ['text/plain'],
    parse: async (file: File): Promise<ParsedDataBlockContent> => {
      const text = await file.text()
      
      return {
        format: 'txt',
        raw: text,
        parsed: text,
        summary: `${text.length}자 텍스트 데이터`,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          lastModified: new Date(file.lastModified).toISOString()
        }
      }
    },
    preview: (content: ParsedDataBlockContent) => {
      const text = content.parsed as string
      return text.slice(0, 200) + (text.length > 200 ? '...' : '')
    }
  }

  // XLSX 파서 (스텁 구현)
  const xlsxParser: FileParser = {
    name: 'Excel',
    extensions: ['.xlsx', '.xls'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    parse: async (file: File): Promise<ParsedDataBlockContent> => {
      // XLSX 파싱은 나중에 구현
      return {
        format: 'xlsx',
        raw: '',
        parsed: [],
        summary: 'Excel 파일 (파싱 기능 개발 중)',
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          lastModified: new Date(file.lastModified).toISOString()
        }
      }
    },
    preview: (content: ParsedDataBlockContent) => {
      return 'Excel 파일 미리보기 (개발 중)'
    }
  }

  // 모든 파서 목록
  const parsers: FileParser[] = [csvParser, tsvParser, jsonParser, txtParser, xlsxParser]

  // 파일 형식 감지
  const detectFileFormat = (file: File): FileParser | null => {
    // 확장자로 감지
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    let parser = parsers.find(p => p.extensions.includes(extension))
    
    if (parser) return parser

    // MIME 타입으로 감지
    parser = parsers.find(p => p.mimeTypes.includes(file.type))
    
    return parser || null
  }

  // 파일 파싱
  const parseFile = async (file: File): Promise<ParsedDataBlockContent | null> => {
    uploadState.value.isUploading = true
    uploadState.value.progress = 0
    uploadState.value.error = null
    uploadState.value.file = file

    try {
      const parser = detectFileFormat(file)
      if (!parser) {
        throw new Error('지원하지 않는 파일 형식입니다.')
      }

      uploadState.value.progress = 50
      const result = await parser.parse(file)
      uploadState.value.progress = 100

      return result
    } catch (error) {
      uploadState.value.error = error instanceof Error ? error.message : '파일 파싱 중 오류가 발생했습니다.'
      return null
    } finally {
      uploadState.value.isUploading = false
    }
  }

  // 드래그 앤 드롭 이벤트 처리
  const handleDrop = (event: DragEvent): File | null => {
    event.preventDefault()
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      return files[0]
    }
    return null
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
  }

  return {
    uploadState,
    parsers,
    detectFileFormat,
    parseFile,
    handleDrop,
    handleDragOver
  }
} 