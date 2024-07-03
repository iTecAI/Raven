import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { LocalizationProvider } from "./util/localization";
import { ApiProvider } from "./util/api";

function App() {
    return (
        <LocalizationProvider>
            <ApiProvider>
                <MantineProvider defaultColorScheme="dark">
                    <RouterProvider router={router} />
                </MantineProvider>
            </ApiProvider>
        </LocalizationProvider>
    );
}

export default App;
