import { useStorage } from "@/context/StorageContext";
import { useUserMeQuery } from "@/hooks/useUserMeQuery";
import { trpc } from "@/libs/trpc";
import { Role } from "@/pages/authenticated/OrganizationPage/types";
import type { TrpcOutputs } from "@bin/api";
import { useQuery } from "@tanstack/react-query";
import {
	Link,
	type RegisteredRouter,
	type ToPathOption,
} from "@tanstack/react-router";
import { AlertCircle, HomeIcon, MicrochipIcon, UserCog } from "lucide-react";
import type { ReactElement } from "react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../sidebar";

type NavItem = {
	to: ToPathOption<RegisteredRouter, "/", "/">;
	title: string;
	icon: ReactElement;
	visible?: (user?: TrpcOutputs["accounts"]["me"]) => boolean;
};

type NavSection = {
	items: NavItem[];
} & (
	| {
			id: string;
			title?: undefined;
	  }
	| {
			id?: undefined;
			title: string;
	  }
);

const getNavSections = (
	isOrgAdmin: boolean,
	isOrgMember: boolean,
	organizationId?: number,
): NavSection[] => [
	{
		id: "root",
		items: [
			{
				to: "/",
				title: "Home",
				icon: <HomeIcon />,
			},
			{
				to: "/organization-bins",
				title: "Organization bins",
				icon: <MicrochipIcon />,
				visible: (user) => !!user && isOrgMember,
			},
		],
	},
	{
		title: "Organization administration",
		items: [
			{
				to: "/alert-history",
				title: "Alert history",
				icon: <AlertCircle />,
				visible: (user) => !!user && organizationId !== undefined && isOrgAdmin,
			},
		],
	},
	{
		title: "Global administration",
		items: [
			{
				to: "/global-bins",
				title: "Global bins",
				icon: <MicrochipIcon />,
				visible: (user) => !!user?.isSuperAdmin,
			},
			{
				to: "/super-admins",
				title: "Manage Super Admins",
				icon: <UserCog />,
				visible: (user) => !!user?.isSuperAdmin,
			},
		],
	},
];

export const LayoutNavigation = () => {
	const userMeQuery = useUserMeQuery();
	const storage = useStorage();

	const organizationId = storage.data.activeOrgId;

	const organizationsQuery = useQuery(
		trpc.organizations.listForCurrentUser.queryOptions(),
	);

	const currentOrganization =
		organizationId !== undefined
			? organizationsQuery.data?.find((org) => org.id === organizationId)
			: undefined;

	const isOrgAdmin = currentOrganization?.member?.role === Role.ADMIN;
	const isOrgMember = currentOrganization !== undefined;

	const navSections = getNavSections(
		isOrgAdmin,
		isOrgMember,
		storage.data.activeOrgId,
	);

	const mappedSection = navSections.map((section) => {
		const itemsToRender = section.items.filter(
			(item) => !item.visible || item.visible(userMeQuery.data),
		);
		if (itemsToRender.length === 0) return null;

		const mappedItems = itemsToRender.map((item) => (
			<SidebarMenuItem key={item.to}>
				<SidebarMenuButton asChild>
					<Link to={item.to}>
						{item.icon}
						<span>{item.title}</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		));

		return (
			<SidebarGroup key={section.id || section.title}>
				{section.title && (
					<SidebarGroupLabel>{section.title}</SidebarGroupLabel>
				)}
				<SidebarGroupContent className="flex flex-col gap-2">
					<SidebarMenu>{mappedItems}</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	});

	return mappedSection;
};
