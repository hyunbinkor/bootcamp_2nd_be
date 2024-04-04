import { db } from '../utils/firebase';

export const userService = {
  async userCreate(user) {
    const res = await db.collection('users').add(user);
    return res;
  }
};
