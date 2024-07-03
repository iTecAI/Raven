import { MantineProvider, createTheme } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { LocalizationProvider } from "./util/localization";
import { ApiProvider } from "./util/api";
import "./style/index.scss";
import { Notifications } from "@mantine/notifications";

function App() {
    return (
        <LocalizationProvider>
            <ApiProvider>
                <MantineProvider
                    defaultColorScheme="dark"
                    theme={createTheme({
                        colors: {
                            primary: [
                                "#f2f0ff",
                                "#e0dff2",
                                "#bfbdde",
                                "#9b98ca",
                                "#7d79ba",
                                "#6a65b0",
                                "#605bac",
                                "#504c97",
                                "#464388",
                                "#3b3979",
                            ],
                        },
                        primaryColor: "primary",
                        primaryShade: 7,
                    })}
                >
                    <Notifications />
                    <RouterProvider router={router} />
                </MantineProvider>
            </ApiProvider>
        </LocalizationProvider>
    );
}

export default App;
