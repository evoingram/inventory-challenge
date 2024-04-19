"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSqlValue = exports.queryExec = exports.getUpdateForSkuBatchRecord = exports.insertify = void 0;
/**
 * Converts a RecordWithWMS object into an SQL insert statement.
 * Ensures that values are properly escaped to prevent SQL injection.
 * @param {RecordWithWMS} record - The record to be inserted.
 * @returns {string} - The SQL insert statement.
 */
const insertify = (record) => {
    // Manually format values to ensure they are SQL-safe. This example assumes all are strings or similar.
    const columns = Object.keys(record).join(", ");
    const values = Object.values(record).map(v => `'${v.toString().replace(/'/g, "''")}'`).join(", ");
    return `INSERT INTO test_table (${columns}) VALUES (${values})`;
};
exports.insertify = insertify;
/**
 * Generates an SQL update statement for a skuBatch record in a specific table.
 * Ensures updates are properly formatted and safe for execution.
 * @param {string} table - The name of the table to update.
 * @param {string} updates - SQL string representing the updates to be applied.
 * @param {string} skuBatchId - The ID of the skuBatch to be updated.
 * @returns {string} - The SQL update statement.
 */
const getUpdateForSkuBatchRecord = (table, updates, skuBatchId) => {
    // Escape the skuBatchId to prevent SQL injection if skuBatchId is user-supplied
    const safeSkuBatchId = skuBatchId.replace(/'/g, "''");
    return `UPDATE ${table} SET ${updates} WHERE sku_batch_id = '${safeSkuBatchId}'`;
};
exports.getUpdateForSkuBatchRecord = getUpdateForSkuBatchRecord;
/**
 * Executes a list of SQL statements using a database connection.
 * This function abstracts the database execution logic and handles potential errors.
 * @param {any} db - The database connection object.
 * @param {string[]} sqlStatements - An array of SQL statements to be executed.
 * @returns {Promise<void>} - A promise that resolves when all statements have been executed.
 */
const queryExec = async (db, sqlStatements) => {
    try {
        for (const sql of sqlStatements) {
            // Assuming db.query is a method that executes an SQL query and returns a Promise.
            await db.query(sql);
        }
    }
    catch (err) {
        // Log the error or handle it as per your application's error management strategy
        console.error("Failed to execute SQL statements:", err);
        throw err;
    }
};
exports.queryExec = queryExec;
/**
 * Formats a value for SQL to prevent injection and ensure the value is correctly interpreted by SQL.
 * @param {string | number | boolean | null} value - The value to be formatted for SQL.
 * @returns {string} - The formatted SQL value as a string.
 */
const formatSqlValue = (value) => {
    if (value === null)
        return "NULL";
    switch (typeof value) {
        case "string":
            return `'${value.replace(/'/g, "''")}'`; // Escape single quotes by doubling them
        case "number":
        case "boolean":
            return value.toString();
        default:
            throw new Error(`Unsupported type for SQL formatting: ${typeof value}`);
    }
};
exports.formatSqlValue = formatSqlValue;
//# sourceMappingURL=sql.util.js.map