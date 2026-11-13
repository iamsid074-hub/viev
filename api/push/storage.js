// In-Memory + /tmp persistent store for Push Subscriptions
const fs = require('fs');
const path = require('path');

const TMP_FILE = path.join('/tmp', 'viev_push_subscriptions.json');

function getStore() {
  if (!global.__pushSubscriptions) {
    try {
      if (fs.existsSync(TMP_FILE)) {
        const raw = fs.readFileSync(TMP_FILE, 'utf8');
        global.__pushSubscriptions = JSON.parse(raw);
      }
    } catch (_) {}
  }
  if (!global.__pushSubscriptions) {
    global.__pushSubscriptions = { digi: [], user: [] };
  }
  if (!Array.isArray(global.__pushSubscriptions.digi)) global.__pushSubscriptions.digi = [];
  if (!Array.isArray(global.__pushSubscriptions.user)) global.__pushSubscriptions.user = [];
  return global.__pushSubscriptions;
}

function saveStore(store) {
  global.__pushSubscriptions = store;
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(store), 'utf8');
  } catch (_) {}
}

function addSubscription(role, subscription) {
  if (!subscription || !subscription.endpoint) return;
  const store = getStore();
  const targetRole = (role === 'user' || role === 'virat' || role === 'honey') ? 'user' : 'digi';
  
  // Filter out existing duplicates with same endpoint
  store[targetRole] = store[targetRole].filter(s => s && s.endpoint !== subscription.endpoint);
  store[targetRole].push({
    ...subscription,
    updatedAt: Date.now()
  });

  saveStore(store);
  return store;
}

function removeSubscription(endpoint) {
  if (!endpoint) return;
  const store = getStore();
  store.digi = store.digi.filter(s => s && s.endpoint !== endpoint);
  store.user = store.user.filter(s => s && s.endpoint !== endpoint);
  saveStore(store);
}

function getSubscriptions(role) {
  const store = getStore();
  if (role === 'digi') return store.digi;
  if (role === 'user') return store.user;
  return [...store.digi, ...store.user];
}

module.exports = {
  getStore,
  addSubscription,
  removeSubscription,
  getSubscriptions
};

