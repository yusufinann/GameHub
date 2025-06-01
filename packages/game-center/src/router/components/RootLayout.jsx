import React from "react";
import { Outlet, useNavigation } from "react-router-dom";
import LoadingFallback from "./LoadingFallback";

const RootLayout = () => {
  const navigation = useNavigation();

  return (
    <>
      {navigation.state === "loading" && <LoadingFallback />}
      <Outlet />
    </>
  );
};

export default RootLayout;