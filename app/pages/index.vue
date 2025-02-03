<script setup>
import {ref, onMounted, computed} from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

import DeleteTask from '~/components/DeleteTask.vue';

const { $api } = useNuxtApp();

const snackbar = ref(false);
const message = ref('');
const tasks = ref([]);
const users = ref([]);

const showLoadData = ref(false);

const loadData = async () => {
  showLoadData.value = true;

  try {
    console.log('indextoken: ' + authStore.token);
    const response = await $api.get('/api/tasks', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    tasks.value = response.data.data;
  } catch (error) {
    if (error.status === 401) {
        navigateTo('/login');
    } else {
      message.value = 'Login gagal, cek email & password!';
      snackbar.value = true;
    }
  } finally {
    showLoadData.value = false;
  }
};

const loadUsers = async () => {
  showLoadData.value = true;
  try {
    const response = await $api.get('/api/users', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },

    });
    users.value = response.data;
    console.log(users.value);
  } catch (error) {
    if (error.status === 401) {
        navigateTo('/login');
    } else {
      message.value = error.message || 'Error';
      snackbar.value = true;
    }
  } finally {
    showLoadData.value = false;
  }

};



onMounted(async () => {

  await loadData();
  await loadUsers();


});
</script>

<template>
  <v-container>
    <CreateTask @saved="loadData" :users="users" />
    <v-row>
      <v-col>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">
                Title
              </th>
              <th class="text-left">
                Description
              </th>
              <th class="text-left">
                Status
              </th>
              <th class="text-left">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in tasks" :key="task.id"
            >
              <td>{{ task.title }}</td>
              <td>{{  task.description }}</td>
              <td>
                <v-chip v-if="task.status === 'pending'">{{ task.status }}</v-chip>
                <v-chip color="orange" v-if="task.status === 'in progress'">{{ task.status }}</v-chip>
                <v-chip color="green" v-if="task.status === 'completed'">{{ task.status }}</v-chip>

              </td>
              <td>
                <ViewTask :taskId="task.id" />
                &nbsp;
                <EditTask :task="task" :users="users" @updated="loadData" />
                &nbsp;
                <DeleteTask :task="task" @deleted="loadData" />

              </td>

            </tr>
          </tbody>
        </v-table>
        <LoadData :show="showLoadData" />
      </v-col>
    </v-row>

  </v-container>


</template>

