<script setup>
import {ref, onMounted, computed, defineEmits, defineProps, watch} from 'vue';

const { $api } = useNuxtApp();
const emit = defineEmits(['saved']);
const props = defineProps({ users: Array });

// Buat ref lokal untuk digunakan sebagai v-model
const users = ref(props.users);

// Sinkronisasi perubahan props ke modelValue
watch(() => props.users, (newValue) => {
  users.value = newValue;
});

const snackbar = ref(false);
const message = ref('');

const createDialog = ref(false);
const createLoading = ref(false);
const createForm = ref(null);
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

const createTask = async () => {
  const { valid } = await createForm.value.validate();
  if (valid) {
    createLoading.value = true;
    try {
        const response = await $api.post('/api/tasks', {
            title: title.value, 
            description: description.value, 
            due_date: formattedDueDate.value,
            assign_to: assignTo.value,
        });
        emit('saved', '');

    } catch (error) {

        if (error.status === 401) {
            navigateTo('/login');
        } else {
            message.value = error.message || 'Error';
            snackbar.value = true;
        }

    }
    createLoading.value = false;
    createDialog.value = false;

  }
};



onMounted(() => {
});
</script>

<template>
    <v-row>
        <v-col>
            <v-dialog
                v-model="createDialog"
                max-width="600"
            >
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn
                class="text-none font-weight-regular"
                prepend-icon="mdi-account"
                text="Create Task"
                variant="tonal"
                v-bind="activatorProps"
                ></v-btn>
            </template>

            <v-form ref="createForm">
                <v-card
                prepend-icon="mdi-account"
                title="Create Task"
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
                        <v-select v-model="assignTo" label="Assign To" :items="users" item-title="name" item-value="id">

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

                    <small class="text-caption text-medium-emphasis">*indicates required field</small>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Close"
                    variant="plain"
                    @click="createDialog = false"
                    ></v-btn>

                    <v-btn
                    :loading="createLoading"
                    color="primary"
                    text="Save"
                    variant="tonal"
                    @click="createTask"
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

        </v-col>
    </v-row>
</template>

