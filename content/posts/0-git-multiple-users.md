---
title: git multiple users
summary: Configure multiple git users on the same workstation  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: 2024-05-20T20:24:48+02:00
draft: true  # draft mode by default

tags: [git]
---

## Multiple users with git

Quite often there is a need to have multiple git users on the same workstation.
For example:

- a user for working account;
- a user for personal account;

These accounts can be on different services (like GitHub, GitLab, BitBucket etc)
or on the same.

These users should have different name and email, and might need different configuration and
different authentication.

A simple solution would be to use repository-local (`git config --local`) configuration,
but that means "repeating it over and over again for every cloned repository".
This is not our way.

## gitconfig per directory

The main `~/.gitconfig` file:

```ini
[user]
    name = Alex Green
    email = alex.green@company.com

[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work

[includeIf "gitdir:~/personal/"]
    path = ~/.gitconfig-personal
```

A specialized `~/.gitconfig-work` contains dedicated configuration for your work account:

```ini
[user]
    signingkey = XXXXXXX

[gpg]
    program = gpg

[commit]
    gpgsign = true
```

While a personal `~/.gitconfig-personal` file contains/overrides configuration:

```ini
[user]
    name = Mr Green
    email = mr-green@personal.com
```

## ssh authentication

Most git services support ssh authentication, and it can be configured in the ssh client,
in `~/.ssh/config`:

```ssh
Host github.com
  IdentityFile ~/.ssh/github

Host bitbucket.com
  IdentityFile ~/.ssh/bitbucket
```
