import { frontendURL } from '../../../helper/URLHelper';

const OutreachDashboard = () => import('./Index.vue');

export const routes = [
  {
    path: frontendURL('accounts/:accountId/outreach'),
    name: 'outreach_dashboard_index',
    meta: {
      permissions: ['administrator', 'agent', 'custom_role'],
    },
    component: OutreachDashboard,
  },
];
