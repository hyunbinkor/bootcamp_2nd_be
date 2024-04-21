import { v4 as uuidv4 } from 'uuid';
import { db } from '../utils/firebase';

export default class TreeService {
  /**
   *
   * @param {string} uid - 사용자 고유번호
   * @returns {Promise<{create_at: Date, name: string,treeId: string, treeImage:string,uid: string}>|{error: string, tree: {uid: string}}>}
   */
  async createTree(uid) {
    const treeSnapshot = await db
      .collection('tree')
      .where('uid', '==', uid)
      .select('uid')
      .get();

    if (!treeSnapshot.empty) {
      return {
        error: '트리가 존재합니다.',
        tree: treeSnapshot.docs[0].data()
      };
    }
    const id = uuidv4().replace(/-/g, '');
    const treeRef = db.collection('tree').doc(id);

    await treeRef.set({
      treeId: id,
      uid,
      created_at: new Date(),
      treeImage: '',
      count: 0
    });

    return (await treeRef.get()).data();
  }

  /**
   *
   * @param {string} uid user에 uid값
   * @param {Array<string>} message 질문에 대한 응답값
   */
  async createQuestion(uid, questions) {
    try {
      const querySnapshot = await db
        .collection('tree')
        .where('uid', '==', uid)
        .get();
      const docRef = querySnapshot.docs[0].ref;
      await docRef.update({ questions });
      return (await docRef.get()).data();
    } catch (error) {
      console.error('질문 생성 오류', error);
      throw new Error(error);
    }
  }

  // Tree 작성한 유저에 대한 정보
  async infoQuestion(treeId) {
    try {
      const questionInfo = await db
        .collection('tree')
        .where('treeId', '==', treeId)
        .get();
      if (questionInfo.empty) {
        return {
          message: '트리가 없습니다.'
        };
      }
      const { nickName, animal } = questionInfo.docs[0].data().questions;
      return { nickName, animal };
    } catch (error) {
      console.error('유저 정보가 없습니다.', error);
      throw new Error(error);
    }
  }

  async treeIdCheck(treeId) {
    try {
      const questionInfo = await db
        .collection('tree')
        .where('treeId', '==', treeId)
        .get();

      if (questionInfo.empty) {
        return {
          message: '트리가 없습니다.'
        };
      }
      const { uid } = questionInfo.docs[0].data();
      console.log(uid);
      return uid;
    } catch (error) {
      console.error('트리가 없습니다.', error);
      throw new Error(error);
    }
  }
}
