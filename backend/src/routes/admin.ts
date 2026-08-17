import { Router } from 'express';
import { requireAdmin } from '../middleware/adminGuard';
import * as adminController from '../controllers/adminController';
import * as settingsController from '../controllers/settingsController';

const router = Router();

router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/places', adminController.getPlaces);
router.get('/places/:id', adminController.getPlaceDetail);
router.patch('/places/:id/status', adminController.updatePlaceStatus);
router.put('/places/:id', adminController.updatePlace);
router.delete('/places/:id', adminController.deletePlace);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id/role', adminController.updateUserRole);
router.post('/users/:id/ban', adminController.banUserController);
router.post('/users/:id/unban', adminController.unbanUserController);

router.get('/merchants', adminController.getMerchants);
router.post('/merchants/:id/approve', adminController.approveMerchant);
router.post('/merchants/:id/reject', adminController.rejectMerchant);

router.get('/contributions', adminController.getContributions);
router.delete('/contributions/:id', adminController.deleteContribution);

router.get('/audit-log', adminController.getAuditLogController);

router.get('/settings/hero', settingsController.getHeroSettings);
router.put('/settings/hero', settingsController.updateHeroSettings);

export default router;
