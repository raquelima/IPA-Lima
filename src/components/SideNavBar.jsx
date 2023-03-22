import { Drawer, Toolbar, Typography, Divider } from "@mui/material";
import { DRAWERWIDTH } from "../Constants";
import { THEMECOLOR } from "../Constants";
import SideNavBarList from "./SideNavBarList";
import logo from "../assets/adobe.png";

function SideNavBar() {
  return (
    <Drawer
      sx={{
        width: DRAWERWIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWERWIDTH,
          boxSizing: "border-box",
          backgroundColor: THEMECOLOR,
          color: "white",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar
        variant="dense"
        sx={{
          minHeight: 44,
        }}
      >
        <img src={logo} width={23} height={20} />
        <Divider
          orientation="vertical"
          sx={{ backgroundColor: "white", mx: 1, height: "18px" }}
        />
        <Typography variant="h6">ParkIt</Typography>
      </Toolbar>
      <Divider />
      <SideNavBarList />
    </Drawer>
  );
}

export default SideNavBar;
