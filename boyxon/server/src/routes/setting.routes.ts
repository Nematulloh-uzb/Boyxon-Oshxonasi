import { Router } from 'express';
import * as c from '../controllers/setting.controller';

export const settingsRouter = Router();

settingsRouter.get('/', c.getSettings);
