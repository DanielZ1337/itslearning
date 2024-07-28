import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { getAccessToken, getQueryKeysFromParamsObject } from "@/lib/utils.ts";
import {
	GETunstarredCourses,
	GETunstarredCoursesApiUrl,
	GETunstarredCoursesParams,
} from "@/types/api-types/course-cards/GETunstarredCourses.ts";
import { TanstackKeys } from "@/types/tanstack-keys";

export default function useGETunstarredCourses(
	params: GETunstarredCoursesParams,
	queryConfig?: UseQueryOptions<
		GETunstarredCourses,
		Error,
		GETunstarredCourses,
		string[]
	>,
) {
	return useQuery({
		queryKey: [
			TanstackKeys.UnstarredCourses,
			...getQueryKeysFromParamsObject(params),
		],
		queryFn: async () => {
			const res = await axios.get(
				GETunstarredCoursesApiUrl({
					...params,
				}),
				{
					params: {
						access_token: (await getAccessToken()) || "",
						...params,
					},
				},
			);

			if (res.status !== 200) throw new Error(res.statusText);

			return res.data;
		},
		...queryConfig,
	});
}
