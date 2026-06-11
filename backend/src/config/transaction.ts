import { db } from './database';

export const executeTransaction = async (
    query: string,
    values: any[],
    userId?: string | number
) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        if (userId) {
            // Define o id do usuário para esta transação. 
            // A trigger de auditoria deve buscar essa variável com current_setting('app.usuario_logado')
            await client.query('SET LOCAL app.usuario_logado = $1', [userId]);
        }

        const result = await client.query(query, values);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro na transação, realizando ROLLBACK:', error);
        throw error;
    } finally {
        client.release();
    }
};
