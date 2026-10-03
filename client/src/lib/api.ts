// Base URL for the API. Set VITE_API_URL in client/.env; defaults to the local server.
export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
