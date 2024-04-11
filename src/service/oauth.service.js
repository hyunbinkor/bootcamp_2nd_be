import axios from 'axios';
import {
  kakaoClientId,
  kakaoRedirectUri,
  kakaoSecret,
  naverClientId,
  naverRedirectUri,
  naverSecretKey
} from '../constant/env';
import {
  kakaoReqMeUrl,
  kakaoTokenUrl,
  naverReqMeUrl,
  naverTokenUrl
} from '../constant/url';
import { auth, db } from '../utils/firebase';

export default class OAuthService {
  /**
   * 생성자
   * @param {"naver" | "kakao"} provider - 제공자 (네이버 또는 카카오)
   */
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * 액세스 토큰을 요청합니다.
   * @param {string} code - 코드
   * @returns {Promise<any>} 토큰 응답 데이터
   */
  async getToken(code) {
    try {
      const body =
        this.provider === 'kakao'
          ? {
              grant_type: 'authorization_code',
              client_id: kakaoClientId,
              redirect_uri: kakaoRedirectUri,
              client_secret: kakaoSecret,
              code
            }
          : {
              grant_type: 'authorization_code',
              client_id: naverClientId,
              client_secret: naverSecretKey,
              redirect_uri: naverRedirectUri,
              code,
              state: 'RAMDOM_STATE'
            };
      const tokenUrl =
        this.provider === 'kakao' ? kakaoTokenUrl : naverTokenUrl;
      const res = await axios.post(tokenUrl, new URLSearchParams(body));
      return res.data;
    } catch (error) {
      console.error(
        '토큰 요청 Error:',
        error.response ? error.response.data : error.message
      );
      throw new Error('토큰 요청 에러');
    }
  }

  async getUser(token) {
    try {
      const reqTokenUrl =
        this.provider === 'kakao' ? kakaoReqMeUrl : naverReqMeUrl;
      const res = await axios.get(reqTokenUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (error) {
      console.error(
        '유저정보 요청 Error:',
        error.response ? error.response.data : error.message
      );
    }
  }

  // 유저의 이름 저장 x
  async updateOrCreateUser(user, refreshToken) {
    const properties = {
      uid: `${this.provider}:${user.id}`,
      provider: `oidc.${this.provider}`,
      created_at: new Date(),
      email: user.kakao_account?.email ?? `${user.id}@naver.com`,
      refreshToken
    };
    const userRef = db.collection('users').doc(`${this.provider}:${user.id}`);
    try {
      const [, authResult] = await Promise.all([
        userRef.set(properties),
        auth.updateUser(properties.uid, properties)
      ]);
      return authResult;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        const [, authResult] = await Promise.all([
          userRef.set(properties),
          auth.createUser(properties)
        ]);
        return authResult;
      }
      throw new Error(error);
    }
  }

  // 사용자 트리 찾기
  async userTreeFind(uid) {
    try {
      const snapshot = await db
        .collection('tree')
        .where('uid', '==', uid)
        .get();
      if (!snapshot.empty) {
        return snapshot.docs[0].id; // 첫 번째 문서의 트리 ID 반환
      }
      // 트리가 없을 경우에 대한 처리 추가 가능
      return null;
    } catch (error) {
      console.error('유저 트리 조회 에러:', error.message);
      throw new Error('유저 트리 조회 에러');
    }
  }

  // 유저 삭제 시 tree, message 삭제
  async deleteUser(uid) {
    const batch = db.batch();

    try {
      // 1. Firestore의 users 컬렉션에서 사용자 데이터 삭제
      const userDocRef = db.collection('users').doc(uid);
      batch.delete(userDocRef);

      // 2. tree 컬렉션에서 해당 사용자의 uid를 가진 문서를 찾아 삭제
      const treeSnapshot = await db
        .collection('tree')
        .where('uid', '==', uid)
        .get();
      treeSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 3. message 컬렉션에서 해당 treeId를 가진 문서도 삭제
      const deletePromises = [];
      treeSnapshot.forEach(async (treeDoc) => {
        const { treeId } = treeDoc.data();
        console.log(treeId);
        const messageSnapshot = await db
          .collection('messages')
          .where('treeId', '==', treeId)
          .get();
        messageSnapshot.forEach((doc) => {
          deletePromises.push(batch.delete(doc.ref));
        });
      });

      // 모든 삭제 작업을 비동기로 실행
      await Promise.all(deletePromises);

      // 4. Firebase Authentication에서 사용자 삭제
      await auth.deleteUser(uid);

      // 모든 변경 사항을 적용
      await batch.commit();

      return '사용자 데이터가 성공적으로 삭제되었습니다.';
    } catch (error) {
      console.error('사용자 데이터 삭제 오류:', error);
      // 에러 발생 시 롤백
      await batch.rollback();
      throw new Error('사용자 데이터를 삭제하지 못했습니다.');
    }
  }
}
