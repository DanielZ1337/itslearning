import { Button } from "@/components/ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { TabButtonHoverProvider } from "@/contexts/tab-button-hover-context";
import { useCourse } from "@/hooks/atoms/useCourse";
import { useTabButtonHover } from "@/hooks/useTabButtonHover";
import { cn } from "@/lib/utils";
import useGETstarredCourses from "@/queries/course-cards/useGETstarredCourses";
import useGETunstarredCourses from "@/queries/course-cards/useGETunstarredCourses";
import useGETcourseNotifications from "@/queries/courses/useGETcourseNotifications";
import useGETcourseResourceBySearch from "@/queries/courses/useGETcourseResourceBySearch";
import { GETstarredCourses } from "@/types/api-types/course-cards/GETstarredCourses";
import { GETunstarredCourses } from "@/types/api-types/course-cards/GETunstarredCourses";
import {
	isResourceFile,
	useNavigateToResource,
} from "@/types/api-types/extra/learning-tool-id-types";
import { ItsolutionsItslUtilsConstantsLocationType } from "@/types/api-types/utils/Itsolutions.ItslUtils.Constants.LocationType";
import { useDebounce } from "@uidotdev/usehooks";
import { CommandLoading } from "cmdk";
import { motion, useCycle } from "framer-motion";
import { DownloadIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { isSupportedResourceInApp } from "../../types/api-types/extra/learning-tool-id-types";
import { useDownloadToast } from "../recursive-file-explorer";
import TitlebarButton from "./titlebar-button";

export default function TitlebarSearch() {
	const [isOpen, setIsOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const debouncedQuery = useDebounce(query, 300);
	const { courseId } = useCourse();
	const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(
		undefined,
	);
	const navigate = useNavigate();

	const { data: starredCourses, isLoading: isStarredFetching } =
		useGETstarredCourses(
			{
				PageIndex: 0,
				PageSize: 100,
				searchText: debouncedQuery,
				sortBy: "Rank",
			},
			{
				suspense: false,
				keepPreviousData: true,
			},
		);

	const { data: unstarredCourses, isLoading: isUnstarredFetching } =
		useGETunstarredCourses(
			{
				PageIndex: 0,
				PageSize: 100,
				searchText: debouncedQuery,
				sortBy: "Rank",
			},
			{
				suspense: false,
				keepPreviousData: true,
			},
		);

	const tabs = React.useMemo(
		() => [
			{ id: "courses", label: "Courses", isEnabled: true },
			{
				id: "resources",
				label: "Resources",
				isEnabled: courseId !== undefined,
			},
		],
		[courseId],
	);

	const [activeTab, setTabIndex] = useCycle(...tabs.map((tab) => tab.id));

	useEffect(() => {
		if (
			activeTab === "resources" &&
			!tabs.find((tab) => tab.id === "resources")?.isEnabled
		) {
			setTabIndex(0);
		}
	}, [courseId, activeTab, tabs, setTabIndex]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const enabledTabs = tabs.filter((tab) => tab.isEnabled);
			const currentIndex = enabledTabs.findIndex((tab) => tab.id === activeTab);

			if (e.key === "ArrowRight") {
				e.preventDefault();
				const nextIndex = (currentIndex + 1) % enabledTabs.length;
				setTabIndex(nextIndex);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				const prevIndex =
					(currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
				setTabIndex(prevIndex);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeTab, tabs, setTabIndex]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isCapsLock = e.getModifierState("CapsLock");
			const key = isCapsLock ? e.key.toLowerCase() : e.key;
			if (key === "x" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsOpen((isOpen) => !isOpen);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleSelect = useCallback((callback: () => unknown) => {
		setIsOpen(false);
		callback();
	}, []);

	useEffect(() => {
		if (!isOpen) {
			setQuery("");
			setTabIndex(0);
		}

		return () => {
			setQuery("");
			setTabIndex(0);
		};
	}, [isOpen]);

	const variants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
	};

	return (
		<>
			<TitlebarButton onClick={() => setIsOpen(true)} />
			<CommandDialog modal open={isOpen} onOpenChange={setIsOpen}>
				<CommandInput
					autoFocus
					placeholder="Search resources..."
					value={query}
					onValueChange={setQuery}
				/>
				<div className="flex justify-center gap-0.5 mb-1">
					<TabButtonHoverProvider>
						{tabs
							.filter((tab) => tab.isEnabled)
							.map((tab) => (
								<TitlebarSearchTabButton
									key={tab.id}
									active={activeTab === tab.id}
									onClick={() => setTabIndex(tabs.indexOf(tab))}
									id={tab.id}
								>
									{tab.label}
								</TitlebarSearchTabButton>
							))}
					</TabButtonHoverProvider>
				</div>
				<CommandList
					className={
						"overflow-hidden h-[var(--cmdk-list-height)] transition-height scroll-py-2"
					}
				>
					<motion.div
						key={activeTab}
						variants={variants}
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="h-full"
					>
						{activeTab === "courses" && (
							<CoursesCommandList
								isStarredFetching={isStarredFetching}
								isUnstarredFetching={isUnstarredFetching}
								starredCourses={starredCourses}
								unstarredCourses={unstarredCourses}
								navigate={navigate}
								handleSelect={handleSelect}
							/>
						)}
						{activeTab === "resources" && (
							<ResourcesCommandList
								courseId={selectedCourseId ?? courseId}
								navigate={navigate}
								handleSelect={handleSelect}
								query={debouncedQuery}
							/>
						)}
						{/* {activeTab === 'updates' && (
                            <UpdatesCommandList
                                courseId={selectedCourseId ?? courseId}
                                navigate={navigate}
                                handleSelect={handleSelect}
                            />
                        )} */}
						{/* {activeTab === 'resources' && (
                            <ResourcesCommandList
                                resources={resources}
                                courseId={courseId}
                                navigate={navigate}
                                isResourcesFetching={isResourcesFetching}
                                handleSelect={handleSelect}
                                navigateToResource={navigateToResource}
                            />
                        )}
                        {activeTab === 'updates' && (
                            <UpdatesCommandList
                                resources={resources}
                                courseId={courseId}
                                navigate={navigate}
                                isResourcesFetching={isResourcesFetching}
                                handleSelect={handleSelect}
                                navigateToResource={navigateToResource}
                            />
                        )} */}
					</motion.div>
				</CommandList>
			</CommandDialog>
		</>
	);
}

function UpdatesCommandList({
	courseId,
	isResourcesFetching,
	handleSelect,
	navigateToResource,
}: {
	courseId?: number;
	isResourcesFetching: boolean;
	handleSelect: (callback: () => unknown) => void;
	navigateToResource: (resource: any) => void;
}) {
	const {
		data: updates,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useGETcourseNotifications(
		{
			courseId: courseId ?? 0,
			showLightBulletins: true,
			PageIndex: 0,
			PageSize: 100,
		},
		{
			keepPreviousData: true,
		},
	);

	//flatten the array
	const allUpdates = updates?.pages.map((page) => page.EntityArray).flat();

	return (
		<>
			<CommandEmpty
				className={cn(
					isResourcesFetching ? "hidden" : "py-6 text-center text-sm",
				)}
			>
				No updates found.
			</CommandEmpty>
			{isLoading && (
				<CommandLoading>
					<div className="overflow-hidden px-1 py-2 space-y-1">
						<Skeleton className="h-4 w-10 rounded" />
						<Skeleton className="h-8 rounded-sm" />
						<Skeleton className="h-8 rounded-sm" />
					</div>
				</CommandLoading>
			)}
			{allUpdates && allUpdates.length > 0 && !isLoading && (
				<CommandGroup heading={`${allUpdates?.length} updates found`}>
					<div className="my-2 overflow-hidden pr-1 space-y-1">
						{allUpdates?.map((update) => (
							<CommandItem
								key={update.NotificationId}
								value={update.Text + " " + update.NotificationId}
								onSelect={() =>
									handleSelect(() => {
										console.log("Selected update", update);
										navigateToResource(update);
									})
								}
							>
								<span className="truncate break-all line-clamp-1">
									{update.Text}
								</span>
							</CommandItem>
						))}
					</div>
				</CommandGroup>
			)}
		</>
	);
}

function ResourcesCommandList({
	courseId,
	navigate,
	handleSelect,
	query,
}: {
	courseId?: number;
	navigate: any;
	handleSelect: (callback: () => unknown) => void;
	query: string;
}) {
	const navigateToResource = useNavigateToResource(navigate);

	const isEnabled = courseId !== undefined && query.length > 2;

	const { data: resources, isLoading } = useGETcourseResourceBySearch(
		{
			searchText: query,
			locationId: courseId ?? 0,
			locationType: ItsolutionsItslUtilsConstantsLocationType.Course,
		},
		{
			enabled: isEnabled,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
		},
	);

	const { downloadToast } = useDownloadToast();

	useEffect(() => {
		const handleDownloadShortcut = (e: KeyboardEvent) => {
			if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				const selected = document.querySelector(
					'[aria-selected="true"]',
				) as HTMLDivElement | null;
				if (selected) {
					const elementId = Number(selected.dataset.elementid);
					const resource = resources?.Resources.EntityArray.find(
						(resource) => resource.ElementId === elementId,
					);
					if (resource) {
						if (isResourceFile(resource)) {
							downloadToast(resource);
						}
					}
				}
			}
		};

		window.addEventListener("keydown", handleDownloadShortcut);

		return () => {
			window.removeEventListener("keydown", handleDownloadShortcut);
		};
	}, [resources]);

	console.log(resources);

	return (
		<>
			<CommandEmpty
				className={cn(isLoading ? "hidden" : "py-6 text-center text-sm")}
			>
				No resources found.
			</CommandEmpty>
			{isLoading && isEnabled && (
				<CommandLoading>
					<div className="overflow-hidden px-1 py-2 space-y-1">
						<Skeleton className="h-4 w-10 rounded" />
						<Skeleton className="h-8 rounded-sm" />
						<Skeleton className="h-8 rounded-sm" />
					</div>
				</CommandLoading>
			)}
			{!isEnabled && !resources && (
				<CommandEmpty className={cn("py-6 text-center text-sm")}>
					Type at least 3 characters to search.
				</CommandEmpty>
			)}
			<CommandList className="my-2 pr-1 space-y-1 min-h-full pb-3">
				{resources &&
					resources.Resources.EntityArray[0]?.CourseId === courseId && (
						<CommandGroup
							heading={`${resources?.Resources.EntityArray.length} resources found`}
						>
							<>
								{resources.Resources.EntityArray.map((resource) => (
									<CommandItem
										data-elementid={resource.ElementId}
										key={resource.ElementId}
										value={`${resource.Title} ${resource.ElementId}`}
										className="flex items-center justify-between"
										onSelect={() =>
											handleSelect(() => {
												console.log("Selected resource", resource);
												// @ts-ignore
												if (
													isSupportedResourceInApp({
														...resource,
														CourseId: courseId,
													})
												) {
													navigateToResource({
														...resource,
														CourseId: courseId,
													});
												} else {
													window.app.openExternal(resource.ContentUrl, true);
												}
											})
										}
									>
										<span className="truncate break-all max-w-xs">
											{resource.Title}
										</span>
										<div className="flex">
											{isResourceFile(resource) && (
												<Button
													className="shrink-0"
													variant={"outline"}
													size={"icon"}
													onClick={(e) => {
														e.stopPropagation();
														downloadToast(resource);
													}}
												>
													<DownloadIcon className={"w-6 h-6"} />
												</Button>
											)}
											<div className="shrink-0 ml-4 flex h-fit w-fit transform cursor-pointer justify-end rounded-full p-2 transition-all duration-200 ease-in-out bg-background/30 hover:opacity-80 hover:shadow-md active:scale-95 active:opacity-60 md:ml-6 lg:ml-8 xl:ml-10">
												<img
													loading="lazy"
													src={resource.IconUrl}
													alt={resource.Title}
													className={"w-6 h-6"}
												/>
											</div>
										</div>
									</CommandItem>
								))}
							</>
						</CommandGroup>
					)}
			</CommandList>
		</>
	);
}

function CoursesCommandList({
	isStarredFetching,
	isUnstarredFetching,
	starredCourses,
	unstarredCourses,
	navigate,
	handleSelect,
}: {
	isStarredFetching: boolean;
	isUnstarredFetching: boolean;
	starredCourses?: GETstarredCourses;
	unstarredCourses?: GETunstarredCourses;
	navigate: NavigateFunction;
	handleSelect: (callback: () => unknown) => void;
}) {
	return (
		<>
			<CommandEmpty
				className={cn(
					isStarredFetching || isUnstarredFetching
						? "hidden"
						: "py-6 text-center text-sm",
				)}
			>
				No courses found.
			</CommandEmpty>
			<CommandList className="my-2 pr-1 space-y-1">
				{isStarredFetching || isUnstarredFetching ? (
					<div className="overflow-hidden px-1 py-2 space-y-1">
						<Skeleton className="h-4 w-10 rounded" />
						<Skeleton className="h-8 rounded-sm" />
						<Skeleton className="h-8 rounded-sm" />
					</div>
				) : (
					starredCourses &&
					unstarredCourses && (
						<>
							<CommandGroup
								heading={`${starredCourses.EntityArray.length} starred courses found`}
							>
								<div className="my-2 overflow-hidden pr-1 space-y-1">
									{starredCourses.EntityArray.map((element) => (
										<CommandItem
											key={element.CourseId}
											value={element.Title}
											onSelect={() =>
												handleSelect(() => {
													console.log("Selected    course", element);
													navigate(`/courses/${element.CourseId}`);
												})
											}
										>
											<span className="truncate break-all line-clamp-1">
												{element.Title}
											</span>
										</CommandItem>
									))}
								</div>
							</CommandGroup>
							<CommandGroup
								heading={`${unstarredCourses.EntityArray.length} unstarred courses found`}
							>
								<div className="my-2 overflow-hidden pr-1 space-y-1">
									{unstarredCourses.EntityArray.map((element) => (
										<CommandItem
											key={element.CourseId}
											value={element.Title}
											onSelect={() =>
												handleSelect(() => {
													console.log("Selected course", element);
													navigate(`/courses/${element.CourseId}`);
												})
											}
										>
											<span className="truncate break-all line-clamp-1">
												{element.Title}
											</span>
										</CommandItem>
									))}
								</div>
							</CommandGroup>
						</>
					)
				)}
			</CommandList>
		</>
	);
}

export function TitlebarSearchTabButton({
	id,
	active,
	onClick,
	children,
}: {
	id: string;
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	const [hoveredTab, setIsHovered] = useTabButtonHover();

	return (
		<div className="relative flex items-center justify-center">
			<Button
				variant={"none"}
				onClick={onClick}
				size={"sm"}
				className={cn(
					"capitalize h-11 relative hover:text-white transition-all duration-200 ease-in-out",
					active ? "text-white" : "text-gray-600",
				)}
				onMouseEnter={() => setIsHovered(id)}
				onMouseLeave={() => setIsHovered(null)}
			>
				{children}
				{hoveredTab === id && (
					<motion.div
						layoutId="active-titlebar-search-tab-indicator"
						transition={{ duration: 0.2 }}
						className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"
					/>
				)}
				{active && !hoveredTab && (
					<motion.div
						layoutId="active-titlebar-search-tab-indicator"
						transition={{ duration: 0.2 }}
						className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"
					/>
				)}
			</Button>
		</div>
	);
}
