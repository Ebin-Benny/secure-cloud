export interface IGroups {
  encryptedSessions: ISessions;
  name: string;
  sessionKey: string;
}

interface ISessions {
  encryptedSession: string;
  publicKey: string;
}
