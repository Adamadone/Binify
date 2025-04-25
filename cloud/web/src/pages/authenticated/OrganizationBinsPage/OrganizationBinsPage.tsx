import { skipToken, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
	DynamicContent,
	type RenderContent,
} from "@/components/DynamicContent";
import { Layout } from "@/components/Layout/Layout";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/table";

import { useStorage } from "@/context/StorageContext";
import { formatDateTime } from "@/helpers/utils";
import { trpc } from "@/libs/trpc";
import type { TrpcOutputs } from "@bin/api";
import { Navigate } from "@tanstack/react-router";

import { ActivateBinDialog } from "./ActivateBinDialog";
import { DeactivateBinDialog } from "./DeactivateBinDialog";

const PAGE_SIZE = 50;

export const OrganizationBinsPage = () => {
	const [page, setPage] = useState(0);
	const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
	const [binToDeactivate, setBinToDeactivate] = useState<{
		id: number;
		name: string;
	} | null>(null);

	const storage = useStorage();
	const organizationId = storage.data.activeOrgId;

	// Redirect if no organization is selected
	if (organizationId === undefined) {
		return <Navigate to="/" />;
	}

	// Queries
	const organizationsQuery = useQuery(
		trpc.organizations.listForCurrentUser.queryOptions(),
	);

	const binsQuery = useQuery(
		trpc.bins.listActivatedForOrganization.queryOptions(
			organizationId
				? {
						organizationId,
						page,
						pageSize: PAGE_SIZE,
					}
				: skipToken,
		),
	);

	const activeOrg = organizationsQuery.data?.find(
		(org) => org.id === organizationId,
	);

	const isAdmin = activeOrg?.member?.role === "ADMIN";

	const renderContent: RenderContent<
		TrpcOutputs["bins"]["listActivatedForOrganization"]
	> = (list) => (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Bin name</TableHead>
						<TableHead>Activated at</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{list.bins.map((bin) => (
						<TableRow key={bin.id}>
							<TableCell>{bin.name}</TableCell>
							<TableCell>{formatDateTime(bin.activatedAt)}</TableCell>
							<TableCell className="text-right">
								{isAdmin && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() =>
											setBinToDeactivate({ id: bin.id, name: bin.name })
										}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<div className="flex justify-end">
				<Pagination
					pageState={[page, setPage]}
					pageSize={PAGE_SIZE}
					total={list.totalCount}
				/>
			</div>
		</>
	);

	return (
		<>
			{isAdmin && (
				<ActivateBinDialog
					open={isActivateDialogOpen}
					onClose={() => setIsActivateDialogOpen(false)}
					organizationId={organizationId}
				/>
			)}

			{isAdmin && (
				<DeactivateBinDialog
					open={!!binToDeactivate}
					bin={binToDeactivate}
					onClose={() => setBinToDeactivate(null)}
				/>
			)}

			<Layout title="Organization bins">
				{isAdmin && (
					<div className="flex justify-end mb-2">
						<Button onClick={() => setIsActivateDialogOpen(true)}>
							<Plus />
							Activate bin
						</Button>
					</div>
				)}

				<DynamicContent {...binsQuery} renderContent={renderContent} />
			</Layout>
		</>
	);
};
