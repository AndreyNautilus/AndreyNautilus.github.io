---
title: Keep 'git blame' clean
summary: Use .git-blame-ignore-revs file  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2025-08-23T19:44:29+02:00'
draft: true  # draft mode by default

tags: [git, gitconfig]
---

In the life of every big git repository there is a moment when a massive, yet simple change is required,
for example:

- adoption of a new code style, or enforcing a style over the entire repo;
- changing of a widely used common practice (like switching from
  [include guards](https://en.wikipedia.org/wiki/Include_guard) to
  [pragma once](https://en.cppreference.com/w/cpp/preprocessor/impl) in C++ code);
- a widely used file/function/dependency needs to be renamed;

These changes will "separate" the git history to _before_ and _after_ such massive commit,
making the use of `git blame` quite challenging.

## Ignore specific commits during blame

As usual, git has an option to workaround this. We can
[instruct](https://git-scm.com/docs/git-blame#Documentation/git-blame.txt---ignore-revrev) git
to ignore specific commits during blame operation:

```bash
git blame --ignore-rev 1dc479a9 -- filename
```

We can save full hashes of such commits into a file (let's call it `.git-blame-ignore-revs`):

```
1dc479a9f9876b4c095a1665e1f206ddc76acdc8  # adoption of a new code style
ANOTHER_COMMIT_HASH  # massive renaming
```

and pass this file to git:

```bash
git blame --ignore-revs-file .git-blame-ignore-revs -- filename
```

To avoid typing this parameter every time, it's possible to add it to the repo-local config.
Then git will pick this file for every `git blame` operation:

```bash
git config --local blame.ignoreRevsFile .git-blame-ignore-revs
git blame -- filename  # will automatically use .git-blame-ignore-revs file
```

> _Note_: if this option is added to the _global_ git configuration -
> `git config --global blame.ignoreRevsFile .git-blame-ignore-revs` - git will try to use this file
> for every repository in the system, and if a repository does not have this file, git will error out:
>
> ```
> git blame -- filename
> fatal: could not open object name list: .git-blame-ignore-revs
> ```

## Integrations

[GitHub](https://docs.github.com/en/repositories/working-with-files/using-files/viewing-and-understanding-files#ignore-commits-in-the-blame-view)
and [GitLab](https://docs.gitlab.com/user/project/repository/files/git_blame/#ignore-specific-revisions)
support `.git-blame-ignore-revs` file. It must be in the root of the repository and must have exactly this name.

It seems that [BitBucket doesn't support this](https://jira.atlassian.com/browse/BSERV-12730).
