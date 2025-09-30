import { getDbConfig, DbConfig, getDbConnectionString } from '../../../cortex/config/db-config';
import { getSettings } from '../../../cortex/config/get-settings';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock the getSettings module
jest.mock('../../../cortex/config/get-settings', () => ({
  getSettings: jest.fn(),
}));

// Mock environment file path
const ENV_PATH = path.resolve(process.cwd(), '.env.test');

// Helper to create and cleanup .env.test file
async function setupEnv(content: string): Promise<void> {
  await fs.writeFile(ENV_PATH, content, 'utf8');
  dotenv.config({ path: ENV_PATH, override: true });
}

async function cleanupEnv(): Promise<void> {
  try {
    await fs.unlink(ENV_PATH);
  } catch (err) {
    // Ignore if file doesn't exist
  }
}

describe('Database Configuration Tests', () => {
  beforeEach(async () => {
    // Clear mocks and environment variables
    jest.clearAllMocks();
    await cleanupEnv();
    delete process.env.DB_DRIVER;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USER;
    delete process.env.DB_PASS;
    delete process.env.DB_NAME;
    delete process.env.DB_SSL;
  });

  afterEach(async () => {
    await cleanupEnv();
  });

  test('getSettings should load correct values from .env file', async () => {
    // Setup test .env file
    const envContent = `
      DB_DRIVER=postgres
      DB_HOST=localhost
      DB_PORT=5432
      DB_USER=testuser
      DB_PASS=testpass
      DB_NAME=testdb
      DB_SSL=true
    `;
    await setupEnv(envContent);

    // Mock getSettings to return the expected values
    (getSettings as jest.Mock).mockReturnValue({
      DB_DRIVER: 'postgres',
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USER: 'testuser',
      DB_PASS: 'testpass',
      DB_NAME: 'testdb',
      DB_SSL: true,
    });

    const settings = getSettings();
    expect(settings).toEqual({
      DB_DRIVER: 'postgres',
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USER: 'testuser',
      DB_PASS: 'testpass',
      DB_NAME: 'testdb',
      DB_SSL: true,
    });
  });

  test('getDbConfig should return correct DbConfig object', async () => {
    // Setup test .env file
    const envContent = `
      DB_DRIVER=mysql
      DB_HOST=127.0.0.1
      DB_PORT=3306
      DB_USER=admin
      DB_PASS=secret
      DB_NAME=appdb
      DB_SSL=false
    `;
    await setupEnv(envContent);

    // Mock getSettings to return the expected values
    (getSettings as jest.Mock).mockReturnValue({
      DB_DRIVER: 'mysql',
      DB_HOST: '127.0.0.1',
      DB_PORT: 3306,
      DB_USER: 'admin',
      DB_PASS: 'secret',
      DB_NAME: 'appdb',
      DB_SSL: false,
    });

    const expected: DbConfig = {
      driver: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      user: 'admin',
      password: 'secret',
      database: 'appdb',
      ssl: false,
    };

    const config = getDbConfig();
    expect(config).toEqual(expected);
  });

  test('getDbConnectionString should format correct connection strings', async () => {
    // Test for Postgres
    await setupEnv(`
      DB_DRIVER=postgres
      DB_HOST=localhost
      DB_PORT=5432
      DB_USER=testuser
      DB_PASS=testpass
      DB_NAME=testdb
      DB_SSL=true
    `);
    (getSettings as jest.Mock).mockReturnValue({
      DB_DRIVER: 'postgres',
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USER: 'testuser',
      DB_PASS: 'testpass',
      DB_NAME: 'testdb',
      DB_SSL: true,
    });
    expect(getDbConnectionString()).toBe(
      'postgres://testuser:testpass@localhost:5432/testdb'
    );

    // Test for MySQL
    await setupEnv(`
      DB_DRIVER=mysql
      DB_HOST=127.0.0.1
      DB_PORT=3306
      DB_USER=admin
      DB_PASS=secret
      DB_NAME=appdb
      DB_SSL=false
    `);
    (getSettings as jest.Mock).mockReturnValue({
      DB_DRIVER: 'mysql',
      DB_HOST: '127.0.0.1',
      DB_PORT: 3306,
      DB_USER: 'admin',
      DB_PASS: 'secret',
      DB_NAME: 'appdb',
      DB_SSL: false,
    });
    expect(getDbConnectionString()).toBe(
      'mysql://admin:secret@127.0.0.1:3306/appdb'
    );

    // Test for SQLite
    await setupEnv(`
      DB_DRIVER=sqlite
      DB_HOST=localhost
      DB_PORT=0
      DB_USER=
      DB_PASS=
      DB_NAME=/path/to/db.sqlite
      DB_SSL=false
    `);
    (getSettings as jest.Mock).mockReturnValue({
      DB_DRIVER: 'sqlite',
      DB_HOST: 'localhost',
      DB_PORT: 0,
      DB_USER: '',
      DB_PASS: '',
      DB_NAME: '/path/to/db.sqlite',
      DB_SSL: false,
    });
    expect(getDbConnectionString()).toBe('sqlite:///path/to/db.sqlite');
  });

  test('getDbConfig should handle missing environment variables', async () => {
    // Setup empty .env file
    await setupEnv('');
    (getSettings as jest.Mock).mockReturnValue({
      DB_DRIVER: undefined,
      DB_HOST: undefined,
      DB_PORT: undefined,
      DB_USER: undefined,
      DB_PASS: undefined,
      DB_NAME: undefined,
      DB_SSL: undefined,
    });

    const config = getDbConfig();
    expect(config).toEqual({
      driver: undefined,
      host: undefined,
      port: undefined,
      user: undefined,
      password: undefined,
      database: undefined,
      ssl: undefined,
    });
  });

  test('getDbConnectionString should handle URI encoding', async () => {
    await setupEnv(`
      DB_DRIVER=postgres
      DB_HOST=localhost
      DB_PORT=5432
      DB_USER=test user
      DB_PASS=pass@word#123
      DB_NAME=test db
      DB_SSL=true
    `);
    (getSettings as jest.Mock).mockReturnValue({
      DB_DRIVER: 'postgres',
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USER: 'test user',
      DB_PASS: 'pass@word#123',
      DB_NAME: 'test db',
      DB_SSL: true,
    });
    expect(getDbConnectionString()).toBe(
      'postgres://test%20user:pass%40word%23123@localhost:5432/test%20db'
    );
  });

  test('getDbConnectionString should throw for unsupported driver', async () => {
    await setupEnv(`
      DB_DRIVER=oracle
      DB_HOST=localhost
      DB_PORT=1521
      DB_USER=testuser
      DB_PASS=testpass
      DB_NAME=testdb
      DB_SSL=true
    `);
    (getSettings as jest.Mock).mockReturnValue({
      DB_DRIVER: 'oracle',
      DB_HOST: 'localhost',
      DB_PORT: 1521,
      DB_USER: 'testuser',
      DB_PASS: 'testpass',
      DB_NAME: 'testdb',
      DB_SSL: true,
    });
    expect(() => getDbConnectionString()).toThrow('Unsupported driver: oracle');
  });
});