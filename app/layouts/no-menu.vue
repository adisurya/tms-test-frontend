<script setup>
import { ref } from 'vue';
const { $api } = useNuxtApp();

const drawer = ref(false);
const group = ref(null);
const snackbar = ref(false);
const message = ref('');

const logout = () => {
  $api.post('/api/logout').then(response => {
      navigateTo('/login');
    })
    .catch(error => {
      if (error.status === 401) {
        navigateTo('/login');
      } else {
        message.value = error.message || 'Error';
        snackbar.value = true;
      }
    });

};
</script>

<template>
  <v-app>
    <v-layout>
      <v-main>
        <slot />

      </v-main>
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

      <AppFooter />

    </v-layout>
  </v-app>
</template>
