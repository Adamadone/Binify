import type { ReactNode } from "react";

export type RenderContent<TData> = (data: TData) => ReactNode;

export type DynamicContentProps<TData, TError> = {
	data: TData | undefined;
	isPending: boolean;
	error: TError | null;
	renderContent: RenderContent<TData>;
};

export const DynamicContent = <TData, TError>({
	data,
	isPending,
	error,
	renderContent,
}: DynamicContentProps<TData, TError>) => {
	if (isPending) {
		return "loading";
	}

	if (error || data === undefined) {
		return "error";
	}

	const content = renderContent(data);
	return <>{content}</>;
};
