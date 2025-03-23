import {
	DynamicContent,
	type RenderContent,
} from "@/components/DynamicContent";
import { Layout } from "@/components/Layout/Layout";
import { Pagination } from "@/components/Pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/table";
import { trpc } from "@/libs/trpc";
import type { TrpcOutputs } from "@bin/api";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";

const PAGE_SIZE = 50;

export const GlobalBinsPage = () => {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const pageState = useState(0);
	const [page] = pageState;

	const queryClient = useQueryClient();
	const binsQuery = useQuery(
		trpc.bins.list.queryOptions({ page, pageSize: PAGE_SIZE }),
	);
	const {
		mutate: createBin,
		data: createBinData,
		isPending: isCreateBinPending,
	} = useMutation(trpc.bins.create.mutationOptions());

	const handleCreateDialogOpen = () => setIsCreateDialogOpen(true);
	const handleCreateDialogClose = () => setIsCreateDialogOpen(false);

	const handleBinCreate = () => {
		createBin(undefined, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.bins.list.pathKey() });
				enqueueSnackbar({ variant: "success", message: "Bin created" });
				handleCreateDialogClose();
			},
			onError: () => {
				enqueueSnackbar({ variant: "error", message: "Failed to create bin" });
			},
		});
	};

	const renderContent: RenderContent<TrpcOutputs["bins"]["list"]> = (list) => {
		const mappedRows = list.bins.map((bin) => (
			<TableRow key={bin.id}>
				<TableCell>{bin.deviceId}</TableCell>
				<TableCell>{bin.activationCode}</TableCell>
				<TableCell>{bin.activatedBin?.activatedAt}</TableCell>
				<TableCell>{bin.activatedBin?.organization.name}</TableCell>
			</TableRow>
		));
		return (
			<>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Device id</TableHead>
							<TableHead>Activation code</TableHead>
							<TableHead>Activated at</TableHead>
							<TableHead>Organization id</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{mappedRows}</TableBody>
				</Table>
				<div className="flex justify-end">
					<Pagination
						pageState={pageState}
						pageSize={PAGE_SIZE}
						total={list.totalCount}
					/>
				</div>
			</>
		);
	};
	return (
		<>
			<Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create bin</DialogTitle>
						<DialogDescription>
							We will generate everything for you
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button isLoading={isCreateBinPending} onClick={handleBinCreate}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Layout title="Global bins">
				<div className="flex justify-end mb-2">
					<Button onClick={handleCreateDialogOpen}>
						<Plus />
						Create bin
					</Button>
				</div>
				{createBinData && (
					<Alert className="mb-2">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Last generated device id</AlertTitle>
						<AlertDescription>{createBinData.deviceId}</AlertDescription>
					</Alert>
				)}
				<DynamicContent {...binsQuery} renderContent={renderContent} />
			</Layout>
		</>
	);
};
