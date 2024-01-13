import React, { Suspense } from 'react'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
import { useNavigate } from 'react-router-dom'
import { courseNavLinks } from '@/lib/routes'
import useGETcourseRootResources from '@/queries/courses/useGETcourseRootResources'
import useGETcourseFolderResources from '@/queries/courses/useGETcourseFolderResources'
import { useNavigateToResource } from '@/types/api-types/extra/learning-tool-id-types'

const filteredCourseNavLinks = courseNavLinks.filter((route) => route.end === false)

export default function CourseCardContextMenu({ courseId, children }: { courseId: number, children: React.ReactNode }) {

    const navigate = useNavigate()

    const handleItemClick = (route?: string) => {
        navigate(`/courses/${courseId}/${route}`)
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                {filteredCourseNavLinks.map((route) => {
                    if (route.title === "Resources") {
                        return (
                            <ContextMenuSub key={route.title}>
                                <ContextMenuSubTrigger onClick={() => handleItemClick(route.title)}>{route.title}</ContextMenuSubTrigger>
                                <Suspense fallback={null}>
                                    <RootFolderResources courseId={courseId} />
                                </Suspense>
                            </ContextMenuSub>
                        )
                    } else {
                        return <ContextMenuItem key={route.title} onClick={() => handleItemClick(route.title)}>{route.title}</ContextMenuItem>
                    }
                })}
            </ContextMenuContent>
        </ContextMenu>
    )
}

function RootFolderResources({ courseId }: { courseId: number }) {

    const navigate = useNavigate()

    const navigatetoResource = useNavigateToResource(navigate)

    const { data } = useGETcourseRootResources({
        courseId: courseId
    }, {
        suspense: true,
    })


    if (data?.Resources.EntityArray.length === 0) {
        return <EmptyFolder />
    }

    return (
        <ContextMenuSubContent className="max-w-64 w-fit max-h-64 overflow-y-auto overflow-x-hidden text-ellipsis">
            {data?.Resources.EntityArray.map((parent) => {
                if (parent.ElementType === "Folder") {
                    return (
                        <ContextMenuSub key={parent.ElementId}>
                            <ContextMenuSubTrigger onClick={() => navigatetoResource(parent)}>{parent.Title}</ContextMenuSubTrigger>
                            <Suspense fallback={null}>
                                <FolderResources courseId={courseId} folderId={parent.ElementId} />
                            </Suspense>
                        </ContextMenuSub>
                    )
                } else {
                    return <ContextMenuItem key={parent.ElementId} onClick={() => navigatetoResource(parent)}>{parent.Title}</ContextMenuItem>
                }
            })}
        </ContextMenuSubContent>
    )
}

function FolderResources({ courseId, folderId }: { courseId: number, folderId: number }) {

    const navigate = useNavigate()

    const navigatetoResource = useNavigateToResource(navigate)

    const { data } = useGETcourseFolderResources({
        courseId,
        folderId
    }, {
        suspense: true,
    })


    if (data?.Resources.EntityArray.length === 0) {
        return <EmptyFolder />
    }

    return (
        <ContextMenuSubContent className="max-w-64 w-fit max-h-64 overflow-y-auto overflow-x-hidden text-ellipsis">
            {data?.Resources.EntityArray.map((parent) => {
                if (parent.ElementType === "Folder") {
                    return (
                        <ContextMenuSub key={parent.ElementId}>
                            <ContextMenuSubTrigger onClick={() => navigatetoResource(parent)}>{parent.Title}</ContextMenuSubTrigger>
                            <Suspense fallback={null}>
                                <FolderResources courseId={courseId} folderId={parent.ElementId} />
                            </Suspense>
                        </ContextMenuSub>
                    )
                } else {
                    return <ContextMenuItem onClick={() => navigatetoResource(parent)} key={parent.ElementId}>{parent.Title}</ContextMenuItem>
                }
            })}
        </ContextMenuSubContent>
    )
}

function EmptyFolder() {
    return (
        <ContextMenuSubContent className="max-w-64 w-fit max-h-64 overflow-y-auto overflow-x-hidden text-ellipsis">
            <ContextMenuSub>
                <ContextMenuSubTrigger disabled className='dark:text-gray-300 text-gray-700' chevron={false}>No resources found</ContextMenuSubTrigger>
            </ContextMenuSub>
        </ContextMenuSubContent>
    )
}