import { Router } from 'express';
import { frontendUrl } from '../constant/url';
import {
  getKakaoUser,
  getToken,
  updateOrCreateUser
} from '../service/kakaoAuth.service';
import { getNaverToken, getNaverUser } from '../service/naverAuth.service';
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
    const naverUser = await getNaverUser(response.data.access_token); // 액세스 토큰을 사용하여 네이버 사용자 정보를 가져옴
    // 이후에 필요한 처리를 수행하고 클라이언트에게 응답을 보냄
    return res
      .status(200)
      .json({ message: '네이버 로그인 성공', user: naverUser });
  } catch (error) {
    res.status(404).json({ message: '네이버 로그인에 실패하였습니다.' });
    throw new Error(error);
  }
});
