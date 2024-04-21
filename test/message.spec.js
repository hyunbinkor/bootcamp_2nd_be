import assert from 'assert';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { before, describe, it } from 'node:test';
import request from 'supertest';
import { port } from '../src/constant/env';
import { router } from '../src/controllers';

const app = express();
before(() => {
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', router);

  app.listen(port, () => {
    console.log('Server Running✔️');
  });
});
describe('메시지 API 테스트', () => {
  let messageId; // 메시지 ID를 저장할 변수

  it('단일 메시지를 가져올 수 있어야 함', async () => {
    const res = await request(app).get('/api/message/4hfPZS7rrtcfD88WfZ1T');

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.treeId, '4ff85ae1cd6e476cb47addce5479c689');
    assert.strictEqual(res.body.message, 'Hello');
  });

  it('메시지를 작성할 수 있어야 함', async () => {
    const res = await request(app)
      .post('/api/message/4ff85ae1cd6e476cb47addce5479c689/write')
      .set(
        'Cookie',
        'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJrYWthbzozNDE3NzE1MzI2IiwiaWF0IjoxNzEyNzk3OTk1fQ.v7uIgEYNNG2JhSzLY3_2XkqQBlkbvjxQO06zjec3VXk'
      )
      .send({
        message: 'Hello',
        icon: 'https://firebasestorage.googleapis.com/v0/b/eliceii.appspot.com/o/icons%2Fbear.gltf?alt=media&token=69d646fe-8277-4f41-8a7a-a6b3bd6aa8b7',
        coordinate: { x: 0, y: 0 }
      });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, '메시지 작성 완료');
    messageId = res.body.messageId;
  });

  it('메시지를 삭제할 수 있어야 함', async () => {
    const res = await request(app)
      .delete(`/api/message/${messageId}/delete`)
      .set(
        'Cookie',
        'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJrYWthbzozNDE3NzE1MzI2IiwiaWF0IjoxNzEyNzk3OTk1fQ.v7uIgEYNNG2JhSzLY3_2XkqQBlkbvjxQO06zjec3VXk'
      );

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.messageData.treeId,
      '4ff85ae1cd6e476cb47addce5479c689'
    );
    assert.strictEqual(res.body.message, '메시지를 성공적으로 삭제하였습니다.');
  });

  it('모든 아이콘을 가져올 수 있어야 함', async () => {
    const res = await request(app).get('/api/message/icon/all');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.length, 13);
  });

  // it('트리의 모든 메시지를 가져올 수 있어야 함', async () => {
  //   const res = await request(app).get(
  //     '/api/message/4ff85ae1cd6e476cb47addce5479c689/all?count=1'
  //   );

  //   assert.strictEqual(res.statusCode, 200);
  //   assert.strictEqual(res.body.length, 11);
  //   assert.strictEqual(res.body[0].treeId, '4ff85ae1cd6e476cb47addce5479c689');
  // });
});
