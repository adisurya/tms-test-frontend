import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('auth_token'); // Pastikan default null
  const user = ref(null);

  function setToken(newToken: string) {
    token.value = newToken;
  }

  function setUser(userData: any) {
    user.value = userData;
  }

  function logout() {
    token.value = null;
    user.value = null;
  }

  return { token, user, setToken, setUser, logout };
});
