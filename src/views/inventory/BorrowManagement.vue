<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';

import { useInventoryStore, useAlertStore } from '@/stores';

const route = useRoute();
const id = route.params.id;
const inventoryStore = useInventoryStore();
const alertStore = useAlertStore();
const { item, borrowRecords } = storeToRefs(inventoryStore);

const schema = Yup.object().shape({
    borrowerName: Yup.string().required('Nama peminjam wajib diisi'),
    quantity: Yup.number()
        .required('Jumlah barang wajib diisi')
        .min(1, 'Jumlah barang harus minimal 1')
        .max(Yup.ref('$availableQuantity'), 'Jumlah barang melebihi stok yang tersedia'),
    expectedReturnDate: Yup.date()
        .required('Tanggal pengembalian wajib diisi')
        .min(new Date(), 'Tanggal pengembalian harus di masa depan')
});

onMounted(async () => {
    await inventoryStore.getById(id);
    await inventoryStore.getBorrowRecords(id);
});

async function onSubmit(values) {
    try {
        await inventoryStore.borrowItem(id, values);
        alertStore.success('Barang berhasil dipinjam');
    } catch (error) {
        alertStore.error('Terjadi kesalahan saat meminjam barang');
    }
}

async function returnItem(borrowId) {
    try {
        await inventoryStore.returnItem(id, borrowId);
        alertStore.success('Barang berhasil dikembalikan');
    } catch (error) {
        alertStore.error('Terjadi kesalahan saat mengembalikan barang');
    }
}

function getAvailableQuantity() {
    if (!item.value || !borrowRecords.value) return 0;
    const borrowed = borrowRecords.value
        .filter(record => !record.returnDate) // Memastikan bahwa barang yang dipinjam belum dikembalikan
        .reduce((total, record) => total + record.quantity, 0);
    return (item.value.quantity || 0) - borrowed;
}
</script>

<template>
    <div v-if="item && !item.loading && !item.error">
        <h1>Manajemen Peminjaman - {{ item.name }}</h1>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-header">
                        <h4 class="mb-0">Peminjaman Barang</h4>
                    </div>
                    <div class="card-body">
                        <Form @submit="onSubmit" 
                              :validation-schema="schema" 
                              :validation-context="{ availableQuantity: getAvailableQuantity() }" 
                              v-slot="{ errors, isSubmitting }">
                            <div class="form-group">
                                <label>Nama Peminjam</label>
                                <Field name="borrowerName" type="text" class="form-control" :class="{ 'is-invalid': errors.borrowerName }" />
                                <div class="invalid-feedback">{{ errors.borrowerName }}</div>
                            </div>
                            <div class="form-group">
                                <label>Jumlah (Tersedia: {{ getAvailableQuantity() }})</label>
                                <Field name="quantity" type="number" class="form-control" :class="{ 'is-invalid': errors.quantity }" />
                                <div class="invalid-feedback">{{ errors.quantity }}</div>
                            </div>
                            <div class="form-group">
                                <label>Tanggal Pengembalian yang Diharapkan</label>
                                <Field name="expectedReturnDate" type="date" class="form-control" :class="{ 'is-invalid': errors.expectedReturnDate }" />
                                <div class="invalid-feedback">{{ errors.expectedReturnDate }}</div>
                            </div>
                            <button class="btn btn-primary" :disabled="isSubmitting || getAvailableQuantity() === 0">
                                <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                                Pinjam Barang
                            </button>
                        </Form>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h4 class="mb-0">Peminjaman Saat Ini</h4>
                    </div>
                    <div class="card-body">
                        <div v-if="borrowRecords && borrowRecords.length > 0">
                            <div v-for="record in borrowRecords" :key="record.id" class="mb-3 p-3 border rounded">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{{ record.borrowerName }}</strong>
                                        <br>
                                        Jumlah: {{ record.quantity }}
                                        <br>
                                        Tanggal Pengembalian yang Diharapkan: {{ new Date(record.expectedReturnDate).toLocaleDateString() }}
                                    </div>
                                    <button v-if="!record.returnDate" 
                                            @click="returnItem(record.id)" 
                                            class="btn btn-success"
                                            :disabled="record.isReturning">
                                        <span v-if="record.isReturning" class="spinner-border spinner-border-sm mr-1"></span>
                                        Kembalikan
                                    </button>
                                    <span v-else class="badge badge-success">Dikembalikan</span>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="borrowRecords && borrowRecords.length === 0" class="text-center">
                            <p>Tidak ada data peminjaman</p>
                        </div>
                        <div v-else-if="borrowRecords?.loading" class="text-center">
                            <span class="spinner-border"></span>
                        </div>
                        <div v-else-if="borrowRecords?.error" class="text-danger">
                            Terjadi kesalahan saat memuat data peminjaman: {{ borrowRecords.error }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="item?.loading" class="text-center">
        <span class="spinner-border"></span>
    </div>
    <div v-else-if="item?.error" class="text-danger">
        Terjadi kesalahan saat memuat data barang: {{ item.error }}
    </div>
</template>

<style scoped>
.card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
    background-color: #f8f9fa;
}
</style>
