import { Document, Model, model, Schema } from 'mongoose';
import { IGroups } from './models';

export interface IGroupsData extends Document, IGroups {}

const groupRepos = new Schema({
  encryptedSessions: [
    {
      encryptedSession: String,
      publicKey: String,
    },
  ],
  name: String,
  sessionKey: String,
});

export const Groups: Model<IGroupsData> = model<IGroupsData>('Groups', groupRepos);
