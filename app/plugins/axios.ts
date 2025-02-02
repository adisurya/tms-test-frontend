import axios from 'axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api = axios.create({
    baseURL: config.public.apiBase, // URL API dari runtimeConfig
    withCredentials: true, // Izinkan mengirimkan cookies dengan request
    withXSRFToken: true,
  });

  return {
    provide: {
      api
    }
  };
});
