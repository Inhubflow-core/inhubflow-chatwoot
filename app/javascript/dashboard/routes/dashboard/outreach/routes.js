import { frontendURL } from '../../../helper/URLHelper';

const LeadGeneration = () => import('../lead_generation/LeadGeneration.vue');
const Campaigns = () => import('../lead_generation/Campaigns.vue');
const LeadLists = () => import('../lead_generation/LeadLists.vue');

export const routes = [
  {
    path: frontendURL('accounts/:accountId/lead-generation'),
    name: 'outreach_dashboard_index',
    meta: {
      permissions: ['administrator', 'agent', 'custom_role'],
    },
    component: LeadGeneration,
  },
  {
    path: frontendURL('accounts/:accountId/campaigns-hub'),
    name: 'outreach_campaigns',
    meta: {
      permissions: ['administrator', 'agent', 'custom_role'],
    },
    component: Campaigns,
  },
  {
    path: frontendURL('accounts/:accountId/lead-lists'),
    name: 'outreach_lists',
    meta: {
      permissions: ['administrator', 'agent', 'custom_role'],
    },
    component: LeadLists,
  },
];

