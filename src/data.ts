import { Document, Model, model, Schema } from 'mongoose';
import { IGroups } from './models';

export interface IGroupsData extends Document, IGroups {}

const groupRepos = new Schema({
  name: String,
  encryptedSessions: [
    {
      publicKey: String,
      encryptedSession: String,
    },
  ],
  sessionKey: String,
});

export const UserRepos: Model<IGroupsData> = model<IGroupsData>('Groups', groupRepos);
