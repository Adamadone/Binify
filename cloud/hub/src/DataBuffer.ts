type OnDataPushedCallback<T> = (data: T) => Promise<void> | void;

// In memory buffer for arbitrary data
export class DataBuffer<T> {
	buffer: T[];
	onDataPushedCallback?: OnDataPushedCallback<T>;

	constructor(
		initialData?: T[],
		onDataPushedCallback?: OnDataPushedCallback<T>,
	) {
		this.buffer = initialData ?? [];
		this.onDataPushedCallback = onDataPushedCallback;
	}

	async push(data: T): Promise<T | undefined> {
		if (this.onDataPushedCallback) {
			try {
				await this.onDataPushedCallback(data);
			} catch {
				return;
			}
		}

		this.buffer.push(data);
		return data;
	}

	getData(): T[] {
		return this.buffer;
	}

	clear() {
		this.buffer = [];
	}
}
