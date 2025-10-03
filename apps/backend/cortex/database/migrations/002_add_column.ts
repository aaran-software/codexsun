export const migration = {
    name: '002_add_column',
    up: `
    ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;
  `,
    down: `
    ALTER TABLE users DROP COLUMN last_login;
  `
};