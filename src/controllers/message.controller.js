import { Router } from 'express';
import verifyAuthToken from '../middleware/oauth.middleware';
import { messageService, treeService } from '../service';

export const messageRouter = Router();
// // 메시지 1개 받아오기 O
// messageRouter.get('/:messageId', verifyAuthToken, async (req, res) => {
//   try {
//     const treeUid = await treeService.treeIdCheck();
//     const { uid } = req.user;
//     console.log(treeUid);
//     if (treeUid === uid) {
//       res.status(401).json({ message: 'Tree Host가 아닙니다.' });
//     }
//     const { messageId } = req.params;
//     const messageData = await messageService.findOne(messageId);
//     if (messageData.error) {
//       return res.status(404).json({ error: messageData.error });
//     }

//     res.json(messageData);
//   } catch (error) {
//     console.error('메시지 1개 받아오기 에러:', error);
//     res.status(500).send({ error: '메시지를 가져오지 못했습니다.' });
//   }
// });

// 메시지 작성 O
messageRouter.post('/:treeId/write', async (req, res) => {
  try {
    const { treeId } = req.params;
    const { message, icon, coordinate } = req.body;
    const messageId = await messageService.writeMessage(
      treeId,
      message,
      icon,
      coordinate
    );
    if (messageId.error) {
      return res.status(404).json({ error: messageId.error });
    }
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
    const { uid } = req.user;

    try {
      // questions 컬렉션에서 questionId로 문서 조회
      const message = await messageService.deleteOne(messageId, uid);
      if (message.error) {
        return res.status(404).json({ error: message.error });
      }
      res.status(200).send({
        message: '메시지를 성공적으로 삭제하였습니다.',
        messageData: message
      });
    } catch (error) {
      console.error('메시지 삭제 도중 오류가 발생하였습니다.', error);
      res.status(500).send({ message: '메시지를 삭제하지 못했습니다.' });
    }
  }
);

// 모든 아이콘 보여주기
messageRouter.get('/icon/all', async (req, res) => {
  try {
    const iconsUrl = await messageService.iconAll();

    res.status(200).json(iconsUrl);
  } catch (error) {
    return res.status(500).json({
      message: `아이콘을 불러오지 못했습니다. error: ${error}`
    });
  }
});

// host 트리 메시지 전체 받아오기 O
messageRouter.get('/:treeId/all', verifyAuthToken, async (req, res) => {
  try {
    const { treeId } = req.params;
    const treeUid = await treeService.treeIdCheck(treeId);
    const { uid } = req.user;
    if (treeUid !== uid) {
      return res.status(401).json({ message: 'Tree Host가 아닙니다.' });
    }
    const { count, size } = req.query;
    const messages = await messageService.findAll(treeId, count, size); // 페이지네이션 11개씩

    res.json(messages);
  } catch (error) {
    console.error('Error:', error);
    return res
      .status(500)
      .json({ message: '메시지를 가져오지 못했습니다.', error: error.message });
  }
});

// Guest 트리 메시지 전체 받아오기 O
messageRouter.get('/:treeId/guestAll', async (req, res) => {
  try {
    const { treeId } = req.params;
    const { count, size } = req.query;
    if (!treeId || !count || !size) {
      res.status(404).json({ message: '몇개의 데이터를 가져올지 입력하세요' });
    }
    const messages = await messageService.findAll(treeId, count, size); // 페이지네이션 11개씩
    const iconsAndCoordinates = messages.map((msg) => ({
      icon: msg.icon,
      coordinate: msg.coordinate
    }));
    res.json(iconsAndCoordinates);
  } catch (error) {
    console.error('Error:', error);
    return res
      .status(500)
      .json({ message: '메시지를 가져오지 못했습니다.', error: error.message });
  }
});
