import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { dishCreateSchema, dishUpdateSchema } from '../validators/dish.validator';
import { promoCreateSchema, promoUpdateSchema } from '../validators/promo.validator';
import { updateOrderStatusSchema } from '../validators/admin.validator';
import * as c from '../controllers/admin.controller';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/stats', c.stats);

adminRouter.get('/dishes', c.adminDishes);
adminRouter.post('/dishes', uploadImage.single('image'), validate({ body: dishCreateSchema }), c.createDish);
adminRouter.patch('/dishes/:id', uploadImage.single('image'), validate({ body: dishUpdateSchema }), c.updateDish);
adminRouter.delete('/dishes/:id', c.deleteDish);
adminRouter.patch('/dishes/:id/toggle', c.toggleDish);

adminRouter.get('/categories', c.adminCategories);
adminRouter.post('/categories', c.createCategory);
adminRouter.patch('/categories/:id', c.updateCategory);
adminRouter.delete('/categories/:id', c.deleteCategory);

adminRouter.get('/orders', c.adminOrders);
adminRouter.get('/orders/:id', c.adminOrderDetail);
adminRouter.patch('/orders/:id/status', validate({ body: updateOrderStatusSchema }), c.updateOrderStatus);

adminRouter.get('/users', c.adminUsers);
adminRouter.patch('/users/:id/role', c.changeRole);
adminRouter.patch('/users/:id/block', c.toggleBlock);

adminRouter.get('/promos', c.adminPromos);
adminRouter.post('/promos', validate({ body: promoCreateSchema }), c.createPromo);
adminRouter.patch('/promos/:id', validate({ body: promoUpdateSchema }), c.updatePromo);
adminRouter.delete('/promos/:id', c.deletePromo);

adminRouter.post('/push/send', c.sendPush);
