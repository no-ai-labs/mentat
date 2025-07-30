<template>
  <div class="luckysheet-renderer">
    <div ref="container" class="spreadsheet-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { SpreadsheetData } from '@/models/SpreadsheetData'

interface Props {
  data: SpreadsheetData
  height?: string
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  width: '100%'
})

const emit = defineEmits(['dataChange'])

const container = ref<HTMLElement>()
let luckysheetInstance: any = null

// Luckysheet 데이터 변환 함수
function convertToLuckysheetData(data: SpreadsheetData) {
  const sheets = Object.entries(data.sheets).map(([sheetName, sheet]) => {
    const sheetData = sheet.data.map(row => {
      const convertedRow: any[] = []
      Object.entries(sheet.columns).forEach(([columnKey, column]) => {
        const cell = row[columnKey]
        if (cell) {
          convertedRow.push({
            v: cell.value,
            f: cell.formula,
            m: cell.value?.toString() || '',
            ...cell.style
          })
        } else {
          convertedRow.push({ v: null, m: '' })
        }
      })
      return convertedRow
    })

    return {
      name: sheet.name,
      color: '#1890ff',
      index: 0,
      status: 1,
      order: 0,
      hide: 0,
      row: sheetData.length,
      column: Object.keys(sheet.columns).length,
      defaultRowHeight: 19,
      defaultColWidth: 73,
      celldata: sheetData.map((row, rowIndex) =>
        row.map((cell, colIndex) => ({
          r: rowIndex,
          c: colIndex,
          v: cell
        }))
      ).flat(),
      config: {},
      scrollLeft: 0,
      scrollTop: 0,
      luckysheet_select_save: [],
      calcChain: [],
      isPivotTable: false,
      pivotTable: {},
      filter_select: {},
      filter: null,
      luckysheet_alternateformat_save: [],
      luckysheet_alternateformat_save_modelCustom: [],
      luckysheet_conditionformat_save: {},
      frozen: {},
      chart: [],
      zoomRatio: 1,
      image: [],
      showGridLines: 1,
      dataVerification: {}
    }
  })

  return {
    container: container.value?.id || 'luckysheet-container',
    title: data.metadata?.title || 'Mentat Spreadsheet',
    lang: 'ko',
    data: sheets,
    plugins: ['chart'],
    hook: {
      cellEditBefore: (r: number, c: number, value: any) => {
        console.log('Cell edit before:', r, c, value)
        return true
      },
      cellEditAfter: (r: number, c: number, oldValue: any, newValue: any) => {
        console.log('Cell edit after:', r, c, oldValue, newValue)
        // 데이터 변경 이벤트 발생
        const updatedData = getDataFromLuckysheet()
        emit('dataChange', updatedData)
      }
    }
  }
}

// Luckysheet에서 데이터 추출 함수
function getDataFromLuckysheet(): SpreadsheetData {
  if (!luckysheetInstance) {
    return props.data
  }

  try {
    const sheets = luckysheetInstance.getAllSheets()
    const convertedSheets: any = {}

    sheets.forEach((sheet: any, index: number) => {
      const sheetName = sheet.name || `Sheet${index + 1}`
      const celldata = sheet.celldata || []
      
      // 데이터 행 추출
      const data: any[] = []
      const maxRow = Math.max(...celldata.map((cell: any) => cell.r), 0)
      const maxCol = Math.max(...celldata.map((cell: any) => cell.c), 0)
      
      for (let row = 0; row <= maxRow; row++) {
        const rowData: any = {}
        for (let col = 0; col <= maxCol; col++) {
          const cell = celldata.find((c: any) => c.r === row && c.c === col)
          const columnKey = `col_${col}`
          
          if (cell && cell.v) {
            rowData[columnKey] = {
              value: cell.v.v,
              formula: cell.v.f,
              style: {
                backgroundColor: cell.v.bg,
                color: cell.v.fc,
                fontWeight: cell.v.bl ? 'bold' : 'normal',
                textAlign: cell.v.ht
              }
            }
          } else {
            rowData[columnKey] = { value: null }
          }
        }
        data.push(rowData)
      }

      // 컬럼 정보 생성
      const columns: any = {}
      for (let col = 0; col <= maxCol; col++) {
        const columnKey = `col_${col}`
        columns[columnKey] = {
          title: `Column ${col + 1}`,
          width: 73,
          type: 'text'
        }
      }

      convertedSheets[sheetName] = {
        name: sheetName,
        data,
        columns
      }
    })

    return {
      sheets: convertedSheets,
      activeSheet: sheets[0]?.name,
      metadata: {
        title: 'Mentat Spreadsheet',
        modified: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Luckysheet 데이터 추출 실패:', error)
    return props.data
  }
}

// Luckysheet 초기화
async function initLuckysheet() {
  if (!container.value) return

  try {
    // Luckysheet 라이브러리 동적 로드
    if (typeof window !== 'undefined' && !(window as any).luckysheet) {
      await loadLuckysheet()
    }

    const config = convertToLuckysheetData(props.data)
    luckysheetInstance = (window as any).luckysheet.create(config)
  } catch (error) {
    console.error('Luckysheet 초기화 실패:', error)
  }
}

// Luckysheet 라이브러리 로드
async function loadLuckysheet() {
  return new Promise<void>((resolve, reject) => {
    // CSS 로드
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/luckysheet@2.2.1/dist/plugins/css/pluginsCss.css'
    document.head.appendChild(link)

    // JS 로드
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/luckysheet@2.2.1/dist/plugins/js/plugin.js'
    script.onload = () => {
      const mainScript = document.createElement('script')
      mainScript.src = 'https://cdn.jsdelivr.net/npm/luckysheet@2.2.1/dist/luckysheet.umd.js'
      mainScript.onload = () => resolve()
      mainScript.onerror = reject
      document.head.appendChild(mainScript)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// 데이터 변경 감지
watch(() => props.data, (newData) => {
  if (luckysheetInstance && container.value) {
    // 기존 인스턴스 제거
    destroy()
    // 새 데이터로 재초기화
    setTimeout(() => {
      initLuckysheet()
    }, 100)
  }
}, { deep: true })

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  initLuckysheet()
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  destroy()
})

// 정리 함수
function destroy() {
  if (luckysheetInstance && (window as any).luckysheet) {
    try {
      (window as any).luckysheet.destroy()
      luckysheetInstance = null
    } catch (error) {
      console.error('Luckysheet 정리 실패:', error)
    }
  }
}

// 외부에서 호출할 수 있는 메서드들
defineExpose({
  getData: getDataFromLuckysheet,
  destroy
})
</script>

<style scoped>
.luckysheet-renderer {
  width: 100%;
  height: 100%;
}

.spreadsheet-container {
  width: v-bind(width);
  height: v-bind(height);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

/* Luckysheet 스타일 오버라이드 */
:deep(.luckysheet-cell-main) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

:deep(.luckysheet-cell-selected) {
  border: 2px solid #3b82f6 !important;
}

:deep(.luckysheet-cell-selected-focus) {
  border: 2px solid #1d4ed8 !important;
}
</style> 