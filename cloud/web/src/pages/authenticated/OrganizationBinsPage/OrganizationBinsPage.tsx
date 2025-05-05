import { skipToken, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

import {
	DynamicContent,
	type RenderContent,
} from "@/components/DynamicContent";
import { Layout } from "@/components/Layout/Layout";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
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
import { Navigate, useNavigate } from "@tanstack/react-router";
import { FullnessChart } from "../DeviceDetailPage/charts/FullnessChart";
import { QUERY } from "../DeviceDetailPage/constants";
import { ActivateBinDialog } from "./ActivateBinDialog";
import { DeactivateBinDialog } from "./DeactivateBinDialog";

const PAGE_SIZE = 50;

export const OrganizationBinsPage = () => {
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
	const [binToDeactivate, setBinToDeactivate] = useState<{
		id: number;
		name: string;
	} | null>(null);

	const storage = useStorage();
	const organizationId = storage.data.activeOrgId;

	if (organizationId === undefined) {
		return <Navigate to="/" />;
	}

	// Queries
	const organizationsQuery = useQuery(
		trpc.organizations.listForCurrentUser.queryOptions(),
	);

	// Latest measurement timestamp query for charts
	const latestMeasurementQuery = useQuery(
		trpc.bins.getLatestMeasurementTime.queryOptions(
			{ organizationId },
			{
				staleTime: QUERY.STALE_TIME,
				refetchOnWindowFocus: false,
				enabled: !!organizationId,
			},
		),
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
	> = useCallback(
		(list) => (
			<>
				{/* Charts Section */}
				{list.bins.length > 0 && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle className="text-3xl">Device Statistics</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-6">
								Showing measurement data for the past 24 hours since the last
								measurement of each device.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{list.bins.map((bin) => (
									<Card
										key={`chart-${bin.id}`}
										className="shadow-sm cursor-pointer transition-shadow hover:shadow-md"
										onClick={() =>
											navigate({
												to: "/devices/$binId",
												params: { binId: bin.id.toString() },
											})
										}
									>
										<CardHeader className="pb-2">
											<CardTitle className="text-base">
												{bin.name || `Bin ${bin.id}`}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<FullnessChart
												binId={bin.id.toString()}
												latestTimestamp={
													latestMeasurementQuery.data?.latestTimestamp ??
													undefined
												}
												initialTimeRange="24h"
												showTimeRangeSelector={false}
												height={200}
												className="overflow-hidden"
											/>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Management Table Section */}
				<Card>
					<CardHeader className="flex flex-row justify-between items-center">
						<CardTitle className="text-3xl">Bin Management</CardTitle>
						<Button onClick={() => setIsActivateDialogOpen(true)}>
							<Plus className="mr-1 h-4 w-4" />
							Activate bin
						</Button>
					</CardHeader>
					<CardContent className="pl-4">
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

						<div className="flex justify-end mt-4">
							<Pagination
								pageState={[page, setPage]}
								pageSize={PAGE_SIZE}
								total={list.totalCount}
							/>
						</div>
					</CardContent>
				</Card>
			</>
		),
		[latestMeasurementQuery.data?.latestTimestamp, navigate, isAdmin, page],
	);

	// Redirect if no organization is selected
	if (organizationId === undefined) {
		return <Navigate to="/" />;
	}

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

			<Layout title="Organization Bins">
				<DynamicContent
					data={binsQuery.data}
					isPending={binsQuery.isPending || latestMeasurementQuery.isPending}
					error={binsQuery.error || latestMeasurementQuery.error}
					renderContent={renderContent}
				/>
			</Layout>
		</>
	);
};
