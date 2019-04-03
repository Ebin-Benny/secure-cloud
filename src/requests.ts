import crypto from 'crypto';
import { Groups, Users } from './data';

export const getEncryptedSession = async (name: string, pubKey: string, callback: any, error: any) => {
  try {
    const gret = await Groups.findOne({ name });
    const uret = await Users.findOne({ publicKey: pubKey });

    if (!gret) {
      const group = new Groups({ encryptedSessions: {} });
      group.name = name;
      const sessionKeyBuffer = await crypto.randomBytes(32);
      const encryptedSession = crypto.publicEncrypt(decodeURIComponent(pubKey), sessionKeyBuffer);
      group.encryptedSessions.set(pubKey, encryptedSession.toString());
      group.sessionKey = sessionKeyBuffer.toString();
      await group.save();
      if (!uret) {
        const user = new Users();
        user.publicKey = pubKey;
        user.groups = [name];
        await user.save();
      } else {
        uret.groups.push(name);
        await uret.save();
      }
      callback(encryptedSession.toString());
    } else {
      callback(gret.encryptedSessions.get(pubKey));
    }
  } catch (e) {
    error();
  }
};

export const addUser = async (name: string, adderKey: string, addedKey: string, callback: any, error: any) => {
  try {
    const gret = await Groups.findOne({ name });
    if (!gret) {
      error();
      return;
    }
    if (gret.encryptedSessions.get(adderKey) === undefined) {
      error();
      return;
    }

    const encryptedSession = crypto.publicEncrypt(decodeURIComponent(addedKey), Buffer.from(gret.sessionKey));
    gret.encryptedSessions.set(addedKey, encryptedSession.toString());
    await gret.save();

    const uret = await Users.findOne({ publicKey: addedKey });
    if (!uret) {
      const user = new Users();
      user.publicKey = addedKey;
      user.groups = [name];
      await user.save();
    } else {
      uret.groups.push(name);
      await uret.save();
    }
    callback();
  } catch (e) {
    error();
  }
};

export const leaveGroup = async (name: string, pubKey: string, signature: string, callback: any, error: any) => {
  try {
  } catch (e) {
    error();
  }
};
