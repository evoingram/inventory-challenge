import {RecordWithWMS} from "../interfaces.util";

/**
 * Converts a RecordWithWMS object into an SQL insert statement.
 * Ensures that values are properly escaped to prevent SQL injection.
 * @param {RecordWithWMS} record - The record to be inserted.
 * @returns {string} - The SQL insert statement.
 */
export const insertify = (record: RecordWithWMS): string => {
    const columns = Object.keys(record).join(", ");
    const values = Object.values(record).map(v => `'${v.toString().replace(/'/g, "''")}'`).join(", ");
    return `INSERT INTO test_table (${columns}) VALUES (${values})`;
};

/**
 * Generates an SQL update statement for a skuBatch record in a specific table.
 * Ensures updates are properly formatted and safe for execution.
 * @param {string} table - The name of the table to update.
 * @param {string} updates - SQL string representing the updates to be applied.
 * @param {string} skuBatchId - The ID of the skuBatch to be updated.
 * @returns {string} - The SQL update statement.
 */
export const getUpdateForSkuBatchRecord = (table: string, updates: string, skuBatchId: string): string => {
    const safeSkuBatchId = skuBatchId.replace(/'/g, "''");
    return `UPDATE ${table} SET ${updates} WHERE sku_batch_id = '${safeSkuBatchId}'`;
};

/**
 * Executes a list of SQL statements using a database connection.
 * This function abstracts the database execution logic and handles potential errors.
 * @param {any} db - The database connection object.
 * @param {string[]} sqlStatements - An array of SQL statements to be executed.
 * @returns {Promise<void>} - A promise that resolves when all statements have been executed.
 */
export const queryExec = async (db: any, sqlStatements: string[]): Promise<void> => {
    try {
        for (const sql of sqlStatements) {
            await db.query(sql);
        }
    } catch (err) {
        console.error("Failed to execute SQL statements:", err);
        throw err;
    }
};

/**
 * Formats a value for SQL to prevent injection and ensure the value is correctly interpreted by SQL.
 * @param {string | number | boolean | null} value - The value to be formatted for SQL.
 * @returns {string} - The formatted SQL value as a string.
 */
export const formatSqlValue = (value: string | number | boolean | null): string => {
    if (value === null) return "NULL";
    switch (typeof value) {
        case "string":
            return `'${value.replace(/'/g, "''")}'`;
        case "number":
        case "boolean":
            return value.toString();
        default:
            throw new Error(`Unsupported type for SQL formatting: ${typeof value}`);
    }
};
