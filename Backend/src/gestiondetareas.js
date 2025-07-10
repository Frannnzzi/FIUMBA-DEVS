const {Pool} = require('pg');
const { password } = require('pg/lib/defaults');

const dbclient = new Pool({
    user: 'postgres',
    port: 5433,
    host: '127.0.0.1',
    database: 'Tp final DSS',
    password: 'augusto18'
});

async function getAllusuarios() {
    const result = await dbclient.query('SELECT * FROM usuarios');
    return result.rows;
}

module.exports = {
    getAllusuarios 
};