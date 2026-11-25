// Token Launch Radar — entrypoint for make.fun bounty token-radar-01
// Dashboard web: token launch radar with DefiLlama snapshot, pre-token filter,
// implied-value ranking, board/detail/filtered views, and farm steps.

const DASHBOARD_URL = './index.html';

// Expose for bundle/reproduce checks
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { dashboard: DASHBOARD_URL };
}

console.log('Token Launch Radar entrypoint loaded');
