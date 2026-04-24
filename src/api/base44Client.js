import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId: "69dd9ffccab4dd693d4d92f5",
  token,
  functionsVersion,
  requiresAuth: false,
  appBaseUrl
});
