import crypto from 'crypto';
import { Groups } from './data';

export const getEncryptedSession = async (name: string, pubKey: string, callback: any, error: any) => {
  try {
    const ret = await Groups.findOne({ name });

    if (!ret) {
      const group = new Groups({ encryptedSessions: {} });
      group.name = name;
      const sessionKeyBuffer = await crypto.randomBytes(32);
      const encryptedSession = crypto.publicEncrypt(decodeURIComponent(pubKey), sessionKeyBuffer);
      group.encryptedSessions.set(pubKey, encryptedSession.toString());
      group.sessionKey = sessionKeyBuffer.toString();
      await group.save();
      callback(encryptedSession.toString());
    } else {
      callback(ret.encryptedSessions.get(pubKey));
    }
  } catch (e) {
    console.log(e);
    error();
  }
};
