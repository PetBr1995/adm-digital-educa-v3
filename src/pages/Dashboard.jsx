// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import UsersDashboard from "../components/dashboard/UsersDashboard";
import ContentDashboard from "../components/dashboard/ContentDashboard";

const Dashboard = () => {
  return (
    <>
      <UsersDashboard />
      <ContentDashboard/>
    </>
  );
};

export default Dashboard;
