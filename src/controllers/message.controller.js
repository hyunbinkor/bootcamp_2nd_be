import { Router } from 'express';
import verifyAuthToken from '../middleware/oauth.middleware';
import { db } from '../utils/firebase';

export const messageRouter = Router();

// 메시지 1개 받아오기 O
messageRouter.get('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const messageRef = await db.collection('messages').doc(messageId).get();

    if (!messageRef.exists) {
      return res.status(404).send({ error: '메시지를 찾을 수 없습니다.' });
    }

    const messageData = messageRef.data();
    res.json(messageData);
  } catch (error) {
    console.error('메시지 1개 받아오기 에러:', error);
    res.status(500).send({ error: '메시지를 가져오지 못했습니다.' });
  }
});

// 메시지 작성 O
messageRouter.post('/:treeId/write', async (req, res) => {
  try {
    const { treeId } = req.params;
    if (!treeId) {
      res.status(404).json({ message: '트리가 없습니다.' });
    }
    const { message, icon, coordinate, uid } = req.body;
    const messageRef = await db.collection('messages').add({
      treeId,
      message,
      icon,
      uid,
      created_at: new Date(),
      coordinate: coordinate ?? { x: 0, y: 0 }
    });
    const messageId = (await messageRef.get()).id;

    res.status(200).json({
      message: '메시지 작성 완료',
      messageId
    });
  } catch (error) {
    console.error('Error:', error);

    if (error.code === 404) {
      res.status(404).json({ error: '질문 메시지 작성에 실패하였습니다.' });
    }
    res.status(500).json({ error: '질문 메시지 작성에 실패하였습니다.' });
  }
});

// 메시지 삭제 O
messageRouter.delete(
  '/:messageId/delete',
  verifyAuthToken,
  async (req, res) => {
    const { messageId } = req.params;

    try {
      // questions 컬렉션에서 questionId로 문서 조회
      const messageDocSnapshot = await db
        .collection('messages')
        .doc(messageId)
        .get();

      if (!messageDocSnapshot.exists) {
        return res.status(404).send({ error: '질문을 찾을 수 없습니다.' });
      }

      await messageDocSnapshot.ref.delete();

      res.status(200).send({
        message: '메시지를 성공적으로 삭제하였습니다.',
        messageData: messageDocSnapshot.data()
      });
    } catch (error) {
      console.error('질문 삭제 도중 오류가 발생하였습니다.', error);
      res.status(500).send({ error: '메시지를 삭제하지 못했습니다.' });
    }
  }
);

// 트리 메시지 전체 받아오기 O
messageRouter.get('/:treeId/all', async (req, res) => {
  try {
    const { treeId } = req.params;
    const messages = [];

    const doc = await db
      .collection('messages')
      .where('treeId', '==', treeId)
      .get();
    doc.forEach((msg) => messages.push(msg.data()));

    res.json(messages);
  } catch (error) {
    console.error('Error:', error);
    if (error.code === 404) {
      res.status(404).json({ error: '질문지를 찾을 수 없습니다.' });
    }
    res.status(500).json({ error: '설문지, 질문을 가져오지 못했습니다.' });
  }
});
