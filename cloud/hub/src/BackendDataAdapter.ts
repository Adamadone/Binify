import type { MeasurmentBatch } from "./DataSync.js";
import type { Measurment } from "./MeasurmentsHandler.js";

// Transforms measurments into a format that the backend can process
export class BackendDataAdapter {
	getInputData: () => Promise<Measurment[]>;

	constructor(getInputData: () => Promise<Measurment[]>) {
		this.getInputData = getInputData;
	}

	async getTransformedData(): Promise<MeasurmentBatch | undefined> {
		// Local independent copy of measurments
		const inputData = structuredClone(await this.getInputData());

		if (inputData.length === 0) {
			return;
		}

		const outputData: MeasurmentBatch = {
			devices: [],
		};

		const processedDeviceIds: string[] = [];

		for (const measurment of inputData) {
			if (!processedDeviceIds.includes(measurment.deviceId)) {
				const deviceMeasurments: MeasurmentBatch["devices"][0]["measurements"] =
					inputData
						.filter((dataPoint) => dataPoint.deviceId === measurment.deviceId)
						.map(({ measurment }) => {
							return {
								airQualityPpm: measurment.airQualityPpm,
								distanceCentimeters: measurment.distanceCentimeters,
								measuredAt: measurment.measuredAt.toISOString(),
							};
						});

				outputData.devices.push({
					deviceId: measurment.deviceId,
					measurements: deviceMeasurments,
				});
			}
		}

		return outputData;
	}
}
