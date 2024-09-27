import {
    ItslearningRestApiEntitiesInstantMessageParticipant
} from "@/types/api-types/utils/Itslearning.RestApi.Entities.InstantMessageParticipant.ts";

export type ItslearningRestApiEntitiesInstantMessage = {
    MessageId: number
    MessageThreadId: number
    InstantMessageThreadId: number
    MessageThreadParticipants: ItslearningRestApiEntitiesInstantMessageParticipant[]
    Created: Date
    CreatedFormatted: string
    CreatedRelative: string
    EditedRelative: string
    CreatedBy: number
    CreatedByName: string
    HomeOrganization: string
    CreatedByAvatar: string
    Text: string
    AttachmentUrl: string
    AttachmentName: string
    Link: string
    LinkTitle: string
    LinkTarget: string
    IsSystemMessage: boolean
    IsDeleted: boolean
    DeletedBy: number
    CanDelete: boolean
    IsEdited: boolean
    CanEdit: boolean
    IsStarred: boolean
    IsSilent: boolean
    IsAbuse: boolean
    HasShared: boolean
    HasRepliedTo: boolean
    HasAbuseReported: boolean
    HasAbuseThreadReported: boolean
    OriginInstantMessage: ItslearningRestApiEntitiesInstantMessage
    OriginInstantMessageThreadId: number
    OriginInstantMessageThreadDeletedBy: number
    OriginInstantMessageThreadName: string
    ChildMessage: ItslearningRestApiEntitiesInstantMessage
    AdditionalHeading: string
    IsBroadcastMassMessage: boolean
    IsChildMessageDeletedPermanently: boolean
    CreatedLocal: Date
    CreatedLocalTimeStamp: string
    CreatedLocalDateStamp: string
    CreatedByShortName: string
    CreatedLocalShortNumericDate: string

}