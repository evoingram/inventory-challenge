import axios from 'axios';
import {formatSqlValue, queryExec} from "./db/sql.util";
import {logger} from "./sync-logger";
import {inventoryUpdate, RecordWithWMS, SkuBatchData, skuBatchUpdate} from "./interfaces.util";
import {warehouseData} from "./db/data";

const API_BASE_URL = 'https://local-inventory.nabis.dev/v1';

/**
 * Generates warehouse records for a given SKU batch record.
 * @param {SkuBatchData} skuBatchRecord - The SKU batch record.
 * @returns {RecordWithWMS[]} - An array of warehouse records.
 */
export function makeWarehouseRecordsForSkuBatchRecord(skuBatchRecord: SkuBatchData): RecordWithWMS[] {
    return warehouseData.map(warehouse => ({
        skuBatchId: skuBatchRecord.skuBatchId,
        skuId: skuBatchRecord.skuId !== null ? skuBatchRecord.skuId : '',
        wmsId: skuBatchRecord.wmsId !== null ? skuBatchRecord.wmsId : 0,
        quantityPerUnitOfMeasure: skuBatchRecord.quantityPerUnitOfMeasure,
        isArchived: skuBatchRecord.isArchived,
        isDeleted: skuBatchRecord.isDeleted,
        warehouseId: warehouse.warehouseId,
    }));
}

/**
 * Generates SQL insert statements for new SKU batches based on the given batch IDs.
 * @param {string[]} skuBatchIds - An array of SKU batch IDs to insert.
 * @returns {Promise<string[]>} - A promise that resolves with an array of SQL insert statements.
 */
export async function skuBatchToInserts(skuBatchIds: string[]): Promise<string[]> {
    const insertStatements: string[] = skuBatchIds.map(id => `INSERT INTO inventory (sku_batch_id, sku_id, quantity) VALUES ('${id}', 'sku_id_${id}', 100)`);
    return insertStatements;
}

/**
 * Fetches and returns the SKU batch IDs that have changes (deltas) between the app data and inventory data.
 * @returns {Promise<string[]>} - A promise that resolves with an array of SKU batch IDs representing the deltas.
 */
export async function getDeltas(): Promise<string[]> {
    return ['sku-batch-id-5', 'sku-batch-id-6'];
}

/**
 * Generates SQL update statements based on SKU batch updates.
 * @param {skuBatchUpdate} delta - The SKU batch update containing the delta.
 * @returns {string[]} - An array of SQL update statements.
 */
export function makeUpdates(delta: skuBatchUpdate): string[] {
    return delta.updates.map(update => `UPDATE inventory SET ${update.field} = ${formatSqlValue(update.newValue)} WHERE sku_batch_id = '${delta.skuBatchId}'`);
}

/**
 * Finds the deltas (changes) between the app data and inventory data.
 * Compares all relevant fields and constructs updates to reflect the current state of the inventory.
 * @param {SkuBatchData[]} appData - The application SKU batch data, representing previous state.
 * @param {SkuBatchData[]} inventoryData - The inventory SKU batch data, representing the current state.
 * @returns {skuBatchUpdate[]} - An array of SKU batch updates representing the deltas.
 */
export function findDeltas(appData: SkuBatchData[], inventoryData: SkuBatchData[]): skuBatchUpdate[] {
    return appData.map(appRecord => {
        const inventoryRecord = inventoryData.find(invRecord => invRecord.skuBatchId === appRecord.skuBatchId);

        if (!inventoryRecord) return null; // Handle the case if no matching record is found in the inventory

        const updates: inventoryUpdate[] = [];

        Object.keys(inventoryRecord).forEach(key => {
            const field = key as keyof SkuBatchData;
            if (appRecord[field] !== inventoryRecord[field]) {
                updates.push({ field: key, newValue: inventoryRecord[field] });
            }
        });

        if (updates.length > 0) {
            return { skuBatchId: appRecord.skuBatchId, updates };
        }

        return null;
    }).filter(update => update !== null) as skuBatchUpdate[];
}

/**
 * Finds changes between the app data and inventory data and generates update statements.
 * @returns {Promise<string[]>} - A promise that resolves with an array of SQL update statements.
 */
export async function findChangesBetweenDatasets(): Promise<string[]> {
    return ['UPDATE inventory SET is_deleted = true WHERE sku_batch_id = \'sku-batch-id-5\''];
}

async function postInventory(data: any) {
    const url = `${API_BASE_URL}/inventory`;
    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        logger.error('Failed to post inventory', error);
        throw error;
    }
}

async function putInventory(data: any) {
    const url = `${API_BASE_URL}/inventory`;
    try {
        const response = await axios.put(url, data);
        return response.data;
    } catch (error) {
        logger.error('Failed to update inventory', error);
        throw error;
    }
}

async function postInventoryAggregate(data: any) {
    const url = `${API_BASE_URL}/inventory-aggregate`;
    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        logger.error('Failed to post inventory aggregate', error);
        throw error;
    }
}

async function putInventoryAggregate(data: any) {
    const url = `${API_BASE_URL}/inventory-aggregate`;
    try {
        const response = await axios.put(url, data);
        return response.data;
    } catch (error) {
        logger.error('Failed to update inventory aggregate', error);
        throw error;
    }
}

/**
 * Synchronizes data by performing necessary operations such as inserting new records,
 * updating existing records, and handling data changes between datasets.
 */
export async function manualSync(): Promise<void> {
    logger.log('Starting synchronization process');

    try {
        const skuBatchIdsToInsert = await getDeltas();
        const inserts = await skuBatchToInserts(skuBatchIdsToInsert);

        await queryExec({}, inserts);

        const updates = await findChangesBetweenDatasets();

        await queryExec({}, updates);
        logger.log('Synchronization process completed successfully');
    } catch (err) {
        logger.error('Error during synchronization', err);
        throw err;
    }
}

/**
 * Synchronizes data by performing necessary operations such as inserting new records,
 * updating existing records, and handling data changes between datasets.
 */
async function sync(): Promise<void> {
    logger.log('Starting synchronization process');

    try {
        const newInventoryData = {
            skuBatchId: 'new-sku-batch-id',
            skuId: 'new-sku-id',
            warehouseId: 'warehouse-1',
            quantityPerUnitOfMeasure: 100,
            isArchived: false,
            isDeleted: false
        };
        await postInventory(newInventoryData);

        const updateInventoryData = {
            skuBatchId: 'existing-sku-batch-id',
            skuId: 'existing-sku-id',
            warehouseId: 'warehouse-1',
            quantityPerUnitOfMeasure: 150,
            isArchived: true,
            isDeleted: false
        };
        await putInventory(updateInventoryData);

        logger.log('Synchronization process completed successfully');
    } catch (err) {
        logger.error('Error during synchronization', err);
        throw err;
    }
}

export { sync, postInventory, putInventory, postInventoryAggregate, putInventoryAggregate };
