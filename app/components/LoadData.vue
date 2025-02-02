<script setup>
import { defineProps, ref, watch } from 'vue';

// Ambil props dari parent
const props = defineProps({ show: String });

// Buat ref lokal untuk digunakan sebagai v-model
const modelValue = ref(props.show);

// Sinkronisasi perubahan props ke modelValue
watch(() => props.show, (newValue) => {
  modelValue.value = newValue;
});
</script>

<template>
    <v-dialog
        v-model="modelValue"
        max-width="320"
        persistent
        >
        <v-list
            class="py-2"
            color="primary"
            elevation="12"
            rounded="lg"
        >
            <v-list-item
            prepend-icon="$vuetify-outline"
            title="Loading..."
            >
            <template v-slot:prepend>
                <div class="pe-4">
                <v-icon color="primary" size="x-large"></v-icon>
                </div>
            </template>

            <template v-slot:append>
                <v-progress-circular
                color="primary"
                indeterminate="disable-shrink"
                size="16"
                width="2"
                ></v-progress-circular>
            </template>
            </v-list-item>
        </v-list>
    </v-dialog>
</template>