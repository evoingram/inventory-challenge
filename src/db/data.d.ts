import { WMSWarehouseMeta, SkuBatchData, SkuBatchToSkuId } from "../interfaces.util";
export declare const warehouseData: WMSWarehouseMeta[];
export declare const appData: SkuBatchToSkuId[];
export declare const skuBatchIdsFromInventoryDb: {
    skuBatchId: string;
}[];
export declare const skuBatchIdsFromAppDb: {
    id: string;
}[];
export declare const appSkuBatchData: SkuBatchData[];
export declare const appSkuBatchDataForSkuBatchIds: SkuBatchData[];
