import express from 'express';
import { getAllActAndRules } from '../../controllers/User/DisplayActAndRulesController.js';


const ActAndRulesRouter = express.Router();

ActAndRulesRouter.get('/acts-rules', getAllActAndRules);

export default ActAndRulesRouter;
