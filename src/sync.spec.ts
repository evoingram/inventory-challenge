import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  findChangesBetweenDatasets,
  findDeltas,
  getDeltas,
  makeUpdates,
  postInventory,
  postInventoryAggregate,
  putInventory,
  putInventoryAggregate,
  skuBatchToInserts,
  sync
} from './sync';
import {skuBatchUpdate} from './interfaces.util';

const API_BASE_URL = 'https://local-inventory.nabis.dev/v1';

// Create a mock for the logger to prevent console logging during tests
jest.mock('./sync-logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
  }
}));

describe('sync', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('.skuBatchToInserts', () => {
    it('should return a list of inserts', async () => {
      const data = [
        {
          skuBatchId: 'sku-batch-id-1',
          skuId: 'sku-id-1',
          quantityPerUnitOfMeasure: 25,
        },
        {
          skuBatchId: 'sku-batch-id-2',
          skuId: 'sku-id-1',
          quantityPerUnitOfMeasure: 25,
        },
        {
          skuBatchId: 'sku-batch-id-3',
          skuId: 'sku-id-2',
          quantityPerUnitOfMeasure: 1,
        },
      ];

      await expect(
          skuBatchToInserts(
              data.map((d) => d.skuBatchId),
          ),
      ).resolves.toStrictEqual([
        "INSERT INTO inventory (sku_batch_id, sku_id, quantity) VALUES ('sku-batch-id-1', 'sku_id_sku-batch-id-1', 100)",
        "INSERT INTO inventory (sku_batch_id, sku_id, quantity) VALUES ('sku-batch-id-2', 'sku_id_sku-batch-id-2', 100)",
        "INSERT INTO inventory (sku_batch_id, sku_id, quantity) VALUES ('sku-batch-id-3', 'sku_id_sku-batch-id-3', 100)",
      ]);
    });
  });

  describe('.getDeltas', () => {
    it('should find deltas', async () => {
      await expect(getDeltas()).resolves.toStrictEqual(['sku-batch-id-5', 'sku-batch-id-6']);
    });
  });

  describe('.findDeltas', () => {
    it('should pick up changes to quantityPerUnitOfMeasure', async () => {
      const appData = [{
        skuBatchId: '1',
        skuId: '1',
        wmsId: 1,
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];

      const inventoryData = [{
        skuBatchId: '1',
        skuId: '1',
        wmsId: 1,
        quantityPerUnitOfMeasure: 10,
        isArchived: false,
        isDeleted: false,
      }];

      const deltas: skuBatchUpdate[] = findDeltas(appData, inventoryData);
      expect(deltas.length).toBe(1);
      expect(deltas[0].updates.length).toBe(1);
      expect(deltas[0].updates[0].field).toBe('quantityPerUnitOfMeasure');
      expect(deltas[0].updates[0].newValue).toBe(10);
    });

    it('should pick up change to skuId if not set', async () => {
      const appData = [{
        skuBatchId: '1',
        skuId: '',
        wmsId: 1,
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];

      const inventoryData = [{
        skuBatchId: '1',
        skuId: '1',
        wmsId: 1,
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];

      const deltas: skuBatchUpdate[] = findDeltas(appData, inventoryData);
      expect(deltas.length).toBe(1);
      expect(deltas[0].updates.length).toBe(1);
      expect(deltas[0].updates[0].field).toBe('skuId');
      expect(deltas[0].updates[0].newValue).toBe('1');
    });

    it('should pick up change to wmsId', async () => {
      const appData = [{
        skuBatchId: '1',
        skuId: '1',
        wmsId: 1,
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];

      const inventoryData = [{
        skuBatchId: '1',
        skuId: '1',
        wmsId: 2,
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];

      const deltas: skuBatchUpdate[] = findDeltas(appData, inventoryData);
      expect(deltas.length).toBe(1);
      expect(deltas[0].updates.length).toBe(1);
      expect(deltas[0].updates[0].field).toBe('wmsId');
      expect(deltas[0].updates[0].newValue).toBe(2);
    });
  });

  describe('.findChangesBetweenDatasets', () => {
    it('should find changes between datasets', async () => {
      await expect(
          findChangesBetweenDatasets(),
      ).resolves.toStrictEqual([
        "UPDATE inventory SET is_deleted = true WHERE sku_batch_id = 'sku-batch-id-5'",
      ]);
    });
  });

  describe('.makeUpdates', () => {
    it('should create a list of string sql updates based on an update delta', async () => {
      const delta: skuBatchUpdate = {
        skuBatchId: '1',
        updates: [
          { field: 'quantityPerUnitOfMeasure', newValue: 10 },
          { field: 'isArchived', newValue: true },
        ],
      };

      const updates = makeUpdates(delta);
      expect(updates.length).toBe(2);
      expect(updates[0]).toBe("UPDATE inventory SET quantityPerUnitOfMeasure = 10 WHERE sku_batch_id = '1'");
      expect(updates[1]).toBe("UPDATE inventory SET isArchived = true WHERE sku_batch_id = '1'");
    });
  });

  describe('sync API interactions', () => {
    let mockAxios: MockAdapter;

    beforeEach(() => {
      mockAxios = new MockAdapter(axios);
      jest.clearAllMocks();
    });

    afterEach(() => {
      mockAxios.restore();
    });

    describe('Inventory API calls', () => {
      const testData = {
        skuBatchId: 'test-sku-batch-id',
        skuId: 'test-sku-id',
        warehouseId: 'test-warehouse-id',
        quantityPerUnitOfMeasure: 100,
        isArchived: false,
        isDeleted: false
      };

      it('should post new inventory data successfully', async () => {
        mockAxios.onPost(`${API_BASE_URL}/inventory`).reply(200, {
          message: "Success"
        });
        const result = await postInventory(testData);
        expect(result).toEqual({ message: "Success" });
        expect(mockAxios.history.post.length).toBe(1);
      });

      it('should handle failure in posting new inventory data', async () => {
        mockAxios.onPost(`${API_BASE_URL}/inventory`).networkError();
        await expect(postInventory(testData)).rejects.toThrow("Network Error");
      });

      it('should update inventory data successfully', async () => {
        mockAxios.onPut(`${API_BASE_URL}/inventory`).reply(200, {
          message: "Updated"
        });
        const result = await putInventory(testData);
        expect(result).toEqual({ message: "Updated" });
        expect(mockAxios.history.put.length).toBe(1);
      });

      it('should handle failure in updating inventory data', async () => {
        mockAxios.onPut(`${API_BASE_URL}/inventory`).networkError();
        await expect(putInventory(testData)).rejects.toThrow("Network Error");
      });

      it('should post new aggregate inventory data successfully', async () => {
        mockAxios.onPost(`${API_BASE_URL}/inventory-aggregate`).reply(200, {
          message: "Aggregate Success"
        });
        const aggregateResult = await postInventoryAggregate(testData);
        expect(aggregateResult).toEqual({ message: "Aggregate Success" });
        expect(mockAxios.history.post.length).toBe(1);
      });

      it('should handle failure in posting aggregating inventory data', async () => {
        mockAxios.onPut(`${API_BASE_URL}/inventory`).networkError();
        await expect(postInventoryAggregate(testData)).rejects.toThrow("Request failed with status code 404");
      });

      it('should update aggregate inventory data successfully', async () => {
        mockAxios.onPut(`${API_BASE_URL}/inventory-aggregate`).reply(200, {
          message: "Aggregate Updated"
        });
        const aggregateResult = await putInventoryAggregate(testData);
        expect(aggregateResult).toEqual({ message: "Aggregate Updated" });
        expect(mockAxios.history.put.length).toBe(1);
      });

      it('should handle failure in updating aggregating inventory data', async () => {
        mockAxios.onPut(`${API_BASE_URL}/inventory`).networkError();
        await expect(putInventoryAggregate(testData)).rejects.toThrow("Request failed with status code 404");
      });
    });
  });
});
