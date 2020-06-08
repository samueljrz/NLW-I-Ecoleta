import Knex from 'knex'

export async function up(knex: Knex) {
    return knex.schema.createTable('point_item', table => {
        table.increments('id').primary();
        table.integer('point_id').notNullable().references('id').inTable('point');
        table.integer('item_id').notNullable().references('id').inTable('item');

    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('point_item');
}