<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from '#app'; // Nuxt Auto-import

const authStore = useAuthStore();

const { $api } = useNuxtApp();

const drawer = ref(false);
const group = ref(null);
const snackbar = ref(false);
const message = ref('');
const totalAssignToMe = ref(0);
const loading = ref(false);

const route = useRoute();

const getTotalAssignToMe = async () => {
  console.log('total assgin to me called.............');
  if (route.path !== '/login' && route.path !== '/register') {
    try {
      const response = await $api.get('/api/tasks/total-assign-to-me', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },

      });
      totalAssignToMe.value = response.data.total;
    } catch (error) {
        message.value = error.message;
        snackbar.value = true;
    }

  }

  setTimeout(() => {
    getTotalAssignToMe();
  }, 30000);

};

getTotalAssignToMe();

const logout = () => {
  loading.value = true;
  $api.post('/api/logout', {}, {
    headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
  })
    .then(response => {
      loading.value = false;

      navigateTo('/login');
    })
    .catch(error => {
      loading.value = false;
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
      <v-app-bar color="primary">
          <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
  
          <v-toolbar-title>Task Management System</v-toolbar-title>
  
          <v-spacer></v-spacer>
  
        </v-app-bar>
  
        <v-navigation-drawer
          v-model="drawer"
          :location="$vuetify.display.mobile ? 'bottom' : undefined"
          temporary
        >
          <v-list>
            <v-list-item to="/">
              <v-list-item-title>My Task</v-list-item-title>
            </v-list-item>
            <v-list-item to="/TaskAssignToMe">
              <v-list-item-title>Task Assign To Me</v-list-item-title>
            <template v-slot:append>
              <v-badge
                color="info"
                :content="totalAssignToMe"
                inline
              ></v-badge>
            </template>

            </v-list-item>
          </v-list>

          <template v-slot:append>
            <v-list-item class="mt-auto">
              <v-btn :loading="loading" @click="logout" block color="error">
                <v-icon start>mdi-logout</v-icon> Logout
              </v-btn>
            </v-list-item>
          </template>
        </v-navigation-drawer>
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
