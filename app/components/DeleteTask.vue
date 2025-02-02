<script setup>
import {ref, onMounted, computed, defineProps, defineEmits, watch} from 'vue';

const { $api } = useNuxtApp();
const emit = defineEmits(['deleted']);

const props = defineProps({ task: Object });

// Buat ref lokal untuk digunakan sebagai v-model
const task = ref(props.task);

// Sinkronisasi perubahan props ke modelValue
watch(
  () => props.task, (newTask, oldTask) => {

    console.log(newTask);
    task.value = newTask;


  }
);

const snackbar = ref(false);
const message = ref('');
const dialog = ref(false);
const loading = ref(false);
const form = ref(null);


const menu = ref(false);

const deleteTask = async () => {
  const id = props.id ?? ''; 
  const { valid } = await form.value.validate();
  if (valid) {
    loading.value = true;
    $api.delete(`/api/tasks/${task.value.id}`)
    .then(response => {
        emit('deleted', '');

        loading.value = false;
        dialog.value = false;
    })
    .catch(error => {
        loading.value = false;
        dialog.value = false;

        if (error.status === 401) {
            navigateTo('/login');
        } else {
          message.value = error.message || 'Error';
          snackbar.value = true;
        }
      });
  }
};

onMounted(() => {

});
</script>

<template>
            <v-dialog
                v-model="dialog"
                max-width="600"
            >
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn
                class="text-none font-weight-regular"
                text="Delete"
                color="red"
                v-bind="activatorProps"
                ></v-btn>
            </template>

            <v-form ref="form">
                <v-card
                prepend-icon="mdi-delete"
                title="Delete Task"
                >
                <v-card-text>
                    Are you sure want to delete task with title {{ task.title }}
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Cancel"
                    variant="plain"
                    @click="dialog = false"
                    ></v-btn>

                    <v-btn
                    :loading="loading"
                    color="primary"
                    text="OK"
                    variant="tonal"
                    @click="deleteTask"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </v-form>
            </v-dialog>
</template>

