import { Client } from 'pg';

async function query(queryObj) {
    const client = new Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
        ssl: process.env.NODE_ENV === 'development'
            ? false
            : true
    });

    console.log('Credenciais do Postgres:', {
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
    });

    try {
        await client.connect();
        const result = await client.query(queryObj);
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await client.end();
    }
}

export default {
    query
}