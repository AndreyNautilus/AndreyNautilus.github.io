---
title: Global .gitignore
summary: git config core.excludesFile defines global gitignore  # will be shown on a post card on the main page
description: Set global .gitignore file via core.excludesFile
date: 2024-12-24T19:02:34+01:00
tags: [git, gitconfig, gitignore]
---

In some setups we want to have a global `.gitignore` configuration for all repositories for a user:

- repositories don't have proper `.gitignore` file;
- you want to use a tool or IDE that creates temporary files, which are not ignored by the existing `.gitignore` file;

It's possible to configure local gitignore rules via `.git/info/exclude` file in a repository, but then the configuration has to be copied to all repos. That's not our way.

## Set core.excludesFile in gitconfig

[Git documentation](https://git-scm.com/docs/gitignore) explains how to configure gitignore rules globally via `core.excludesFile` config option. This option points to a file with regular gitignore patterns, that will be applied globally. By default this option points to `~/.config/git/ignore` file (see [the documentation](https://git-scm.com/docs/gitignore) for details).

So, we can use `~/.config/git/ignore` as global gitignore without any additional configurations.

But we can also configure this option explicitly to point to more obvious location, for example:

```bash
git config --global core.excludesFile "~/.gitignore"
```

which will add the following section to `~/.gitconfig` file:

```ini
[core]
        excludesFile = ~/.gitignore
```

And now we can use the full power of `includeIf` [constructions of git config file](https://git-scm.com/docs/git-config#_conditional_includes) to fine grain the gitignore patterns per folder/remote/branch, etc.
