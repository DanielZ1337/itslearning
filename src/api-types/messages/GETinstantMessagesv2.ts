import {
    ItslearningRestApiEntitiesInstantMessageThread
} from "@/api-types/utils/Itslearning.RestApi.Entities.InstantMessageThread.ts";
import {apiUrl} from "@/lib/utils.ts";

const GETinstantMessagesv2ApiEndpoint = "restapi/personal/instantmessages/messagethreads/v2?maxThreadCount={maxThreadCount}&threadPage={threadPage}&maxMessages={maxMessages}"

export const GETinstantMessagesv2ApiUrl = (params: GETinstantMessagesv2Params) => {
    return apiUrl(GETinstantMessagesv2ApiEndpoint, {
        maxThreadCount: params.maxThreadCount,
        threadPage: params.threadPage,
        maxMessages: params.maxMessages
    })
}

export type GETinstantMessagesv2 = {
    EntityArray: ItslearningRestApiEntitiesInstantMessageThread[]
    Total: number
    CurrentPageIndex: number
    PageSize: number
}

export type GETinstantMessagesv2Params = {
    maxThreadCount?: number
    threadPage?: number
    maxMessages?: number
}