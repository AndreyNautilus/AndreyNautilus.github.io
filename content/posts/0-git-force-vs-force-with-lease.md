---
title: 'git push --force vs --force-with-lease'
# description: "Short description"
date: 2024-05-07T20:36:19+02:00
draft: true  # draft mode by default
tags: ["git"]
---

## Why do we need to force-push?

rebasing + fixups.

## Example

Let's try to simulate this scenario locally.

### Initial setup

First, let's create a _remote_ (a _bare_ git repository):
```console
$ mkdir remote
$ cd remote
remote $ git init --bare
remote $ cd ..
```
Mr. Green clones the repository, configures the user,
initializes the `main` branch with and empty commit and pushes it to remote:
```console
$ mkdir green
$ git clone remote green
$ cd green

green $ git config --local user.name "Alex Green"
green $ git config --local user.email "alex.green@address.com"

green $ git commit -m "initial commit" --allow-empty
green $ git push origin main
```
Next, his co-worker, Mr. Red clones the repository and configures his user:
```console
$ mkdir red
$ git clone remote red
$ cd red

red $ git config --local user.name "Bob Red"
red $ git config --local user.email "bob.red@address.com"
```

### Actual example

Mr. Red creates a branch, makes a few changes and pushes the branch to remote:
```console
red $ git checkout -b feature_branch
red $ git commit -m "change from Red 1" --allow-empty
red $ git commit --fixup HEAD --allow-empty
red $ git push --set-upstream origin feature_branch
```
Mr. Red invites his co-worker - Mr. Green - to help. Mr. Green checks out `feature_branch`,
makes some changes and pushes the branch back to remote:
```console
green $ git pull
green $ git checkout feature_branch
green $ git commit -m "change from Green 1" --allow-empty
green $ git push origin feature_branch
```
The commit history looks as follows:
```console
green $ git log
commit 27d5ab05dedfe4d048438435b7705fc9762e210c (HEAD -> feature_branch)
Author: Alex Green <alex.green@address.com>
Date:   Tue May 14 21:07:52 2024 +0200

    change from Green 1

commit 25e5d3a32f6a48589a584b2b616cb77c501b63ee (origin/feature_branch)
Author: Bob Red <bob.red@address.com>
Date:   Tue May 14 21:06:10 2024 +0200

    change from Red 1

commit 2358086b6dcb430d4b3be5607ba473d9d3a0d397 (origin/main, main)
Author: Alex Green <alex.green@address.com>
Date:   Tue May 14 20:38:15 2024 +0200

    initial commit
```
In the meanwhile, Mr. Red continued to makes changes. Mr. Red didn't update the branch,
so he doesn't have the latest commit from Mr. Green:
```console
red $ git commit -m "change from Red 2" --allow-empty

red $ git log
commit c197614060226eefbeba6061c7868adc06c66950 (HEAD -> feature_branch)
Author: Bob Red <bob.red@address.com>
Date:   Wed May 15 00:12:17 2024 +0200

    change from Red 2

commit 25e5d3a32f6a48589a584b2b616cb77c501b63ee (origin/feature_branch)
Author: Bob Red <bob.red@address.com>
Date:   Tue May 14 21:06:10 2024 +0200

    change from Red 1

commit 2358086b6dcb430d4b3be5607ba473d9d3a0d397 (origin/main, origin/HEAD, main)
Author: Alex Green <alex.green@address.com>
Date:   Tue May 14 20:38:15 2024 +0200

    initial commit
```
Now, Mr. Red has a conflict in `feature_branch` with the remote branch, but he's not aware of it.
If Mr. Red tries to push the branch, it will fail:
```console
red $ git push origin feature_branch
To C:/Projects/git_push_force_example/remote
 ! [rejected]        feature_branch -> feature_branch (fetch first)
error: failed to push some refs to 'C:/Projects/git_push_force_example/remote'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```
If Mr. Red pushes the branch with `--force`, he will override the commit from Mr. Green, which is not desired.
