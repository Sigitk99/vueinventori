import { defineStore } from 'pinia';
import { fetchWrapper } from '@/helpers';

const baseUrl = `${import.meta.env.VITE_API_URL}/inventory`;

export const useInventoryStore = defineStore({
  id: 'inventory',
  state: () => ({
    items: [],
    item: null,
    borrowRecords: [],
    reports: [],
    loading: false,
    error: null
  }),
  actions: {
    // Fetch all items
    async getAll() {
      this.items = { loading: true };
      try {
        this.items = await fetchWrapper.get(baseUrl);
      } catch (error) {
        this.items = { error };
      }
    },

    // Fetch a specific item by ID
    async getById(id) {
      this.item = { loading: true };
      try {
        this.item = await fetchWrapper.get(`${baseUrl}/${id}`);
      } catch (error) {
        this.item = { error };
      }
    },

    // Fetch borrow records for an item
    async getBorrowRecords(id) {
      this.borrowRecords = { loading: true };
      try {
        this.borrowRecords = await fetchWrapper.get(`${baseUrl}/${id}/borrow`);
      } catch (error) {
        this.borrowRecords = { error };
      }
    },

    // Borrow an item
    async borrowItem(id, borrowData) {
      try {
        await fetchWrapper.post(`${baseUrl}/${id}/borrow`, borrowData);
        await this.getBorrowRecords(id);
      } catch (error) {
        throw error;
      }
    },

    // Return a borrowed item
    async returnItem(id, borrowId) {
      try {
        await fetchWrapper.put(`${baseUrl}/${id}/borrow/${borrowId}/return`);
        await this.getBorrowRecords(id);
      } catch (error) {
        throw error;
      }
    },

    // Generate reports based on type and date range
    async generateReport(type, startDate, endDate) {
      this.reports = { loading: true };
      try {
        this.reports = await fetchWrapper.get(`${baseUrl}/reports/${type}?startDate=${startDate}&endDate=${endDate}`);
      } catch (error) {
        this.reports = { error };
      }
    },

    // Create a new item
    async create(newItem) {
      try {
        // Send POST request to create the new item
        const addedItem = await fetchWrapper.post(baseUrl, newItem);
        // Add the new item to the state after it's added
        this.items.push(addedItem);
      } catch (error) {
        throw error;  // Handle error
      }
    }
  }
});
