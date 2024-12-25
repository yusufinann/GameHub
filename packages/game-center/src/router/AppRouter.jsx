import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainContainer from "../pages/MainContainer";
import MainScreen from "../pages/MainScreen";
import SettingsPage from "../pages/SettingsPage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Main Container Routes */}
        <Route path="/" element={<MainContainer />}>
          <Route index element={<MainScreen />} /> {/* Default middle */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
