import type { TrpcRouter } from "@bin/api";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { env } from "./Env.js";

const client = createTRPCClient<TrpcRouter>({
	links: [
		httpBatchLink({
			url: `${env.BACKEND_URI}/trpc`,
		}),
	],
});

export type MeasurmentBatch = Parameters<
	typeof client.bins.importBatchMeasurements.mutate
>[0];

export interface IDataProvider {
	getData(): Promise<MeasurmentBatch | undefined>;
}

// Class to sync buffered data to cloud
export class DataSync {
	dataProvider: IDataProvider;

	constructor(dataProvider: IDataProvider) {
		this.dataProvider = dataProvider;
	}

	async syncData() {
		const data = await this.dataProvider.getData();

		if (!data) {
			return;
		}

		await client.bins.importBatchMeasurements.mutate(data);
	}
}
