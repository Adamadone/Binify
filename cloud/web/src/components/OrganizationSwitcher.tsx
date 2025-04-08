"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Edit, Plus } from "lucide-react";
import { enqueueSnackbar } from "notistack";

import {
	DynamicContent,
	type RenderContent,
} from "@/components/DynamicContent";
import { Avatar, AvatarFallback } from "@/components/avatar";
import { Button } from "@/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/sidebar";
import { useStorage } from "@/context/StorageContext";
import { trpc } from "@/libs/trpc";
import type { TrpcOutputs } from "@bin/api";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

type OrganizationsList = TrpcOutputs["organizations"]["listForCurrentUser"];

export function OrganizationSwitcher() {
	const navigate = useNavigate();
	const { isMobile } = useSidebar();
	const storage = useStorage();
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newOrgName, setNewOrgName] = useState("");

	const activeOrgId = storage.data.activeOrgId as number | undefined;

	// fetch organizations
	const organizationsQuery = useQuery(
		trpc.organizations.listForCurrentUser.queryOptions(),
	);

	// create organization
	const { mutate: createOrganization, isPending: isCreating } = useMutation(
		trpc.organizations.create.mutationOptions(),
	);

	const handleSwitchOrg = (orgId: number) => {
		storage.set("activeOrgId", orgId);
		enqueueSnackbar({
			variant: "success",
			message: "Organization switched",
		});
	};

	const handleEditOrg = () => {
		navigate({
			to: "/organization",
		});
	};

	const handleCreateDialogOpen = () => setIsCreateDialogOpen(true);
	const handleCreateDialogClose = () => {
		setIsCreateDialogOpen(false);
		setNewOrgName("");
	};

	const handleCreateOrg = (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		const name = newOrgName.trim();
		if (!name) {
			enqueueSnackbar({
				variant: "error",
				message: "A name is required to create an organization",
			});
			return;
		}

		createOrganization(
			{ name },
			{
				onSuccess: (data) => {
					queryClient.invalidateQueries({
						queryKey: trpc.organizations.listForCurrentUser.pathKey(),
					});
					storage.set("activeOrgId", data.organization.id);
					enqueueSnackbar({
						variant: "success",
						message: "Organization created",
					});
					handleCreateDialogClose();
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Failed to create organization",
					});
				},
			},
		);
	};

	const renderNoActiveOrg = () => (
		<>
			<Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Organization</DialogTitle>
						<DialogDescription>
							Create your first organization to get started
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleCreateOrg}>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={newOrgName}
									onChange={(e) => setNewOrgName(e.target.value)}
									autoFocus
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="submit"
								disabled={!newOrgName.trim() || isCreating}
								isLoading={isCreating}
							>
								Create
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						onClick={handleCreateDialogOpen}
						size="lg"
						className="text-sidebar-foreground"
					>
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/20">
							<Plus className="size-4" />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">
								Create organization
							</span>
							<span className="truncate text-xs">Get started</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</>
	);

	const renderContent: RenderContent<OrganizationsList> = (organizations) => {
		const currentActiveOrg = organizations?.length
			? organizations.find((org) => org.id === activeOrgId) || organizations[0]
			: undefined;

		if (!currentActiveOrg) {
			return renderNoActiveOrg();
		}

		const orgInitial = currentActiveOrg.name.charAt(0).toUpperCase();
		const userRole = currentActiveOrg.member?.role || "Member";

		return (
			<>
				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={handleCreateDialogClose}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Organization</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreateOrg}>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										value={newOrgName}
										onChange={(e) => setNewOrgName(e.target.value)}
										autoFocus
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="submit"
									disabled={!newOrgName.trim() || isCreating}
									isLoading={isCreating}
								>
									Create
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>

				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
											{orgInitial}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{currentActiveOrg.name}
										</span>
										<span className="truncate text-xs">{userRole}</span>
									</div>
									<ChevronsUpDown className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								align="start"
								side={isMobile ? "bottom" : "right"}
								sideOffset={4}
							>
								<DropdownMenuLabel className="text-xs text-muted-foreground">
									Organizations
								</DropdownMenuLabel>
								{organizations.map((org) => (
									<DropdownMenuItem
										key={org.id}
										className="p-0 cursor-default focus:bg-transparent"
										onSelect={(e) => {
											e.preventDefault();
										}}
									>
										<div className="flex items-center justify-between w-full">
											<Button
												variant="ghost"
												className="flex-1 justify-start gap-2 px-2 hover:bg-accent"
												onClick={() => handleSwitchOrg(org.id)}
											>
												<Avatar className="h-6 w-6">
													<AvatarFallback className="text-xs border rounded-sm bg-primary/10">
														{org.name.charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<span className="truncate">{org.name}</span>
											</Button>

											{org.member?.role === "ADMIN" && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 p-0 hover:bg-accent"
													onClick={(e) => {
														e.stopPropagation();
														handleEditOrg();
													}}
												>
													<Edit className="h-4 w-4 text-muted-foreground" />
													<span className="sr-only">Edit organization</span>
												</Button>
											)}
										</div>
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="gap-2 p-2"
									onClick={handleCreateDialogOpen}
								>
									<div className="flex size-6 items-center justify-center rounded-md border bg-background">
										<Plus className="size-4" />
									</div>
									<div className="font-medium text-muted-foreground">
										New organization
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</>
		);
	};

	return (
		<DynamicContent {...organizationsQuery} renderContent={renderContent} />
	);
}
