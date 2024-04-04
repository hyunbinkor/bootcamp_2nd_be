import { Router } from 'express';
import verifyAuthToken from '../middleware/oauth.middleware';
import { db } from '../utils/firebase';

export const questionRouter = Router();

// 질문 작성, 미들웨어 추가 예정
questionRouter.post('/', verifyAuthToken, async (req, res) => {
  try {
    const { message, user } = req.body;

    await db.collection('users').doc(user.uid).update({
      question: message
    });

    res.status(200).json({
      message: '질문은 추가되었습니다.'
    });
  } catch (error) {
    res.status(404).json({
      message: '질문이 등록되지 않았습니다.',
      error
    });
    throw new Error(error);
  }
});
