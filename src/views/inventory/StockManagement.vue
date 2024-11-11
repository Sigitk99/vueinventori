<script setup>
import { ref, onMounted } from 'vue';
import { useInventoryStore } from '@/stores';
import { useRoute } from 'vue-router';

const route = useRoute();
const itemId = parseInt(route.params.id);

const inventoryStore = useInventoryStore();
const { item, transactions } = storeToRefs(inventoryStore);

// Menambahkan pengambilan data stok saat komponen dimuat
onMounted(async () => {
    await inventoryStore.getById(itemId);
    await inventoryStore.getTransactions(itemId);
});
</script>

<template>
    <div v-if="item && !item.loading">
        <h1>Stock Management - {{ item.name }}</h1>

        <!-- Menampilkan stok yang tersedia -->
        <div class="row">
            <div class="col-md-6">
                <h3>Current Stock: {{ item.quantity }}</h3>
            </div>
        </div>

        <!-- Form untuk menambah atau mengurangi stok -->
        <div class="row">
            <div class="col-md-6">
                <StockForm :itemId="itemId" type="in" />
            </div>
            <div class="col-md-6">
                <StockForm :itemId="itemId" type="out" />
            </div>
        </div>

        <!-- Menampilkan riwayat transaksi -->
        <h3 class="mt-4">Transaction History</h3>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="transactions.length">
                    <tr v-for="trans in transactions" :key="trans.id">
                        <td>{{ new Date(trans.date).toLocaleDateString() }}</td>
                        <td>{{ trans.type }}</td>
                        <td>{{ trans.quantity }}</td>
                        <td>{{ trans.notes }}</td>
                    </tr>
                </template>
                <tr v-if="transactions.loading">
                    <td colspan="4" class="text-center">
                        <span class="spinner-border spinner-border-sm"></span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else-if="item.loading" class="text-center">
        <span class="spinner-border"></span>
    </div>
</template>
