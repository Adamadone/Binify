import path from "node:path";
import bodyParser from "body-parser";
import express from "express";
import { BackendDataAdapter } from "./BackendDataAdapter.js";
import { BufferPersistanceAdapter } from "./BufferPersistanceAdapter.js";
import { DataBuffer } from "./DataBuffer.js";
import { DataSync } from "./DataSync.js";
import { env } from "./Env.js";
import { type Measurment, measurmentsHandler } from "./MeasurmentsHandler.js";

const appInit = async () => {
	const bufferPersistanceAdapter =
		await BufferPersistanceAdapter.init<Measurment>(
			path.join(import.meta.dirname, env.DATA_PERSISTANCE_FILE),
		);

	const persistedData = await bufferPersistanceAdapter.getAllData();

	const dataBuffer = new DataBuffer<Measurment>(persistedData, async (data) => {
		await bufferPersistanceAdapter.append(data);
	});

	const backendDataAdapter = new BackendDataAdapter(async () =>
		dataBuffer.getData(),
	);

	const dataSynchronizer = new DataSync({
		getData: async () => backendDataAdapter.getTransformedData(),
	});

	const api = express();

	// Data sync task
	setInterval(
		async () => {
			try {
				await dataSynchronizer.syncData();
			} catch (err) {
				console.error(`Error syncing data: ${err}`);
				return;
			}

			dataBuffer.clear();
			await bufferPersistanceAdapter.clearData();
		},
		1000 * 60 * env.DATA_SYNC_INTERVAL_MINUTES,
	);

	api.use(bodyParser.json());

	api.post("/measurments", measurmentsHandler(dataBuffer));

	api.listen(env.PORT, (err) => {
		if (err) {
			console.error(err);
			return;
		}

		console.log(`Api listening on port ${env.PORT}`);
	});
};

appInit().catch((err) => console.error(err));
