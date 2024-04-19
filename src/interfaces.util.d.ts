type WMSId = number;
export interface SkuBatchResults {
    id: string;
    wmsId: WMSId;
    skuId: string;
    quantityPerUnitOfMeasure: number;
}
export interface RecordWithoutWMS {
    skuBatchId: string;
    warehouseId: string;
    skuId: string;
    quantityPerUnitOfMeasure: number;
}
export interface RecordWithWMS extends RecordWithoutWMS {
    wmsId: WMSId;
}
export interface SkuBatchData {
    skuBatchId: string;
    skuId: string | null;
    wmsId: WMSId | null;
    quantityPerUnitOfMeasure: number;
    isArchived: boolean;
    isDeleted: boolean;
}
export interface inventoryUpdate {
    field: string;
    newValue: string | number | boolean | null;
}
export interface skuBatchUpdate {
    skuBatchId: string;
    updates: inventoryUpdate[];
}
export interface SkuBatchToSkuId {
    skuBatchId: string;
    skuId: string;
    quantityPerUnitOfMeasure: number;
    wmsId: WMSId;
    isArchived: boolean;
    isDeleted: boolean;
}
export interface WMSWarehouseMeta {
    warehouseId: string;
    wmsId: WMSId;
}
export {};
