<script setup>
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useInventoryStore, useAlertStore } from '@/stores';
import { router } from '@/router';

const inventoryStore = useInventoryStore();
const alertStore = useAlertStore();
const route = useRoute();
const id = route.params.id;

let title = 'Add Item';
let item = null;
if (id) {
    title = 'Edit Item';
    ({ item } = storeToRefs(inventoryStore.getById(id)));
}

const schema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required'),
    description: Yup.string()
        .required('Description is required'),
    quantity: Yup.number()
        .required('Quantity is required')
        .min(0, 'Quantity must be positive'),
    price: Yup.number()
        .required('Price is required')
        .min(0, 'Price must be positive')
});

async function onSubmit(values) {
    try {
        let message;
        if (item) {
            await inventoryStore.update(item.value.id, values);
            message = 'Item updated';
        } else {
            await inventoryStore.create(values);
            message = 'Item added';
        }
        await router.push('/inventory');
        alertStore.success(message);
    } catch (error) {
        alertStore.error(error);
    }
}
</script>

<template>
    <h1>{{title}}</h1>
    <template v-if="!(item?.loading || item?.error)">
        <Form @submit="onSubmit" :validation-schema="schema" :initial-values="item" v-slot="{ errors, isSubmitting }">
            <div class="form-group">
                <label>Name</label>
                <Field name="name" type="text" class="form-control" :class="{ 'is-invalid': errors.name }" />
                <div class="invalid-feedback">{{ errors.name }}</div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <Field name="description" type="text" class="form-control" :class="{ 'is-invalid': errors.description }" />
                <div class="invalid-feedback">{{ errors.description }}</div>
            </div>
            <div class="form-row">
                <div class="form-group col">
                    <label>Quantity</label>
                    <Field name="quantity" type="number" class="form-control" :class="{ 'is-invalid': errors.quantity }" />
                    <div class="invalid-feedback">{{ errors.quantity }}</div>
                </div>
                <div class="form-group col">
                    <label>Price</label>
                    <Field name="price" type="number" step="0.01" class="form-control" :class="{ 'is-invalid': errors.price }" />
                    <div class="invalid-feedback">{{ errors.price }}</div>
                </div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="isSubmitting">
                    <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                    Save
                </button>
                <router-link to="/inventory" class="btn btn-link">Cancel</router-link>
            </div>
        </Form>
    </template>
    <template v-if="item?.loading">
        <div class="text-center m-5">
            <span class="spinner-border spinner-border-lg align-center"></span>
        </div>
    </template>
    <template v-if="item?.error">
        <div class="text-center m-5">
            <div class="text-danger">Error loading item: {{item.error}}</div>
        </div>
    </template>
</template>