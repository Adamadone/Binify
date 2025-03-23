import { Layout } from "@/components/Layout";
import { Button } from "@/components/button";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../../libs/trpc";

export const HomePage = () => {
	const binListQuery = useQuery(trpc.listBins.queryOptions());

	return (
		<Layout title="Home">
			{JSON.stringify(binListQuery.data)}
			<div className="flex gap-2">
				<Button>Do something boring</Button>
				<Button variant="destructive">Destroy the universe!</Button>
			</div>
		</Layout>
	);
};
