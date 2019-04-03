import crypto from 'crypto';
import AES from 'crypto-js/aes';
import fs from 'fs';
import NodeRSA from 'node-rsa';
import { Groups } from './data';
import { IGroups } from './models';

let privateKey;
export const startUp = async () => {
  const privateKeyString = await fs.readFileSync('./src/id_rsa', 'utf8');
  privateKey = new NodeRSA(privateKeyString);
};

export const createGroup = async (name: string, pubkey: string, callback: any, error: any) => {
  const userPubKey = new NodeRSA(pubkey);

  try {
    const ret = await Groups.findOne({ name, encryptedSessions: { $in: { encryptedSession: pubkey } } });

    if (!ret) {
      const group = new Groups();
      group.name = name;
      const sessionKeyBuffer = await crypto.randomBytes(32);
      const encryptedSession = userPubKey.encrypt(sessionKeyBuffer.toString());
      group.encryptedSessions[0].encryptedSession = encryptedSession;
      group.encryptedSessions[0].publicKey = pubkey;
      group.sessionKey = sessionKeyBuffer.toString();
      await group.save();
      callback(encryptedSession);
    } else {
      callback(ret.encryptedSessions);
    }
  } catch (e) {
    console.log(e);
    error();
  }
};
