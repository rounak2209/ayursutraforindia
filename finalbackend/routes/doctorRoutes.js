import express from 'express';
import { auth, permit } from '../middleware/auth.js';
import { list, getOne, create, update, updateProfile } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', auth, list); // or public depending on your design
router.get('/:id', auth, getOne);
router.get('/profile/:id', auth, getOne);   
router.put('/profile/:id', auth, updateProfile); // convenient alias for profile updates
router.post('/', create); // sign up (if you allow creating doctors)
router.put('/:id', auth, update); // owner or admin

export default router;