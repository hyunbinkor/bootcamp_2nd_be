import { Router } from 'express';
import { frontendUrl } from '../constant/url';
import {
  getKakaoUser,
  getToken,
  updateOrCreateUser
} from '../service/kakaoAuth.service';
import {
  getNaverToken,
  getNaverUser,
  updateOrCreateNaverUser
} from '../service/naverAuth.service';
import { userService } from '../service/user.service';
import { auth, db } from '../utils/firebase';

export const oauthRouter = Router();

oauthRouter.get('/kakao', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: 'code is a required parameter.'
      });
    }

    const response = await getToken(code);
    const token = response.access_token;
    const kakaoUser = await getKakaoUser(token);
    const userCheck = await db
      .collection('users')
      .where('uid', '==', kakaoUser.id)
      .get();

    const authUser = await updateOrCreateUser(kakaoUser);
    const firebaseToken = await auth.createCustomToken(authUser.uid, {
      provider: 'oidc.kakao',
      httpOnly: true
    });
    if (userCheck.empty) {
      await userService.userCreate({
        uid: kakaoUser.id,
        name: kakaoUser.kakao_account.profile.nickname,
        email: kakaoUser.kakao_account.email,
        // name, age 추후에 허가받은 후 진행
        question: [],
        messageCount: 0,
        refreshToken: response.refresh_token
      });
    }

    res.cookie('firebaseToken', firebaseToken, { httpOnly: true });

    // 프론트 router 작성되면 redirect 위치 분기문 작성 예정
    return res.redirect(frontendUrl);
  } catch (error) {
    res.status(404).json({ message: '로그인에 실패하였습니다.' });
    throw new Error(error);
  }
});

oauthRouter.get('/naver', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: 'code is a required parameter.'
      });
    }
    const response = await getNaverToken(code); // 네이버 OAuth를 통해 액세스 토큰을 받아옴
    const naverUser = await getNaverUser(response.access_token); // 액세스 토큰을 사용하여 네이버 사용자 정보를 가져옴

    // 네이버 사용자 정보를 바탕으로 Firebase에 인증 및 사용자 정보 업데이트
    const authUser = await updateOrCreateNaverUser(naverUser.response);
    const firebaseToken = await auth.createCustomToken(authUser.uid, {
      provider: 'oidc.naver',
      httpOnly: true
    });

    // 사용자 정보가 새로 생성되었을 경우 Firebase와 DB에 사용자 정보 저장
    if (naverUser.isNewUser) {
      await userService.userCreate({
        uid: naverUser.id,
        name: naverUser.naver_account.profile.nickname,
        email: naverUser.naver_account.email || '', // 네이버는 이메일 제공 선택적
        // name, age 등 필요한 정보 추가
        question: [],
        messageCount: 0,
        refreshToken: response.refresh_token
      });
    }

    // Firebase에서 발급된 사용자 토큰을 쿠키에 담아서 클라이언트에게 전달
    res.cookie('firebaseToken', firebaseToken, { httpOnly: true });

    // 프론트 router 작성되면 redirect 위치 분기문 작성 예정
    return res.redirect(frontendUrl);
  } catch (error) {
    res.status(404).json({ message: '네이버 로그인에 실패하였습니다.' });
    throw new Error(error);
  }
});
