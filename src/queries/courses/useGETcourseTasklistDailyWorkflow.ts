import { useInfiniteQuery, UseInfiniteQueryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { getAccessToken, getQueryKeysFromParamsObject } from "@/lib/utils.ts";
import {
    GETcourseTasklistDailyWorkflow,
    GETcourseTasklistDailyWorkflowApiUrl,
    GETcourseTasklistDailyWorkflowParams
} from "@/types/api-types/courses/GETcourseTasklistDailyWorkflow.ts";
import { TanstackKeys } from "@/types/tanstack-keys";

export default function useGETcourseTasklistDailyWorkflow(params: GETcourseTasklistDailyWorkflowParams, queryConfig?: UseInfiniteQueryOptions<GETcourseTasklistDailyWorkflow, Error, GETcourseTasklistDailyWorkflow, GETcourseTasklistDailyWorkflow, string[]>) {

    return useInfiniteQuery([TanstackKeys.CourseTasklistDailyWorkflow, ...getQueryKeysFromParamsObject(params)], async ({ pageParam = params.PageIndex || 0 }) => {
        await new Promise(resolve => setTimeout(resolve, 3000))
        const res = await axios.get(GETcourseTasklistDailyWorkflowApiUrl({
            ...params,
            PageIndex: pageParam
        }), {
            params: {
                "access_token": await getAccessToken() || '',
                ...params,
            }
        });

        if (res.status !== 200) throw new Error(res.statusText);

        return res.data;
    }, {
        ...queryConfig,
        getNextPageParam: (lastPage) => {
            if (lastPage.CurrentPageIndex * lastPage.PageSize < lastPage.Total) {
                return lastPage.CurrentPageIndex + 1;
            } else {
                return undefined;
            }
        },
        getPreviousPageParam: (firstPage) => {
            if (firstPage.CurrentPageIndex > 0) {
                return firstPage.CurrentPageIndex - 1;
            } else {
                return undefined;
            }
        }
    })
}