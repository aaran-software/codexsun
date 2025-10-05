exports.up = async function (knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('email').unique().notNullable().index();
        table.string('password').notNullable();
        table.string('first_name');
        table.string('last_name');
        table.string('role').defaultTo('user');
        table.timestamps(true, true);
    });
};

exports.down = async function (knex) {
    return knex.schema.dropTableIfExists('users');
};