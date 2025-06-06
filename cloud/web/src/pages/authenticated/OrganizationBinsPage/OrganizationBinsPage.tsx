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
import { DatePicker } from "@/components/datepicker";
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
import { ActivateBinDialog } from "./ActivateBinDialog";
import { DeactivateBinDialog } from "./DeactivateBinDialog";

const PAGE_SIZE = 50;

export const OrganizationBinsPage = () => {
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
	const [binDates, setBinDates] = useState<Record<string, Date | undefined>>(
		{},
	);
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
				{list.bins.length === 0 && (
					<div className="space-y-8">
						<Card className="mb-8">
							<CardHeader>
								<CardTitle className="text-3xl">Device Statistics</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center text-muted-foreground">
									No devices are currently paired with this organization.
								</div>
							</CardContent>
						</Card>
					</div>
				)}
				{/* Charts Section */}
				{list.bins.length > 0 && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle className="text-3xl">Device Statistics</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-6">
								Showing averaged measurement data for the past 24 hours from the
								chosen date.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{list.bins.map((bin) => {
									const binId = bin.id.toString();

									return (
										<Card
											key={`chart-${bin.id}`}
											className="shadow-sm cursor-pointer transition-shadow hover:shadow-md"
											onClick={() =>
												navigate({
													to: "/devices/$binId",
													params: { binId },
												})
											}
										>
											<CardHeader className="pb-2 flex flex-row items-center justify-between">
												<CardTitle className="text-base">
													{bin.name || `Bin ${bin.id}`}
												</CardTitle>
												<div
													onClick={(e) => e.stopPropagation()}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.stopPropagation();
														}
													}}
													className="z-10"
												>
													<DatePicker
														date={binDates[binId]}
														onDateChange={(date) => {
															setBinDates((prev) => ({
																...prev,
																[binId]: date,
															}));
														}}
														className="h-7 px-2 py-1 text-xs"
													/>
												</div>
											</CardHeader>
											<CardContent>
												<div className="relative">
													<FullnessChart
														binId={binId}
														initialTimeRange="24h"
														showTimeRangeSelector={false}
														startDate={binDates[binId]}
														height={200}
														className="overflow-hidden"
													/>
												</div>
											</CardContent>
										</Card>
									);
								})}
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
		[navigate, isAdmin, page, binDates],
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
					isPending={binsQuery.isPending}
					error={binsQuery.error}
					renderContent={renderContent}
				/>
			</Layout>
		</>
	);
};
