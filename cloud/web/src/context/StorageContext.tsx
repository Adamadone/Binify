import {
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import { type ZodOptionalType, type ZodType, z } from "zod";

const storageSchemas = {
	token: z.string().optional(),
} satisfies Record<string, ZodOptionalType<ZodType>>;

export type StorageKey = keyof typeof storageSchemas;
export type StorageData = {
	[Key in StorageKey]: z.infer<(typeof storageSchemas)[Key]>;
};

const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

export const loadStorage = (): StorageData => {
	const validatedEntries = Object.entries(storageSchemas).map(
		([key, schema]) => {
			const raw = localStorage.getItem(key);
			if (!raw) return [key, null];

			const decoded = safeJsonParse(raw);
			const validation = schema.safeParse(decoded);
			if (validation.error) return [key, null];

			return [key, validation.data];
		},
	);

	return Object.fromEntries(validatedEntries);
};

export type StorageContext = {
	data: StorageData;
	set: <TKey extends StorageKey>(key: TKey, value: StorageData[TKey]) => void;
};

const storageContext = createContext<StorageContext | null>(null);

export const StorageProvider = ({ children }: PropsWithChildren) => {
	const [data, setData] = useState(loadStorage());

	const set: StorageContext["set"] = useCallback((key, value) => {
		localStorage.setItem(key, JSON.stringify(value));
		setData((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	return (
		<storageContext.Provider value={{ data: data, set }}>
			{children}
		</storageContext.Provider>
	);
};

export const useStorage = () => {
	const context = useContext(storageContext);
	if (!context) throw new Error("storage context not found");

	return context;
};
