<script setup>
import { storeToRefs } from 'pinia';
import { useInventoryStore } from '@/stores';

const inventoryStore = useInventoryStore();
const { items } = storeToRefs(inventoryStore);

inventoryStore.getAll();

function formatPrice(price) {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
}
</script>

<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h1>Inventory</h1>
            <div>
                <router-link to="/inventory/reports" class="btn btn-info mr-2">Reports</router-link>
                <router-link to="/inventory/add" class="btn btn-success">Add Item</router-link>
            </div>
        </div>

        <table class="table table-striped">
            <thead>
                <tr>
                    <th style="width: 20%">Name</th>
                    <th style="width: 20%">Description</th>
                    <th style="width: 15%">Quantity</th>
                    <th style="width: 15%">Price</th>
                    <th style="width: 30%">Actions</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="items.length">
                    <tr v-for="item in items" :key="item.id">
                        <td>{{ item.name }}</td>
                        <td>{{ item.description }}</td>
                        <td>{{ item.quantity || 0 }}</td>
                        <td>${{ formatPrice(item.price) }}</td>
                        <td>
                            <router-link :to="`/inventory/${item.id}/stock`" class="btn btn-sm btn-info mr-1">Stock</router-link>
                            <router-link :to="`/inventory/${item.id}/borrow`" class="btn btn-sm btn-warning mr-1">Borrow</router-link>
                            <router-link :to="`/inventory/edit/${item.id}`" class="btn btn-sm btn-primary mr-1">Edit</router-link>
                            <button @click="inventoryStore.delete(item.id)" class="btn btn-sm btn-danger" :disabled="item.isDeleting">
                                <span v-if="item.isDeleting" class="spinner-border spinner-border-sm"></span>
                                <span v-else>Delete</span>
                            </button>
                        </td>
                    </tr>
                </template>
                <tr v-if="items.loading">
                    <td colspan="5" class="text-center">
                        <span class="spinner-border spinner-border-lg align-center"></span>
                    </td>
                </tr>
                <tr v-if="items.error">
                    <td colspan="5">
                        <div class="text-danger">Error loading inventory: {{items.error}}</div>
                    </td>
                </tr>            
            </tbody>
        </table>
    </div>
</template>