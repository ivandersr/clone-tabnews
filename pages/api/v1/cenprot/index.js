import database from "infra/database";

export default async function cenprot(request, response) {
    if (!["GET", "POST"].includes(request.method)) {
        return response.status(405).json({
            error: `Method ${request.method} not allowed`,
        });
    }
    try {
        if (request.method === "GET") {
            const result = await database.query({
                text: "SELECT id, content FROM logs;",
            });

            response.status(200).json({
                result: result.rows
            });
        }

        if (request.method === "POST") {
            const log = request.body;
            await database.query({
                text: "INSERT INTO logs (content) VALUES ($1);",
                values: [JSON.stringify(log)],
            });

            return response.status(201).json([]);
        }
    } catch (err) {
        const publicErrorObject = new InternalServerError({
            cause: err,
        });
        console.log("\nErro no cenprot:");
        console.error(publicErrorObject);
        response.status(500).json(publicErrorObject);
    }
}