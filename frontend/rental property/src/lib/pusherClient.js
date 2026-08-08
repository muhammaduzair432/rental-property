import Pusher from 'pusher-js';

const appKey = import.meta.env.VITE_PUSHER_APP_KEY;
const cluster = import.meta.env.VITE_PUSHER_CLUSTER;

let pusherInstance = null;

if (appKey) {
  // Initialize Pusher only once
  pusherInstance = new Pusher(appKey, {
    cluster: cluster,
  });
} else {
  console.warn("Pusher app key is missing. Please restart your Vite dev server.");
}

export default pusherInstance;
