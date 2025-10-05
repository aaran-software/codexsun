exports.up = async function (knex) {
    return knex.schema.createTable('tenants', (table) => {
        table.increments('id').primary();
        table.string('tenant_id').unique().notNullable().index();
        table.string('db_name').notNullable();
        table.string('company_name').notNullable();
        table.string('status').defaultTo('active');
        table.timestamps(true, true);
    });
};

exports.down = async function (knex) {
    return knex.schema.dropTableIfExists('tenants');
};