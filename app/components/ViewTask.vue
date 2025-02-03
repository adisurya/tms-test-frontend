<script setup>
import {ref, onMounted, computed, defineProps, watch} from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const { $api } = useNuxtApp();

const props = defineProps({ taskId: String });

// Buat ref lokal untuk digunakan sebagai v-model
const taskId = ref(props.taskId);
const task = ref({});
const logs = ref([]);

// Sinkronisasi perubahan props ke modelValue
watch(() => props.taskId, (newId,  oldId) => {
  console.log(newId);
    taskId.value = newId;
  }
);

const snackbar = ref(false);
const message = ref('');
const dialog = ref(false);
const loading = ref(false);
const form = ref(null);






const getTask = async () => {
  const id = taskId.value ?? ''; 

  loading.value = true;
  try {
    const response = await $api.get(`/api/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    task.value = response.data.task;
    logs.value = response.data.logs || [];
    console.log(task.value);
  } catch (error) {
    if (error.status === 401) {
        navigateTo('/login');
    } else {
      let err = error.message;
      if (error && error.response && error.response.data) {
        err = error.response.data.message;
      }
      message.value = err || 'Error';
      snackbar.value = true;
    }
  }
  loading.value = false;
};

const openDialog = async () => {
  await getTask();

  dialog.value = true;
};
onMounted(() => {

});

const convertToLocalTime = (utcDate) => {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(utcDate));
};
</script>

<template>
  <span>
    <v-btn
                class="text-none font-weight-regular"
                text="View"
                color="orange"
                :loading="loading"
                @click="openDialog"
    ></v-btn>

    <v-dialog
                v-model="dialog"
                max-width="800"
            >
            <v-form ref="form">
                <v-card
                prepend-icon="mdi-account"
                title="View Task"
                >
                <v-card-text>
                  <v-table>
                    <thead>
                      <tr>
                        <th colspan="3">Task</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Title</td>
                        <td>:</td>
                        <td>{{ task.title }}</td>
                      </tr>
                      <tr>
                        <td>Description</td>
                        <td>:</td>
                        <td>{{ task.description }}</td>
                      </tr>
                      <tr>
                        <td>Assign To</td>
                        <td>:</td>
                        <td>
                          {{ (task.assign_to && task.assign_to.name) ? task.assign_to.name : '' }}
                        </td>
                      </tr>

                      <tr>
                        <td>Duedate</td>
                        <td>:</td>
                        <td>{{ (task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '') }}</td>
                      </tr>
                      <tr>
                        <td>Status</td>
                        <td>:</td>
                        <td>
                          <v-chip v-if="task.status === 'pending'">{{ task.status }}</v-chip>
                          <v-chip color="orange" v-if="task.status === 'in progress'">{{ task.status }}</v-chip>
                          <v-chip color="green" v-if="task.status === 'completed'">{{ task.status }}</v-chip>
                        </td>
                      </tr>

                    </tbody>
                  </v-table>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-text>
                  <v-table>
                    <thead>
                      <tr>
                        <th colspan="4">Logs</th>
                      </tr>
                      <tr>
                        <th>Event</th>
                        <th>User</th>
                        <th>Datetime</th>
                        <th>Data</th>

                      </tr>

                    </thead>
                    <tbody>
                      <tr
                        v-for="log in logs" :key="log.id"
                      >
                        <td>{{ log.event }}</td>
                        <td>{{ log.user ? log.user.name: '' }}</td>
                        <td>{{ convertToLocalTime(new Date(log.created_at).toISOString()) }}</td>
                        <td><v-code>{{ JSON.stringify(log.new_values, null, 2) }}</v-code></td>
                      </tr>

                    </tbody>
                  </v-table>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Close"
                    variant="plain"
                    @click="dialog = false"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </v-form>
            </v-dialog>


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
  </span>
</template>

