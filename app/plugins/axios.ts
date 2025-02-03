import axios from 'axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api = axios.create({
    withCredentials: true, // Izinkan mengirimkan cookies dengan request
    baseURL: config.public.apiBase, // URL API dari runtimeConfig

  });

  return {
    provide: {
      api
    }
  };
});
