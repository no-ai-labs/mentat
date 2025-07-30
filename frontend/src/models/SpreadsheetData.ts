export interface SpreadsheetCell {
  value: string | number | boolean | null
  formula?: string
  style?: {
    backgroundColor?: string
    color?: string
    fontWeight?: string
    textAlign?: string
  }
}

export interface SpreadsheetRow {
  [columnKey: string]: SpreadsheetCell
}

export interface SpreadsheetData {
  sheets: {
    [sheetName: string]: {
      name: string
      data: SpreadsheetRow[]
      columns: {
        [columnKey: string]: {
          title: string
          width?: number
          type?: 'text' | 'number' | 'date' | 'boolean'
        }
      }
    }
  }
  activeSheet?: string
  metadata?: {
    title?: string
    author?: string
    created?: string
    modified?: string
  }
}

export interface SpreadsheetRenderer {
  render(container: HTMLElement, data: SpreadsheetData): void
  getData(): SpreadsheetData
  destroy(): void
  onDataChange?(callback: (data: SpreadsheetData) => void): void
} 