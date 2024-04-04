import { auth } from '../utils/firebase';

// OIDC 토큰 검증 미들웨어
const verifyAuthToken = async (req, res, next) => {
  try {
    const { signinToken } = req.cookies;
    if (!signinToken) {
      return res
        .status(401)
        .json({ message: 'Authorization token is missing.' });
    }
    const decodedToken = await auth.verifyIdToken(signinToken);
    // 검증된 UID를 요청 객체에 추가
    req.user = { uid: decodedToken.uid, name: decodedToken.name };
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    res.status(403).json({ message: 'Unauthorizesd' });
    throw new Error(error);
  }
};
export default verifyAuthToken;
