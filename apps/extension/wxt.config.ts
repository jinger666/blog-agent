import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'AI Blog Assistant',
    description: 'AI-powered content enhancement for CSDN and blog platforms',
    version: '1.0.0',
    permissions: [
      'activeTab',
      'storage',
      'sidePanel',
    ],
    host_permissions: [
      'https://blog.csdn.net/*',
      'http://localhost:3000/*',
    ],
    action: {
      default_title: 'AI Blog Assistant',
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
  },
});
