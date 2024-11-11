<script setup>
import { ref } from 'vue';
import { useInventoryStore, useAlertStore } from '@/stores';

const props = defineProps({
    itemId: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        validator: (value) => ['in', 'out'].includes(value)
    }
});

const inventoryStore = useInventoryStore();
const alertStore = useAlertStore();

const quantity = ref(0);
const date = ref(new Date().toISOString().split('T')[0]);
const notes = ref('');

async function handleSubmit() {
    if (quantity.value <= 0) {
        alertStore.error('Quantity must be greater than zero');
        return;
    }
    
    const action = props.type === 'in' ? 'addStock' : 'removeStock';
    const actionMessage = props.type === 'in' ? 'Stock added successfully' : 'Stock removed successfully';

    try {
        await inventoryStore[action](props.itemId, quantity.value, date.value, notes.value);
        alertStore.success(actionMessage);
        quantity.value = 0;
        notes.value = '';
    } catch (error) {
        alertStore.error(error);
    }
}
</script>

<template>
    <form @submit.prevent="handleSubmit" class="mb-4">
        <h3>{{ type === 'in' ? 'Add Stock' : 'Remove Stock' }}</h3>
        <div class="form-row">
            <div class="form-group col">
                <label>Quantity</label>
                <input v-model.number="quantity" type="number" class="form-control" required min="1" />
            </div>
            <div class="form-group col">
                <label>Date</label>
                <input v-model="date" type="date" class="form-control" required />
            </div>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea v-model="notes" class="form-control" rows="2"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
</template>
