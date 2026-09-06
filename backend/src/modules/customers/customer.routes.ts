import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/auth.middleware';
import { getCustomers, getCustomer, deleteCustomer } from './customer.controller';

const customerRouter = Router();

// ─── List & Search Customers (SuperAdmin or Location Admin) ───────────────────
customerRouter.get('/getUserCustomers', requireAuth, getCustomers);
customerRouter.get('/getAllCustomers', requireAuth, getCustomers);
customerRouter.get('/', requireAuth, getCustomers);
customerRouter.get('/:id', requireAuth, getCustomer);

// ─── Delete Customer (SuperAdmin only) ────────────────────────────────────────
customerRouter.delete('/:id', requireAuth, requireSuperAdmin, deleteCustomer);

export default customerRouter;
