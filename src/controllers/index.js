import express from 'express';
import { messageRouter } from './message.controller';
import { oauthRouter } from './oauth.controller';
import { questionRouter } from './question.controller';
import { treeRouter } from './tree.controller';

export const router = express.Router();

router.use('/oauth', oauthRouter); // 소셜로그인에 대한 Router
router.use('/message', messageRouter); // 트리에 대한 Router
router.use('/tree', treeRouter);
router.use('/question', questionRouter);
