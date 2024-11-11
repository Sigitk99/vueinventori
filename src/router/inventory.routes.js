import { Layout, List, AddEdit } from '@/views/inventory';
import StockManagement from '@/views/inventory/StockManagement.vue';
import BorrowManagement from '@/views/inventory/BorrowManagement.vue';
import Reports from '@/views/inventory/Reports.vue';

export default {
    path: '/inventory',
    component: Layout,
    children: [
        { path: '', component: List },
        { path: 'add', component: AddEdit },
        { path: 'edit/:id', component: AddEdit },
        { path: ':id/stock', component: StockManagement },
        { path: ':id/borrow', component: BorrowManagement },
        { path: 'reports', component: Reports }
    ]
};