import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import Header from "./components/Header";
import AllRestaurantsPage, { allRestaurantsLoader } from "./pages/AllRestaurantsPage";
import RootPage from "./pages/RootPage";
import AnalysisHomePage from "./pages/AnalysisHomePage"
import AnalysisPage, { analysisLoader } from "./pages/AnalysisPage";
import ClosestRestaurantsPage, {closestRestaurantsLoader} from "./pages/ClosestRestaurantsPage"

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootPage />,
        errorElement: null,
        children: [
            {
                path: '/search',
                element: <SearchPage />,
            },
            {
                path: '/search/all',
                element: <AllRestaurantsPage />,
                loader: allRestaurantsLoader
            },
            {
                path: '/search/closest',
                element: <ClosestRestaurantsPage />,
                loader: closestRestaurantsLoader
            },
            {
                path: '/analyze/home',
                element: <AnalysisHomePage />
            },
            {
                path: '/analyze',
                element: <AnalysisPage />,
                loader: analysisLoader
            }

        ]
    }
])

export default function App() {
    return (
        <RouterProvider router={router} />
    );
}