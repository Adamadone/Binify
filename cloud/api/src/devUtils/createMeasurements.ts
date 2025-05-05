import readline from "node:readline";
import {
	type ImportBinBatchMeasurementsParams,
	importBinBatchMeasurements,
} from "../core/bins";

const getDateBeforeMinutes = (beforeMinutes: number) => {
	const date = new Date();
	date.setMinutes(date.getMinutes() - beforeMinutes);
	return date;
};

async function main() {
	// Try to read deviceId from argv, else fall back to interactive prompt
	const cliDeviceId = process.argv[2];
	const deviceId =
		cliDeviceId ??
		(await new Promise<string>((resolve) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});
			rl.question("deviceId: ", (answer) => {
				rl.close();
				resolve(answer);
			});
		}));

	const devices: ImportBinBatchMeasurementsParams["devices"] = [
		{
			deviceId,
			measurements: new Array(1_000).fill(null).map((_, index) => ({
				measuredAt: getDateBeforeMinutes(index * 30),
				airQualityPpm: Math.random() * 1_000,
				distanceCentimeters: Math.random() * 100,
			})),
		},
	];

	await importBinBatchMeasurements({ devices });
}

main().catch(console.error);
