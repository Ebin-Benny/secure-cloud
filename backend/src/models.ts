export interface IGroups {
  encryptedSessions: Map<string, string>;
  name: string;
  sessionKey: string;
}

export interface IUsers {
  publicKey: string;
  groups: string[];
}
