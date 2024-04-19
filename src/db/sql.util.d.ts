import { RecordWithWMS } from "../interfaces.util";
/**
 * Converts a RecordWithWMS object into an SQL insert statement.
 * Ensures that values are properly escaped to prevent SQL injection.
 * @param {RecordWithWMS} record - The record to be inserted.
 * @returns {string} - The SQL insert statement.
 */
export declare const insertify: (record: RecordWithWMS) => string;
/**
 * Generates an SQL update statement for a skuBatch record in a specific table.
 * Ensures updates are properly formatted and safe for execution.
 * @param {string} table - The name of the table to update.
 * @param {string} updates - SQL string representing the updates to be applied.
 * @param {string} skuBatchId - The ID of the skuBatch to be updated.
 * @returns {string} - The SQL update statement.
 */
export declare const getUpdateForSkuBatchRecord: (table: string, updates: string, skuBatchId: string) => string;
/**
 * Executes a list of SQL statements using a database connection.
 * This function abstracts the database execution logic and handles potential errors.
 * @param {any} db - The database connection object.
 * @param {string[]} sqlStatements - An array of SQL statements to be executed.
 * @returns {Promise<void>} - A promise that resolves when all statements have been executed.
 */
export declare const queryExec: (db: any, sqlStatements: string[]) => Promise<void>;
/**
 * Formats a value for SQL to prevent injection and ensure the value is correctly interpreted by SQL.
 * @param {string | number | boolean | null} value - The value to be formatted for SQL.
 * @returns {string} - The formatted SQL value as a string.
 */
export declare const formatSqlValue: (value: string | number | boolean | null) => string;
