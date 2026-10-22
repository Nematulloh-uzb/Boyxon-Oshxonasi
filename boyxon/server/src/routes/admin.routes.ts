import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { dishCreateSchema, dishUpdateSchema } from '../validators/dish.validator';
import { promoCreateSchema, promoUpdateSchema } from '../validators/promo.validator';
import {
  updateOrderStatusSchema,
  objectIdParamSchema,
  adminOrdersQuerySchema,
  adminUsersQuerySchema,
  changeRoleSchema,
  toggleBlockSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  updateSettingsSchema,
  sendPushSchema,
} from '../validators/admin.validator';
import * as c from '../controllers/admin.controller';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/stats', c.stats);
adminRouter.patch('/settings', validate({ body: updateSettingsSchema }), c.updateSettings);

adminRouter.get('/dishes', c.adminDishes);
adminRouter.post('/dishes', uploadImage.single('image'), validate({ body: dishCreateSchema }), c.createDish);
adminRouter.patch('/dishes/:id', uploadImage.single('image'), validate({ params: objectIdParamSchema, body: dishUpdateSchema }), c.updateDish);
adminRouter.delete('/dishes/:id', validate({ params: objectIdParamSchema }), c.deleteDish);
adminRouter.patch('/dishes/:id/toggle', validate({ params: objectIdParamSchema }), c.toggleDish);

adminRouter.get('/categories', c.adminCategories);
adminRouter.post('/categories', validate({ body: categoryCreateSchema }), c.createCategory);
adminRouter.patch(
  '/categories/:id',
  validate({ params: objectIdParamSchema, body: categoryUpdateSchema }),
  c.updateCategory,
);
adminRouter.delete('/categories/:id', validate({ params: objectIdParamSchema }), c.deleteCategory);
adminRouter.post('/categories/:id/restore', validate({ params: objectIdParamSchema }), c.restoreCategory);

adminRouter.get('/orders', validate({ query: adminOrdersQuerySchema }), c.adminOrders);
adminRouter.get('/orders/:id', validate({ params: objectIdParamSchema }), c.adminOrderDetail);
adminRouter.patch(
  '/orders/:id/status',
  validate({ params: objectIdParamSchema, body: updateOrderStatusSchema }),
  c.updateOrderStatus,
);

adminRouter.get('/users', validate({ query: adminUsersQuerySchema }), c.adminUsers);
adminRouter.patch(
  '/users/:id/role',
  validate({ params: objectIdParamSchema, body: changeRoleSchema }),
  c.changeRole,
);
adminRouter.patch(
  '/users/:id/block',
  validate({ params: objectIdParamSchema, body: toggleBlockSchema }),
  c.toggleBlock,
);

adminRouter.get('/promos', c.adminPromos);
adminRouter.post('/promos', validate({ body: promoCreateSchema }), c.createPromo);
adminRouter.patch(
  '/promos/:id',
  validate({ params: objectIdParamSchema, body: promoUpdateSchema }),
  c.updatePromo,
);
adminRouter.delete('/promos/:id', validate({ params: objectIdParamSchema }), c.deletePromo);

adminRouter.post('/push/send', validate({ body: sendPushSchema }), c.sendPush);
