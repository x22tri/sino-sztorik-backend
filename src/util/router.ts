import {
  signup,
  login,
  advanceUser,
} from '../controllers/users/users-controllers.js';
import {
  getLessonSelect,
  getLearn,
  getReview,
} from '../controllers/lessons/lesson-controllers.js';
import { handleSearchRequest } from '../controllers/characters/characters-controllers.js';

// import {
//   getAllLessons,
//   getAdditionalInfoAdmin,
//   updateLesson,
//   getAllPhrases,
//   updateAllPhrasesOrOtherUses,
//   getAllOtherUses,
//   getAllSimilars,
//   updateCharacter,
// } from '../controllers/admin/admin-controllers.js';

import { check } from 'express-validator';
const signupValidators = [
  check('displayName').not().isEmpty(),
  check('email').not().isEmpty(),
  check('password').isLength({ min: 6 }),
];

import express, { NextFunction, Request, Response } from 'express';
const router = express.Router();

// Routes start here.
router.post('/api/users/signup', signupValidators, signup);
router.post('/api/users/login', login);
router.post('/api/users/advance', advanceUser);

router.get('/api/learn', getLearn);
router.get('/api/learn/select', getLessonSelect);
router.get('/api/review/:lessonToReview', getReview);

router.get('/api/search/:searchTerm', handleSearchRequest);

// router.get('/api/admin/all-lessons', getAllLessons);
// router.get('/api/admin/additional-info/:charId', getAdditionalInfoAdmin);
// router.put('/api/admin/lesson/update/:lessonId', updateLesson);

// router.get('/api/admin/all-phrases', getAllPhrases);
// router.put('/api/admin/all-phrases/update', updateAllPhrasesOrOtherUses);
// router.get('/api/admin/all-other-uses', getAllOtherUses);
// router.put('/api/admin/all-other-uses/update', updateAllPhrasesOrOtherUses);
// router.get('/api/admin/all-similars/:similarType', getAllSimilars);
// router.put('/api/admin/character/:charId/update', updateCharacter);

router.put('/api/admin*', (req: Request, res: Response, next: NextFunction) => {
  next(new Error('The admin functionality is currently turned off.'));
});

router.get('/api/admin*', (req: Request, res: Response, next: NextFunction) => {
  next(new Error('The admin functionality is currently turned off.'));
});

export default router;
