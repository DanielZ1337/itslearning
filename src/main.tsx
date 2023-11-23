import { getAccessToken } from "@/lib/utils.ts";
import ReactDOM from 'react-dom/client';
import '@/index.css';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Providers from "@/components/providers.tsx";
import axios from "axios";

import ErrorPage from "@/error-page.tsx";
import Profile from "@/routes/profile.tsx";
import Index from "@/routes/index.tsx";
import Calendar from "@/routes/calendar.tsx";
import SuspenseWrapper from "@/components/suspense-wrapper.tsx";
import Messages from "@/components/messages/messages.tsx";
import CourseLayout from "@/components/course/layout/course-layout.tsx";
import CourseIndex from "@/routes/course/course-index.tsx";
import CourseParticipants from "@/routes/course/course-participants.tsx";
import CourseInformation from "@/routes/course/course-information.tsx";
import CourseResources from "@/routes/course/course-resources";
import CourseRootResources from "@/routes/course/course-root-resources";
import CourseTasks from "@/routes/course/course-tasks.tsx";
import PersonIndex from "@/routes/person/person-index.tsx";
import CoursesIndex from "@/routes/courses.tsx";
import CourseError from "./routes/course/course-error";
import Layout from "./components/layout";
import { GETunreadInstantMessagesCountApiUrl } from "./types/api-types/messages/GETunreadInstantMessagesCount";
import NotificationUpdates from "./routes/notifications/notification-updates";
import CourseAnnouncements from "./routes/course/course-announcements";
import NotificationID from "./routes/notifications/notification-id";
import Documents from "./routes/documents";
import CourseAnnouncementError from "./routes/course/errors-pages/course-announcement-error";
import CourseSchedule from "./routes/course/course-schedule";

const router = createHashRouter([
    {
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <Index />,
                errorElement: <ErrorPage />,
                index: true,
            },
            {
                path: "/person/:id",
                element: <SuspenseWrapper><PersonIndex /></SuspenseWrapper>,
                errorElement: <ErrorPage />,
            },
            {
                path: "/courses",
                element: <SuspenseWrapper><CoursesIndex /></SuspenseWrapper>,
                errorElement: <ErrorPage />,
            },
            {
                path: "/updates",
                errorElement: <ErrorPage />,
                children: [
                    {
                        element: <SuspenseWrapper><NotificationUpdates /></SuspenseWrapper>,
                        errorElement: <ErrorPage />,
                        index: true,
                    },
                    {
                        path: ":notificationId",
                        element: <SuspenseWrapper><NotificationID /></SuspenseWrapper>,
                        errorElement: <ErrorPage />,
                    }
                ]
            },
            {
                path: "/calendar",
                element: <SuspenseWrapper><Calendar /></SuspenseWrapper>,
                errorElement: <ErrorPage />,
            },
            {
                path: "/courses/:id",
                element: <SuspenseWrapper><CourseLayout /></SuspenseWrapper>,
                errorElement: <CourseError />,
                children: [
                    {
                        element: <SuspenseWrapper><CourseIndex /></SuspenseWrapper>,
                        index: true,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "resources",
                        errorElement: <ErrorPage />,
                        children: [
                            {
                                element: <SuspenseWrapper><CourseRootResources /></SuspenseWrapper>,
                                errorElement: <ErrorPage />,
                                index: true,
                            },
                            {
                                path: ":folderId",
                                element: <SuspenseWrapper><CourseResources /></SuspenseWrapper>,
                                errorElement: <ErrorPage />,
                            },
                        ]
                    },
                    {
                        path: "schedule",
                        element: <SuspenseWrapper><CourseSchedule /></SuspenseWrapper>,
                        errorElement: <ErrorPage />,
                    },
                    {
                        path: "announcements",
                        element: <SuspenseWrapper><CourseAnnouncements /></SuspenseWrapper>,
                        errorElement: <CourseAnnouncementError />,
                    },
                    {
                        path: "course-information",
                        element: <SuspenseWrapper><CourseInformation /></SuspenseWrapper>,
                    },
                    {
                        path: "tasks",
                        element: <SuspenseWrapper><CourseTasks /></SuspenseWrapper>,
                    },
                    {
                        path: "participants",
                        element: <SuspenseWrapper>
                            <CourseParticipants />
                        </SuspenseWrapper>,
                    },
                    {
                        path: "*",
                        element: <ErrorPage />,
                        errorElement: <ErrorPage />,
                    }
                ],
            },
            {
                path: "/documents/:elementId",
                element: <Documents />,
                errorElement: <ErrorPage />,
            },
            {
                path: "/profile",
                element: <SuspenseWrapper><Profile /></SuspenseWrapper>,
                errorElement: <ErrorPage />,
            },
            {
                path: "/messages/:id?",
                element: <SuspenseWrapper><Messages /></SuspenseWrapper>,
                errorElement: <ErrorPage />,
            },
            {
                path: "*",
                element: <ErrorPage />,
                errorElement: <ErrorPage />,
            }
        ]
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Providers>
        <SuspenseWrapper max>
            {/* <React.StrictMode> */}
            <RouterProvider fallbackElement={<ErrorPage />} future={{
                v7_startTransition: true,
            }} router={router} />
            {/* <ReactQueryDevtools position="left" /> */}
            {/* </React.StrictMode> */}
        </SuspenseWrapper>
    </Providers>
)

// unread messages notification system
type UnreadMessages = {
    count: number
    timestamp: number
}
const unreadMessages: UnreadMessages[] = [
    {
        count: 0,
        timestamp: Date.now()
    }
]
setInterval(async () => {
    const access_token = await getAccessToken()
    axios.get(GETunreadInstantMessagesCountApiUrl(), {
        params: {
            'access_token': access_token
        }
    }).then((res: {
        data: number;
    }) => {
        unreadMessages.push({
            count: res.data,
            timestamp: Date.now()
        })

        if (unreadMessages.length > 10) {
            unreadMessages.shift()
        }

        // check if there are any unread messages based on the timestamps and the count
        if (unreadMessages[unreadMessages.length - 1].count > 0 && unreadMessages[unreadMessages.length - 1].timestamp - unreadMessages[0].timestamp < 1000 * 60 * 5) {
            if (unreadMessages[unreadMessages.length - 1].count !== unreadMessages[unreadMessages.length - 2].count) {
                new Notification('itslearning', {
                    body: `You have ${unreadMessages[unreadMessages.length - 1].count} unread message${unreadMessages[unreadMessages.length - 1].count > 1 ? 's' : ''}`,
                    icon: 'itsl-itslearning-file://icon.ico'
                })

            }
        }
    }).catch((err: any) => {
        console.log(err)
    })
}, 1000 * 15) // 15 seconds

// Remove Preload scripts loading
postMessage({ payload: 'removeLoading' }, '*')

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
})
