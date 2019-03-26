import Octokit from '@octokit/rest';
import fs from 'fs';
import { IRepoContributions, IUserRepos } from './models';
const octokit = new Octokit();
const token = fs.readFileSync('token.txt', 'utf8');

octokit.authenticate({
  token,
  type: 'token',
});
export const getUserRepos = async (username: string): Promise<IUserRepos> => {
  try {
    const result = await octokit.repos.listForUser({ username, type: 'all', per_page: 100 });
    const data = result.data;

    const userRepos: IUserRepos = {
      forks: {
        children: [],
        name: username,
      },
      issues: {
        children: [],
        name: username,
      },
      size: {
        children: [],
        name: username,
      },
      stars: {
        children: [],
        name: username,
      },
      user: username,
    };

    let index = 0;
    for (const repo of data) {
      userRepos.size.children[index] = {
        language: repo.language,
        name: repo.full_name,
        value: repo.size,
      };
      userRepos.stars.children[index] = {
        language: repo.language,
        name: repo.full_name,
        value: repo.stargazers_count,
      };
      userRepos.issues.children[index] = {
        language: repo.language,
        name: repo.full_name,
        value: repo.open_issues,
      };
      userRepos.forks.children[index++] = {
        language: repo.language,
        name: repo.full_name,
        value: repo.forks,
      };
    }
    return userRepos;
  } catch (e) {
    return Promise.reject();
  }
};

export const getRepoContributions = async (owner: string, repo: string): Promise<IRepoContributions> => {
  try {
    let result;
    do {
      result = await octokit.repos.getContributorsStats({ owner, repo });
      if (result.status !== 200 && result.status !== 202) {
        return Promise.reject(result.status);
      }
    } while (result.status === 202);

    const data = result.data;
    const repoContributions: IRepoContributions = {
      name: owner + '/' + repo,
      totalAdditions: [],
      totalCommits: [],
      totalDeletions: [],
      totalNet: [],
      weeks: [],
    };

    let index = 0;
    let weekCount = 0;
    for (const author of data) {
      weekCount = 0;
      for (const week of author.weeks) {
        if (index === 0) {
          repoContributions.weeks[weekCount] = {
            stats: [
              {
                additions: week.a,
                author: author.author.login,
                commits: week.c,
                deletions: week.d,
                net: week.a - week.d,
              },
            ],
            week: week.w,
          };
        } else {
          repoContributions.weeks[weekCount].stats[index] = {
            additions: week.a,
            author: author.author.login,
            commits: week.c,
            deletions: week.d,
            net: week.a - week.d,
          };
        }
        if (weekCount === 0) {
          repoContributions.totalAdditions[index] = { name: author.author.login, stat: week.a };
          repoContributions.totalDeletions[index] = { name: author.author.login, stat: week.d };
          repoContributions.totalNet[index] = { name: author.author.login, stat: week.a - week.d };
          repoContributions.totalCommits[index] = { name: author.author.login, stat: week.c };
        } else {
          repoContributions.totalAdditions[index].stat = repoContributions.totalAdditions[index].stat + week.a;
          repoContributions.totalDeletions[index].stat = repoContributions.totalDeletions[index].stat + week.d;
          repoContributions.totalNet[index].stat = repoContributions.totalNet[index].stat + (week.a - week.d);
          repoContributions.totalCommits[index].stat = repoContributions.totalCommits[index].stat + week.c;
        }
        weekCount++;
      }
      index++;
    }

    weekCount--;
    while (weekCount >= 0) {
      let commitCount = 0;
      for (const stat of repoContributions.weeks[weekCount].stats) {
        commitCount += stat.commits;
      }
      if (commitCount === 0) {
        repoContributions.weeks.pop();
      } else {
        break;
      }
      weekCount--;
    }
    return repoContributions;
  } catch (e) {
    return Promise.reject(e);
  }
};
