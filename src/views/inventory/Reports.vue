<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useInventoryStore } from '@/stores';

const inventoryStore = useInventoryStore();
const { reports } = storeToRefs(inventoryStore);

const reportType = ref('stock');
const startDate = ref(new Date().toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);

async function generateReport() {
    await inventoryStore.generateReport(reportType.value, startDate.value, endDate.value);
}

function printReport() {
    window.print();
}

function formatPrice(price) {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
}
</script>

<template>
    <div>
        <h1>Inventory Reports</h1>
        
        <div class="card mb-4">
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group col">
                        <label>Report Type</label>
                        <select v-model="reportType" class="form-control">
                            <option value="stock">Stock Movement</option>
                            <option value="borrow">Borrowed Items</option>
                            <option value="summary">Inventory Summary</option>
                        </select>
                    </div>
                    <div class="form-group col">
                        <label>Start Date</label>
                        <input v-model="startDate" type="date" class="form-control" />
                    </div>
                    <div class="form-group col">
                        <label>End Date</label>
                        <input v-model="endDate" type="date" class="form-control" />
                    </div>
                </div>
                <button @click="generateReport" class="btn btn-primary mr-2">Generate Report</button>
                <button @click="printReport" class="btn btn-secondary" :disabled="!reports.length">Print Report</button>
            </div>
        </div>

        <div v-if="reports.length" class="report-content">
            <h2>{{ reportType === 'stock' ? 'Stock Movement Report' : 
                   reportType === 'borrow' ? 'Borrowed Items Report' : 
                   'Inventory Summary Report' }}</h2>
            
            <p class="text-muted">
                Period: {{ new Date(startDate).toLocaleDateString() }} - 
                {{ new Date(endDate).toLocaleDateString() }}
            </p>

            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <template v-if="reportType === 'stock'">
                            <th>Initial Stock</th>
                            <th>Stock In</th>
                            <th>Stock Out</th>
                            <th>Final Stock</th>
                        </template>
                        <template v-else-if="reportType === 'borrow'">
                            <th>Times Borrowed</th>
                            <th>Currently Borrowed</th>
                            <th>Overdue Items</th>
                        </template>
                        <template v-else>
                            <th>Current Stock</th>
                            <th>Value</th>
                            <th>Status</th>
                        </template>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in reports" :key="item.id">
                        <td>{{ item.name }}</td>
                        <template v-if="reportType === 'stock'">
                            <td>{{ item.initialStock || 0 }}</td>
                            <td>{{ item.stockIn || 0 }}</td>
                            <td>{{ item.stockOut || 0 }}</td>
                            <td>{{ item.finalStock || 0 }}</td>
                        </template>
                        <template v-else-if="reportType === 'borrow'">
                            <td>{{ item.timesBorrowed || 0 }}</td>
                            <td>{{ item.currentlyBorrowed || 0 }}</td>
                            <td>{{ item.overdueItems || 0 }}</td>
                        </template>
                        <template v-else>
                            <td>{{ item.currentStock || 0 }}</td>
                            <td>${{ formatPrice(item.value) }}</td>
                            <td>{{ item.status }}</td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="reports.loading" class="text-center">
            <span class="spinner-border"></span>
        </div>
    </div>
</template>

<style scoped>
@media print {
    .card, button {
        display: none;
    }
    .report-content {
        margin: 0;
        padding: 0;
    }
}
</style>