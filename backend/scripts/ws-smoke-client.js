/* eslint-disable no-console */
const { io } = require('socket.io-client');

const serverUrl = process.env.BACKEND_WS_URL || 'http://localhost:3000';
const socket = io(serverUrl, {
  transports: ['websocket']
});

console.log(`[ws-smoke] Connecting to ${serverUrl}`);

socket.on('connect', () => {
  console.log(`[ws-smoke] Connected with id=${socket.id}`);
});

socket.on('disconnect', (reason) => {
  console.log(`[ws-smoke] Disconnected: ${reason}`);
});

socket.on('connect_error', (error) => {
  console.error('[ws-smoke] Connection error:', error.message);
});

socket.on('upstream.status', (payload) => {
  console.log('[upstream.status]', payload);
});

socket.on('rates.bootstrap', (payload) => {
  console.log('[rates.bootstrap]', payload);
});

socket.on('rate.update', (payload) => {
  console.log('[rate.update]', payload);
});
