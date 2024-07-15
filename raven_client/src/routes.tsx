import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./views/Layout/Layout";
import { AuthView } from "./views/auth/AuthView";
import { ResourceView } from "./views/resources/ResourceView";
import { PipelineView } from "./views/pipelines/PipelineRoot";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <></>,
            },
            {
                path: "/admin",
                element: <></>,
            },
            {
                path: "/resources",
                element: <ResourceView />,
            },
            {
                path: "/pipelines",
                element: <PipelineView />,
            },
        ],
    },
    {
        path: "/auth/login",
        element: <AuthView mode="login" />,
    },
    {
        path: "/auth/create",
        element: <AuthView mode="create" />,
    },
]);
