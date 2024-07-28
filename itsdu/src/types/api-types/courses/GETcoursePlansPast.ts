import { apiUrl, ITSLEARNING_API_MAX_PAGESIZE } from "@/lib/utils.ts";

const GETcoursePlansPastApiEndpoint =
	"restapi/personal/course/{courseId}/plans/past/v1?PageIndex={PageIndex}&PageSize={PageSize}&ChildId={ChildId}";

export const GETcoursePlansPastApiUrl = (params: GETcoursePlansPastParams) => {
	return apiUrl(GETcoursePlansPastApiEndpoint, params);
};

export type GETcoursePlansPast = {
	entityArray: EntityArray[];
	total: number;
	currentPageIndex: number;
	pageSize: number;
};

export type GETcoursePlansPastParams = {
	courseId: number;
	PageIndex?: number;
	PageSize?: ITSLEARNING_API_MAX_PAGESIZE;
	ChildId?: number;
};

/**
 * This should be changed. But since their API isn't public, I can't know what the actual response is.
 */

interface EntityArray {
	id: number;
	isActive: boolean;
	title: string;
	url: string;
	description: string;
	displayDescription: string;
	isDescriptionPlainText: boolean;
	imageUrl: string;
	start: string;
	stop: string;
	activeFromDT: any;
	elements: ToolElement[];
	learningObjectives: any[];
	topic?: Topic;
	customFields: any;
	fields: any;
	orderNumber: number;
	orderNumberInTopic: number;
	pinned: boolean;
	classHours: number;
}

interface ToolElement {
	id: number;
	title: string;
	planPageUrl: string;
	url: string;
	type: string;
	typeName: string;
	learningToolId: number;
	isHomework: boolean;
	isActive: boolean;
	iconUrl: string;
	isResource: boolean;
	isCompleted: boolean;
	isFolder: boolean;
	doneCount: number;
	totalCount: number;
}

interface Topic {
	name: string;
	description: string;
	color: string;
	borderColor: any;
	id: number;
	url: string;
	planCount: number;
	start: any;
	stop: any;
	customFields: any;
}
