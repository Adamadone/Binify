import fs, { type FileHandle } from "node:fs/promises";
import path from "node:path";

// Class to persist a buffer to local storage to prevent data loss on power outage
export class BufferPersistanceAdapter<T> {
	storageFilePath: string;

	private constructor(storageFilePath: string) {
		this.storageFilePath = storageFilePath;
	}

	async append(data: T) {
		const dataString = JSON.stringify(data);

		const storageFile = await fs.open(this.storageFilePath, "a");

		await storageFile.appendFile(`${dataString};`);

		await storageFile.close();
	}

	async getAllData(): Promise<T[]> {
		let storedData = await fs.readFile(this.storageFilePath, {
			encoding: "utf-8",
		});

		if (!storedData) return [];

		// If data has a trailing semicolon, remove it
		if (storedData[storedData.length - 1] === ";") {
			storedData = storedData.substring(0, storedData.length - 1);
		}

		const splitDataPoints = storedData.split(";");

		return splitDataPoints.map((dataPoint) => JSON.parse(dataPoint)) as T[];
	}

	async clearData() {
		const storageFile = await fs.open(this.storageFilePath, "w");
		await storageFile.truncate();
		await storageFile.close();
	}

	static async init<T>(
		absoluteStoragePath: string,
	): Promise<BufferPersistanceAdapter<T>> {
		let fh: FileHandle | undefined;

		try {
			fh = await fs.open(absoluteStoragePath);
			await fh.close();
		} catch {
			await fs.mkdir(path.dirname(absoluteStoragePath), { recursive: true });
			fh = await fs.open(absoluteStoragePath, "w");
			await fh.close();
		}

		if (!fh) {
			throw new Error("Could not create data directory");
		}

		return new BufferPersistanceAdapter<T>(absoluteStoragePath);
	}
}
