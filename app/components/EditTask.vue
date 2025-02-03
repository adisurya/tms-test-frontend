<script setup>
import {ref, onMounted, computed, defineProps, defineEmits, watch} from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const { $api } = useNuxtApp();
const emit = defineEmits(['updated']);

const props = defineProps({ users: Array, task: Object });

// Buat ref lokal untuk digunakan sebagai v-model
const users = ref(props.users);
// Buat ref lokal untuk digunakan sebagai v-model
const task = ref(props.task);

// Sinkronisasi perubahan props ke modelValue
watch(
  [() => props.users, () => props.task], 
  ([newUsers, newTask], [oldUsers, oldTask]) => {
    users.value = newUsers;

    console.log(newTask);
    task.value = newTask;
    title.value = newTask.title;
    description.value = newTask.description;
    dueDate.value = newTask.due_date;
    status.value = newTask.status;
    assignTo.value = newTask.assign_to && newTask.assign_to.id;


  }
);

const snackbar = ref(false);
const message = ref('');
const statuses = ['pending', 'in progress', 'completed'];
const dialog = ref(false);
const loading = ref(false);
const form = ref(null);
const title = ref('');
const titleRules = ref([
  value => {
    if (value) return true;
    return 'Title is required';
  }
]);

const dueDate = ref(null);
const dueDateRules = ref([
  value => {
    if (value) return true;
    
    return 'Duedate is required';
  }
]);

const description = ref('');
const assignTo = ref(null);
const assignToRules = ref([
  value => {
    if (value) return true;
    return 'Assign To is required';
  }
]);

const status = ref(null);




const convertToLocalTime = (utcDate) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(utcDate));
};

const formattedDueDate = computed({
  get: () => (dueDate.value ? convertToLocalTime(new Date(dueDate.value).toISOString()) : ''),
  set: (val) => {
    dueDate.value = val;
  }
});

const menu = ref(false);

const updateTask = async () => {
  console.log('update ssss');
  const id = props.id ?? ''; 
  const { valid } = await form.value.validate();
  console.log('update ssssssx');
  console.log(valid);
  if (valid) {
    loading.value = true;
    $api.put(`/api/tasks/${task.value.id}`, {
      title: title.value, 
      description: description.value,
      due_date: formattedDueDate.value,
      assign_to: assignTo.value,
      status: status.value,
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    .then(response => {
        emit('updated', '');

        loading.value = false;
        dialog.value = false;
    })
    .catch(error => {
        loading.value = false;
        dialog.value = false;

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
      });
  }
};

const openDialog = async () => {
    title.value = task.value.title;
    description.value = task.value.description;
    dueDate.value = task.value.due_date;
    status.value = task.value.status;
    assignTo.value = task.value.assign_to && task.value.assign_to.id;


  dialog.value = true;
};
onMounted(() => {

});
</script>

<template>
  <span>
    <v-btn
                class="text-none font-weight-regular"
                text="Edit"
                color="primary"
                v-bind="activatorProps"
                @click="openDialog"
    ></v-btn>

    <v-dialog
                v-model="dialog"
                max-width="600"
            >
            <v-form ref="form">
                <v-card
                prepend-icon="mdi-account"
                title="Edit Task"
                >
                <v-card-text>
                    <v-row dense>
                    <v-col
                    >
                        <v-text-field
                        label="Title*"
                        v-model="title"
                        :rules="titleRules"
                        required
                        ></v-text-field>
                    </v-col>
                    </v-row>
                    <v-row dense>
                    <v-col>
                        <v-text-field
                        v-model="formattedDueDate"
                        :rules="dueDateRules"
                        label="Due Date*"
                        readonly
                        prepend-inner-icon="mdi-calendar"
                        @click="menu = !menu"
                        required
                        ></v-text-field>

                        <v-menu ref="datePickerMenu" v-model="menu" :close-on-content-click="false">
                        <v-date-picker v-model="dueDate" @update:modelValue="menu = false"></v-date-picker>
                        </v-menu>
                    </v-col>
                    </v-row>

                    <v-row dense>
                      <v-col>
                          <v-select
                            v-model="assignTo"
                            label="Assign To"
                            :items="users"
                            item-title="name"
                            item-value="id"
                            :rules="assignToRules"
                          >

                          </v-select>
                      </v-col>
                    </v-row>


                    <v-row dense>
                    <v-col>
                        <v-textarea
                        label="Description"
                        v-model="description"
                        clearable
                        ></v-textarea>
                    </v-col>
                    </v-row>

                    <v-row dense>
                      <v-col>
                          <v-select v-model="status" label="Status" :items="statuses">

                          </v-select>
                      </v-col>
                    </v-row>

                    <small class="text-caption text-medium-emphasis">*indicates required field</small>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Close"
                    variant="plain"
                    @click="dialog = false"
                    ></v-btn>

                    <v-btn
                    :loading="loading"
                    color="primary"
                    text="Save"
                    variant="tonal"
                    @click="updateTask"
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

