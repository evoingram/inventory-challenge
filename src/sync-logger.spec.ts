import { logger } from './sync-logger';

describe('logger', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should log messages to the console', () => {
        const message = "Test log";
        logger.log(message);
        expect(console.log).toHaveBeenCalledWith(message);
    });

    it('should log errors to the console', () => {
        const message = "Test error";
        const error = new Error("Something went wrong");
        logger.error(message, error);
        expect(console.error).toHaveBeenCalledWith(message, error);
    });
});
