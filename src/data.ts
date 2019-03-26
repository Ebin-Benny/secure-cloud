import { Document, Model, model, Schema } from 'mongoose';
import { IRepoContributions, IUserRepos } from './models';

export interface IUserReposData extends Document, IUserRepos {}
export interface IRepoContributionsData extends Document, IRepoContributions {}

const userRepos = new Schema({
  forks: {
    children: [
      {
        language: String,
        name: String,
        value: Number,
      },
    ],
    name: String,
  },
  issues: {
    children: [
      {
        language: String,
        name: String,
        value: Number,
      },
    ],
    name: String,
  },
  size: {
    children: [
      {
        language: String,
        name: String,
        value: Number,
      },
    ],
    name: String,
  },
  stars: {
    children: [
      {
        language: String,
        name: String,
        value: Number,
      },
    ],
    name: String,
  },
  user: String,
});

const repoContributions = new Schema({
  name: String,
  totalAdditions: [{ name: String, stat: Number }],
  totalCommits: [{ name: String, stat: Number }],
  totalDeletions: [{ name: String, stat: Number }],
  totalNet: [{ name: String, stat: Number }],
  weeks: [
    {
      stats: [{ author: String, additions: Number, deletions: Number, net: Number, commits: Number }],
      week: Number,
    },
  ],
});

export const UserRepos: Model<IUserReposData> = model<IUserReposData>('UserRepos', userRepos);
export const RepoContributions: Model<IRepoContributionsData> = model<IRepoContributionsData>(
  'RepoContributions',
  repoContributions,
);
