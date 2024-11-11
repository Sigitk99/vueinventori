<script setup>
import { ref } from 'vue';
import { useInventoryStore, useAlertStore } from '@/stores';

const props = defineProps({
    itemId: {
        type: Number,
        required: true
    }
});

const inventoryStore = useInventoryStore();
const alertStore = useAlertStore();

const borrowerId = ref('');
const quantity = ref(1);
const dueDate = ref('');
const notes = ref('');

async function handleSubmit() {
    try {
        await inventoryStore.borrowItem(
            props.itemId,
            borrowerId.value,
            quantity.value,
            dueDate.value,
            notes.value
        );
        alertStore.success('Item borrowed successfully');
        borrowerId.value = '';
        quantity.value = 1;
        dueDate.value = '';
        notes.value = '';
    } catch (error) {
        alertStore.error(error);
    }
}
</script>

<template>
    <form @submit.prevent="handleSubmit" class="mb-4">
        <h3>Borrow Item</h3>
        <div class="form-row">
            <div class="form-group col">
                <label>Borrower ID</label>
                <input v-model="borrowerId" type="text" class="form-control" required />
            </div>
            <div class="form-group col">
                <label>Quantity</label>
                <input v-model.number="quantity" type="number" class="form-control" required min="1" />
            </div>
        </div>
        <div class="form-row">
            <div class="form-group col">
                <label>Due Date</label>
                <input v-model="dueDate" type="date" class="form-control" required />
            </div>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea v-model="notes" class="form-control" rows="2"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
</template>