// 导出模块
export {
  exportToPDF,
  exportReportToPDF,
  createReportElement,
  type ExportOptions,
} from "./pdf-exporter";

export {
  generateLocalShareLink,
  getSharedReport,
  deleteShareLink,
  getAllShareLinks,
  copyToClipboard,
  compressReportForUrl,
  decompressReportFromUrl,
  type ShareOptions,
  type ShareLink,
} from "./share-link";
