/**
 * Simple logger module for logging messages and errors.
 */
const logger = {
    log: (message: string) => {
        console.log(message);
    },
    error: (message: string, error: any) => {
        console.error(message, error);
    },
};

export { logger };
