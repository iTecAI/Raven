import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { LocalizationProvider } from "./util/localization";

function App() {
    return (
        <LocalizationProvider>
            <MantineProvider defaultColorScheme="dark">
                <RouterProvider router={router} />
            </MantineProvider>
        </LocalizationProvider>
    );
}

export default App;
