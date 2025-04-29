import React from "react";
import { Box } from "@mui/material";

import HotAndNewList from "./HotAndNewList";
import FeaturedGamesList from "./FeaturedGamesList";

const TrendGamesList = () => {
  return (
    <Box sx={{ py: 3}}>
      <FeaturedGamesList />      
      <HotAndNewList />
    </Box>
  );
};

export default TrendGamesList;