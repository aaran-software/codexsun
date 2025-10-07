import { getSettings } from '../../cortex/config/get-settings';
import { Connection } from '../../cortex/db/connection';
import { getDbConfig } from '../../cortex/config/db-config';

let connection: Connection;

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const dbConfig = getDbConfig();
    connection = await Connection.initialize(dbConfig);
});

afterAll(async () => {
    await connection.close();
});

export { connection, getSettings };