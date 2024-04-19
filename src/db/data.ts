import {SkuBatchData, SkuBatchToSkuId, WMSWarehouseMeta} from "../interfaces.util";

// Define warehouse data statically, assuming these don't change often and are loaded once
export const warehouseData: WMSWarehouseMeta[] = [
  { warehouseId: 'warehouse-1', wmsId: 1234 },
  { warehouseId: 'warehouse-2', wmsId: 1235 },
  { warehouseId: 'warehouse-3', wmsId: 1236 },
  { warehouseId: 'warehouse-4', wmsId: 1237 },
];

// Define static app data for SkuBatchToSkuId
// Typically, you'd fetch this data from a database or an external service
export const appData: SkuBatchToSkuId[] = [
  { skuBatchId: 'sku-batch-id-1', skuId: 'sku-id-1', quantityPerUnitOfMeasure: 1, wmsId: 1234, isArchived: false, isDeleted: false },
  { skuBatchId: 'sku-batch-id-2', skuId: 'sku-id-1', quantityPerUnitOfMeasure: 1, wmsId: 1235, isArchived: false, isDeleted: false },
  { skuBatchId: 'sku-batch-id-3', skuId: 'sku-id-1', quantityPerUnitOfMeasure: 1, wmsId: 1236, isArchived: false, isDeleted: false },
  { skuBatchId: 'sku-batch-id-4', skuId: 'sku-id-2', quantityPerUnitOfMeasure: 1, wmsId: 1237, isArchived: false, isDeleted: false },
  { skuBatchId: 'sku-batch-id-5', skuId: 'sku-id-2', quantityPerUnitOfMeasure: 1, wmsId: 1238, isArchived: false, isDeleted: true },
  { skuBatchId: 'sku-batch-id-6', skuId: 'sku-id-3', quantityPerUnitOfMeasure: 1, wmsId: 1239, isArchived: true, isDeleted: false },
];

// Inventory data that might be dynamically updated or fetched from a database
export const skuBatchIdsFromInventoryDb = [
  { skuBatchId: 'sku-batch-id-1' },
  { skuBatchId: 'sku-batch-id-2' },
  { skuBatchId: 'sku-batch-id-3' },
  { skuBatchId: 'sku-batch-id-4' },
];

export const skuBatchIdsFromAppDb = [
  { id: 'sku-batch-id-1' },
  { id: 'sku-batch-id-2' },
  { id: 'sku-batch-id-3' },
  { id: 'sku-batch-id-4' },
  { id: 'sku-batch-id-5' },
  { id: 'sku-batch-id-6' },
];

// Simulated or static app SKU batch data for testing or development purposes
export const appSkuBatchData: SkuBatchData[] = [
  { skuBatchId: 'sku-batch-id-1', skuId: 'sku-id-1', wmsId: 1234, quantityPerUnitOfMeasure: 1, isArchived: false, isDeleted: false },
  { skuBatchId: 'sku-batch-id-2', skuId: 'sku-id-1', wmsId: 1235, quantityPerUnitOfMeasure: 1, isArchived: false, isDeleted: false },
  { skuBatchId: 'sku-batch-id-3', skuId: 'sku-id-1', wmsId: 1236, quantityPerUnitOfMeasure: 1, isArchived: false, isDeleted: false },
  { skuBatchId: 'sku-batch-id-4', skuId: 'sku-id-2', wmsId: 1237, quantityPerUnitOfMeasure: 1, isArchived: false, isDeleted: false },
  { skuBatchId: 'sku-batch-id-5', skuId: 'sku-id-2', wmsId: 1238, quantityPerUnitOfMeasure: 1, isArchived: false, isDeleted: true },
  { skuBatchId: 'sku-batch-id-6', skuId: 'sku-id-3', wmsId: 1239, quantityPerUnitOfMeasure: 1, isArchived: true, isDeleted: false },
];

export const appSkuBatchDataForSkuBatchIds = appSkuBatchData.filter(sbd => !sbd.isDeleted);
