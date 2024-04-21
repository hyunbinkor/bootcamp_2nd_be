import { Router } from 'express';
import verifyAuthToken from '../middleware/oauth.middleware';
import { treeService } from '../service';

export const treeRouter = Router();

// 질문 생성 후 트리 생성 , 기존에 트리가 있는지 검사 O
treeRouter.post('/add', verifyAuthToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const questions = req.body;
    console.log(questions);
    // 객체가 비어있는지 확인
    if (Object.keys(questions).length === 0) {
      return res.status(403).json({ message: '질문을 등록해주세요' });
    }

    const treeData = await treeService.createTree(uid);
    if (treeData?.error) {
      // 트리가 존재한다면 return
      return res.status(401).json(treeData);
    }
    await treeService.createQuestion(uid, questions);

    res.status(200).json({ message: '트리가 생성되었습니다.', treeData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: '트리가 생성되지 않았습니다.'
    });
  }
});

// 트리 정보
treeRouter.get('/info', async (req, res) => {
  try {
    const { treeId } = req.query;
    if (!treeId) {
      res.status(400).json({ message: 'treeId가 없습니다.' });
    }
    const treeInfo = await treeService.infoQuestion(treeId);
    res.status(200).json(treeInfo);
  } catch (error) {
    res.status(404).json({ message: '트리 정보가 없습니다.' });
  }
});
