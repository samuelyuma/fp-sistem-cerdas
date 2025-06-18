import cors from "@elysiajs/cors";
import dotenv from "dotenv";
import { Elysia, t } from "elysia";
import {
	type Collection,
	type Document,
	MongoClient,
	ServerApiVersion,
} from "mongodb";

dotenv.config();

const payloadSchema = t.Partial(
	t.Object({
		suhu: t.Number(),
		jarak: t.Number(),
	}),
);

interface SensorDocument extends Document {
	suhu?: number;
	jarak?: number;
	temp_status?: "Dingin" | "Panas" | "Sangat Panas";
	distance_status?: "Jauh" | "Dekat" | "Sangat Dekat";
	created_at: Date;
}

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
	console.error("MONGO_URI environment variable not set!");
	process.exit(1);
}
const mongoClient = new MongoClient(mongoUri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

let sensorReadingsCollection: Collection<SensorDocument>;

try {
	await mongoClient.connect();
	const db = mongoClient.db("sensors_db");
	sensorReadingsCollection = db.collection<SensorDocument>("sensors");
	console.log("✅ Connected to MongoDB!");
} catch (e) {
	console.error("❌ Failed to connect to MongoDB", e);
	process.exit(1);
}

function getTemperatureState(
	suhu: number | undefined,
): "Dingin" | "Panas" | "Sangat Panas" | null {
	if (suhu === undefined) return null;
	if (suhu <= 40) return "Dingin";
	if (suhu <= 70) return "Panas";
	return "Sangat Panas";
}

function getDistanceState(
	jarak: number | undefined,
): "Jauh" | "Dekat" | "Sangat Dekat" | null {
	if (jarak === undefined) return null;
	if (jarak <= 50) return "Sangat Dekat";
	if (jarak > 100) return "Jauh";
	return "Dekat";
}

const app = new Elysia()
	.use(cors())
	.ws("/ws", {
		open(ws) {
			console.log(`🔌 WebSocket connected: ${ws.id}`);
			ws.subscribe("final-project");
		},
		close(ws) {
			console.log(`🔌 WebSocket disconnected: ${ws.id}`);
			ws.unsubscribe("final-project");
		},
	})
	.post(
		"/data",
		async ({ body }) => {
			console.log("Received data:", body);

			const machineState = (body.jarak ?? 0) > 50 || (body.suhu ?? 0) > 40;
			const tempState = getTemperatureState(body.suhu);
			const distanceState = getDistanceState(body.jarak);

			const payload: SensorDocument = {
				...(body.suhu !== undefined && { suhu: body.suhu }),
				...(body.jarak !== undefined && { jarak: body.jarak }),
				...(tempState && { temp_status: tempState }),
				...(distanceState && { distance_status: distanceState }),
				created_at: new Date(),
			};

			try {
				await sensorReadingsCollection.insertOne(payload);
			} catch (e) {
				console.error("Error saving to MongoDB:", e);
				return { success: false, error: "Database error" };
			}

			app.server?.publish("final-project", JSON.stringify(payload));

			return { success: true, state: machineState };
		},
		{
			body: payloadSchema,
		},
	)
	.get("/data/latest", async () => {
		try {
			const data = await sensorReadingsCollection
				.find()
				.sort({ created_at: -1 })
				.limit(5)
				.toArray();
			return { success: true, data: data };
		} catch (e) {
			console.error("Error fetching data from MongoDB:", e);
			return { success: false, error: "Database error" };
		}
	})
	.listen(8080);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
