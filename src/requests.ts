import crypto from 'crypto';
import { Groups, Users } from './data';

const fetch = require('isomorphic-fetch');
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: 'ywzAGqMCbBAAAAAAAAAAT2bHwmOTsYLJv0LcFUVYkUn6gOOwbPlWP3FIMZdhoFtr', fetch });
export const getEncryptedSession = async (name: string, publicKey: string, callback: any, error: any) => {
  try {
    const gret = await Groups.findOne({ name });
    const uret = await Users.findOne({ publicKey });

    if (!gret) {
      const group = new Groups({ encryptedSessions: {} });
      group.name = name;
      const sessionKey = await crypto.randomBytes(32);
      const encryptedSession = crypto.publicEncrypt(decodeURIComponent(publicKey), sessionKey);
      group.encryptedSessions.set(publicKey, encryptedSession.toString('hex'));
      group.sessionKey = sessionKey.toString('hex');
      await group.save();
      if (!uret) {
        const user = new Users();
        user.publicKey = publicKey;
        user.groups = [name];
        await user.save();
      } else {
        uret.groups.push(name);
        await uret.save();
      }
      callback(encryptedSession.toString('hex'));
    } else {
      callback(gret.encryptedSessions.get(publicKey));
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

    const encryptedSession = crypto.publicEncrypt(decodeURIComponent(addedKey), Buffer.from(gret.sessionKey, 'hex'));
    gret.encryptedSessions.set(addedKey, encryptedSession.toString('hex'));
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

export const leaveGroup = async (name: string, publicKey: string, signature: string, callback: any, error: any) => {
  try {
    const verify = crypto.createVerify('RSA-SHA256');
    if (!verify.verify(decodeURIComponent(publicKey), signature)) {
      error();
      return;
    }
    const gret = await Groups.findOne({ name });
    if (!gret) {
      error();
      return;
    }
    gret.encryptedSessions.delete(publicKey);
    const sessionKey = await crypto.randomBytes(32);
    gret.encryptedSessions.forEach((v, k, m) => {
      const encryptedSession = crypto.publicEncrypt(k, sessionKey);
      gret.encryptedSessions.set(k, encryptedSession.toString('hex'));
    });

    const files = await dbx.filesListFolder({ path: '/' + name + '/' });
    for (const f of files.entries) {
      const file = await dbx.filesDownload({ path: '/' + name + '/' + f.name });
      let iv = Buffer.alloc(16, 0);
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(gret.sessionKey, 'hex'), iv);
      decipher.setAutoPadding(false);
      const decrypted = decipher.update(file.fileBinary);
      const decryptedFinal = decipher.final();
      const decryptedBuffer = Buffer.concat([decrypted, decryptedFinal], decrypted.length + decryptedFinal.length);
      await dbx.filesDeleteV2({ path: '/' + name + '/' + f.name });
      iv = Buffer.alloc(16, 0);
      const cipher = crypto.createCipheriv('aes-256-cbc', sessionKey, iv);
      const encrypted = cipher.update(decryptedBuffer);
      const encryptedFinal = cipher.final();
      const encryptedBuffer = Buffer.concat([encrypted, encryptedFinal], encrypted.length + encryptedFinal.length);
      dbx.filesUpload({
        contents: encryptedBuffer,
        path: '/' + name + '/' + file.name,
        mode: { '.tag': 'overwrite' },
        autorename: true,
        mute: true,
        strict_conflict: false,
      });
    }

    gret.sessionKey = sessionKey.toString('hex');
    gret.save();
    callback();
  } catch (e) {
    console.log(e);
    error();
  }
};

export const getGroups = async (publicKey: string, callback: any, error: any) => {
  try {
    const uret = await Users.findOne({ publicKey });
    if (!uret) {
      error();
      return;
    }
    callback(uret.groups);
  } catch (e) {
    error();
  }
};
