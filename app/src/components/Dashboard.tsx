'use client';
import React from 'react';
import StatsCards from './dashboard/StatsCards';
import CampaignList from './dashboard/CampaignList';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <StatsCards />
        <CampaignList />
        <div>Dashboard prêt à l'emploi ! (Composants à ajouter)</div>
      </div>
    </div>
  );
};

export default Dashboard;
