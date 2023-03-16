import { Box, Toolbar } from "@mui/material";
import TopBar from "./TopBar";
import SideNavBar from "./SideNavBar";
import AppRoutes from "../AppRoutes";

function AppContainer() {
  return (
    <Box sx={{ display: "flex" }}>
      <TopBar />
      <SideNavBar />
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <Toolbar />
        <AppRoutes />
      </Box>
    </Box>
  );
}

export default AppContainer;