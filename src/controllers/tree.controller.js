import { Router } from 'express';
import verifyAuthToken from '../middleware/oauth.middleware';
import { db } from '../utils/firebase';

export const treeRouter = Router();

// 트리 생성 , 기존에 트리가 있는지 검사 O
treeRouter.post('/add', verifyAuthToken, async (req, res) => {
  try {
    const { uid, name } = req.user;

    // 트리가 존재한다면 return
    const treeSnapshot = await db
      .collection('tree')
      .where('uid', '==', uid)
      .select('uid')
      .get();
    if (!treeSnapshot.empty) {
      return res.status(401).json({
        message: '트리가 존재합니다.',
        tree: treeSnapshot.docs[0].data()
      });
    }

    const treeRef = await db.collection('tree').add({
      uid,
      name,
      created_at: new Date(),
      treeImage: '',
      count: 0
    });

    const treeId = (await treeRef.get()).id;
    res.status(200).json({
      message: '트리가 생성되었습니다.',
      treeId
    });
  } catch (error) {
    res.status(404).json({
      message: '트리가 생성되지 않았습니다.'
    });
    throw new Error(error);
  }
});
