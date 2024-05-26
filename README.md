# Deployment branch

I'm using ["deploy from branch"](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
instead of "deploy from workflow artifact", because:
- branch shows the exact source that will be published (easier to troubleshoot);
- branch stores history in git (easier to rollback if needed);
- workflow artifacts can expire, while branch cannot;
