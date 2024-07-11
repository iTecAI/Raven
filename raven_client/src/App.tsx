import { MantineProvider, createTheme } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { LocalizationProvider } from "./util/localization";
import { ApiProvider } from "./util/api";
import "./style/index.scss";
import { Notifications } from "@mantine/notifications";
import { EventsProvider } from "./util/events/EventsProvider";

function App() {
    return (
        <LocalizationProvider>
            <ApiProvider>
                <EventsProvider>
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
                </EventsProvider>
            </ApiProvider>
        </LocalizationProvider>
    );
}

export default App;
