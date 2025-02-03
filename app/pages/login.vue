<script lang="ts" setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const { $api } = useNuxtApp();

definePageMeta({ layout: "no-menu" });

const email = ref('');
const password = ref('');
const snackbar = ref(false);
const message = ref('');
const loading = ref(false);

const login = () => {
  loading.value = true;
    // Login...
    $api.post('/api/login', { email: email.value, password: password.value }).then(response => {
      console.log(response.data.data.access_token);
      authStore.setToken(response.data.data.access_token);
      loading.value = false;
      navigateTo('/');
    })
    .catch(error => {
      console.log(error);
      loading.value = false;
      message.value = 'Login gagal, cek email & password!';
      snackbar.value = true;
    });
};
</script>

<template>
    <v-container class="d-flex justify-center align-center" style="height: 100vh">
      <v-card width="400" class="pa-5">
        <v-card-title class="text-center text-h5">Login</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="login">
            <v-text-field v-model="email" label="Email" type="email" required />
            <v-text-field v-model="password" label="Password" type="password" required />
            <v-btn :loading="loading" type="submit" color="primary" block class="mt-3">Login</v-btn>
            <v-btn to="/register" block class="mt-3">Register</v-btn>

          </v-form>
        </v-card-text>
      </v-card>
        <v-snackbar
        v-model="snackbar"
        multi-line
        >
        {{ message }}

        <template v-slot:actions>
            <v-btn
            color="red"
            variant="text"
            @click="snackbar = false"
            >
            Close
            </v-btn>
        </template>
        </v-snackbar>
    </v-container>
</template>