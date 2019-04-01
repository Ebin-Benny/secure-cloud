export interface IGroups {
  name: string;
  encryptedSessions: ISessions;
  sessionKey: string;
}

interface ISessions {
  publicKey: string;
  encryptedSession: string;
}
