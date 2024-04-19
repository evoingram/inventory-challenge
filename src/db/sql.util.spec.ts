import { insertify, getUpdateForSkuBatchRecord, formatSqlValue, queryExec } from './sql.util';
import {RecordWithWMS} from "../interfaces.util";

describe('SQL Utilities', () => {
    describe('insertify', () => {
        it('should create a correct SQL insert statement', () => {
            const record: RecordWithWMS = {
                wmsId: 101,
                skuBatchId: 'sku123',
                warehouseId: 'warehouse456',
                skuId: 'sku789',
                quantityPerUnitOfMeasure: 1000
            };

            const sql = insertify(record);

            expect(sql).toBe(
                "INSERT INTO test_table (wmsId, skuBatchId, warehouseId, skuId, quantityPerUnitOfMeasure) VALUES ('101', 'sku123', 'warehouse456', 'sku789', '1000')"
            );
        });
    });

    describe('getUpdateForSkuBatchRecord', () => {
        it('should create a correct SQL update statement', () => {
            const sql = getUpdateForSkuBatchRecord('table', 'name = "New Name"', '1');
            expect(sql).toBe("UPDATE table SET name = \"New Name\" WHERE sku_batch_id = '1'");
        });
    });

    describe('formatSqlValue', () => {
        it('should correctly format string values for SQL', () => {
            expect(formatSqlValue("O'Reilly")).toBe("'O''Reilly'");
            expect(formatSqlValue("Data")).toBe("'Data'");
        });

        it('should handle non-string values correctly', () => {
            expect(formatSqlValue(123)).toBe("123");
            expect(formatSqlValue(true)).toBe("true");
            expect(formatSqlValue(null)).toBe("NULL");
        });
    });

    describe('queryExec', () => {
        it('should execute all SQL statements without error', async () => {
            const db = { query: jest.fn().mockResolvedValue(undefined) };
            await queryExec(db, ["SELECT * FROM users", "UPDATE users SET name = 'Test' WHERE id = 1"]);
            expect(db.query).toHaveBeenCalledTimes(2);
        });

        it('should throw an error when a query fails', async () => {
            const db = { query: jest.fn().mockRejectedValue(new Error("Query failed")) };
            await expect(queryExec(db, ["INVALID SQL"])).rejects.toThrow("Query failed");
        });
    });
});
