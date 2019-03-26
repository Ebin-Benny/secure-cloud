export interface IUserRepos {
  forks: ISizes;
  size: ISizes;
  stars: ISizes;
  issues: ISizes;
  user: string;
}

export interface ISizes {
  children: IRepoStat[];
  name: string;
}
interface IRepoStat {
  name: string;
  value: number;
  language: string;
}

export interface IRepoContributions {
  name: string;
  weeks: IWeek[];
  totalAdditions: ITotalStats[];
  totalDeletions: ITotalStats[];
  totalNet: ITotalStats[];
  totalCommits: ITotalStats[];
}

interface ITotalStats {
  name: string;
  stat: number;
}

interface IWeek {
  week: string;
  stats: IStats[];
}

interface IStats {
  author: string;
  additions: number;
  deletions: number;
  net: number;
  commits: number;
}
