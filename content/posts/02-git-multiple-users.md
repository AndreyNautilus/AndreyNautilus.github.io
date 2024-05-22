---
title: git with multiple users
summary: Configure multiple git users on the same workstation  # will be shown on a post card on the main page
description: "'includeIf' in gitconfig and ssh client configuration"
date: 2024-05-22T20:24:48+02:00
tags: [git]
---

## Multiple users for git

Quite often we need to have multiple git users on the same workstation. For example:

- a user for working account;
- a user for personal account;

These users should have different name and email, and might need different configuration and authentication.
Accounts for the users can be on different platforms (GitHub, GitLab, BitBucket etc) or on the same.

A simple solution would be to use repository-local (`git config --local`) configuration,
but this means _repeating it over and over again for every cloned repository_.
This is not an engineers way.

## gitconfig per directory

Git stores global configuration in `~/.gitconfig` [file](https://git-scm.com/docs/git-config#_configuration_file).
It's a text file which supports [conditional includes](https://git-scm.com/docs/git-config#_conditional_includes) via `includeIf` directive.
We're interested in `gitdir` condition, which includes the file if the current repository
(`.git` folder of the current repository) is in the specified directory.

So, we can nicely isolate all work-related repositories in `~/work` directory and all personal repositories in `~/peronal` directory.
For example, the main `~/.gitconfig` file looks like:

```ini
[user]
    name = Alex Green
    email = alex.green@company.com

[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work

[includeIf "gitdir:~/personal/"]
    path = ~/.gitconfig-personal
```

while `~/.gitconfig-work` enables gpg signing configuration for work account:

```ini
[user]
    signingkey = XXXXXXX

[gpg]
    program = gpg

[commit]
    gpgsign = true
```

and `~/.gitconfig-personal` redefines user name and email for personal account:

```ini
[user]
    name = Mr Green
    email = mr-green@personal.com
```

See:

```console
~/work/company-project $ git config --get user.name
Alex Green

~/personal/awesome-project $ git config --get user.name
Mr Green
```

## ssh authentication

Most git platforms ([GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh),
[GitLab](https://docs.gitlab.com/ee/user/ssh.html), BitBucket etc) support ssh authentication, and we can configure it
in `~/.ssh/config` [file](https://www.ssh.com/academy/ssh/config) of our ssh client:

```
Host github.com
  IdentityFile ~/.ssh/github

Host bitbucket.com
  IdentityFile ~/.ssh/bitbucket
```

Then both

- `git clone git@github.com:organization/repository.git`
- `git clone git@bitbucket.org:organization/repository.git`

work and use corresponding ssh keys.

### ssh authnetication for the same host

But what if we have multiple accounts on the same platform (both accounts are on GitHub for example)?
Well, ssh client doesn't know which key to use, so we need to tell it via different _host_.
We can configure the ssh client with artificial host for one of the accounts (for example for personal account):

```
Host github.com-personal
  IdentityFile ~/.ssh/github-personal

Host github.com
  IdentityFile ~/.ssh/github-work
```

Then `git clone git@github.com:organization/repository.git` will use `~/.ssh/github-work` key.

But in order to clone a repository using personal `~/.ssh/github-personal` key, we need to change the host in url _manually_
(note **`github.com-personal`** instead of `github.com`):

```
git clone git@github.com-personal:organization/repository.git
```

This means we can't use the "default" clone command
provided by the platform, we need to _manually_ adjust it.

**Hint**: it's generally more convenient to have the "default" configuration for the account
which is used to clone repositories more often, because we can use the "default" clone command from the platform.

Some references:

- https://stackoverflow.com/questions/67593657/setting-up-multiple-ssh-key-access-to-github
- https://gist.github.com/alejandro-martin/aabe88cf15871121e076f66b65306610
- https://gist.github.com/oanhnn/80a89405ab9023894df7

## Commit signing

Some platforms may require commit signing. I use a gpg key for that.
[GitHub documentation](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
explains how to set it up. We can also configure git to sign our commits by default:

```ini
[user]
    signingkey = XXXXXXX

[gpg]
    program = gpg

[commit]
    gpgsign = true
```
