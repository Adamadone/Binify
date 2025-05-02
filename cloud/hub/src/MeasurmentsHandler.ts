import type { RequestHandler } from "express";
import z from "zod";
import type { DataBuffer } from "./DataBuffer.js";

export type Measurment = {
	deviceId: string;
	measurment: {
		measuredAt: Date;
		distanceCentimeters: number;
		airQualityPpm: number;
	};
};

const measurmentSchema = z.object({
	deviceId: z.string().nonempty(),
	measurment: z.object({
		distanceCentimeters: z.number(),
		airQualityPpm: z.number(),
	}),
});

export const measurmentsHandler = (dataBuffer: DataBuffer<Measurment>) => {
	const handler: RequestHandler = (req, res) => {
		const { success, error, data } = measurmentSchema.safeParse(req.body);

		if (!success) {
			res.send(error);
			return;
		}

		const dataWithDate = {
			deviceId: data.deviceId,
			measurment: {
				...data.measurment,
				measuredAt: new Date(),
			},
		};

		try {
			dataBuffer.push(dataWithDate);
			res.status(200);
			res.send(dataWithDate);
		} catch (err) {
			console.error(err);
			res.sendStatus(400);
		}
	};

	return handler;
};
