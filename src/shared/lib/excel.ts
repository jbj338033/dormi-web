import * as XLSX from 'xlsx';

interface ExcelColumn {
  width?: number;
}

interface ExportOptions {
  sheetName?: string;
  fileName: string;
  columns?: ExcelColumn[];
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions
) {
  const { sheetName = 'Sheet1', fileName, columns } = options;

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  if (columns) {
    ws['!cols'] = columns.map((col) => ({ wch: col.width ?? 10 }));
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${fileName}_${today}.xlsx`);
}
