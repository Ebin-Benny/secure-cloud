import { RepoContributions, UserRepos } from './data';
import { getRepoContributions as getContributions, getUserRepos as getUsers } from './requests';

export const getUserRepos = async (userName: string, callback: any, error: any) => {
  try {
    let ret = await UserRepos.findOne({ user: userName });

    if (!ret) {
      const data = new UserRepos();
      const dataTypes = ['size', 'stars', 'forks', 'issues'];
      const userRepos = await getUsers(userName);

      data.user = userName;
      for (const type of dataTypes) {
        let index = 0;
        data[type].name = userName;
        while (index < userRepos[type].children.length) {
          if (userRepos[type].children[index].language === undefined) {
            userRepos[type].children[index].language = 'N/A';
          }
          data[type].children[index] = {
            language: userRepos[type].children[index].language,
            name: userRepos[type].children[index].name,
            value: userRepos[type].children[index].value,
          };
          index++;
        }
      }

      await data.save();

      ret = await UserRepos.findOne({ user: userName });

      if (!ret) {
        error();
      } else {
        callback(ret);
      }
    } else {
      callback(ret);
    }
  } catch (e) {
    error();
  }
};

export const getRepoContributions = async (owner: string, repo: string, callback: any, error: any) => {
  try {
    let ret = await RepoContributions.findOne({ name: owner + '/' + repo });

    if (!ret) {
      const data = new RepoContributions();
      const repoContributions = await getContributions(owner, repo);

      data.name = repoContributions.name;

      let index = 0;
      for (const week of repoContributions.weeks) {
        let statIndex = 0;
        data.weeks[index] = { week: week.week, stats: [] };
        for (const stat of week.stats) {
          data.weeks[index].stats[statIndex++] = {
            additions: stat.additions,
            author: stat.author,
            commits: stat.commits,
            deletions: stat.deletions,
            net: stat.net,
          };
        }
        index++;
      }

      const dataTypes = ['totalAdditions', 'totalCommits', 'totalDeletions', 'totalNet'];
      for (const type of dataTypes) {
        index = 0;
        while (index < repoContributions[type].length) {
          data[type][index] = {
            name: repoContributions[type][index].name,
            stat: repoContributions[type][index].stat,
          };
          index++;
        }
      }

      await data.save();

      ret = await RepoContributions.findOne({ name: owner + '/' + repo });

      if (!ret) {
        error();
      } else {
        callback(ret);
      }
    } else {
      callback(ret);
    }
  } catch (e) {
    error();
  }
};
