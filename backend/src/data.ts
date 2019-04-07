import { Document, Model, model, Schema } from 'mongoose';
import { IGroups, IUsers } from './models';

export interface IGroupsData extends Document, IGroups {}

const groups = new Schema({
  encryptedSessions: {
    type: Map,
    encryptedSession: String,
  },
  name: String,
  sessionKey: String,
});

export interface IUserData extends Document, IUsers {}

const users = new Schema({
  publicKey: String,
  groups: [String],
});

export const Groups: Model<IGroupsData> = model<IGroupsData>('Groups', groups);
export const Users: Model<IUserData> = model<IUserData>('Users', users);
