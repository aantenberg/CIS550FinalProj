import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import Header from "./components/Header";
import RootPage from "./pages/RootPage";
import AnalysisHomePage from "./pages/AnalysisHomePage"
import AnalysisPage, { analysisLoader } from "./pages/AnalysisPage";
import RankingsPage, { rankingsLoader } from "./pages/RankingsPage";
import RankingsHomePage from "./pages/RankingsHomePage";

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootPage />,
        errorElement: null,
        children: [
            {
                path: '/',
                element: <SearchPage />,
            },
            {
                path: '/analyze/home',
                element: <AnalysisHomePage />
            },
            {
                path: '/analyze',
                element: <AnalysisPage />,
                loader: analysisLoader
            },
            {
                path: '/state-rankings/home',
                element: <RankingsHomePage />,
            },
            {
                path: '/state-rankings',
                element: <RankingsPage />,
                loader: rankingsLoader
            }
        


        ]
    }
])

export default function App() {
    return (
        <RouterProvider router={router} />
    );
}