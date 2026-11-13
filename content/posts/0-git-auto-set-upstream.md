---
title: Set upstream branch automatically
summary: Various usages of --set-upstream in git push  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2026-11-12T00:26:11+01:00'
draft: true  # draft mode by default

tags: [git, gitconfig, fish]
---

Pushing a new branch to a remote in git is easy:

```
$ git push origin my-branch
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
To .\origin\
 * [new branch]      my-branch -> my-branch
```

but getting updates for it is a bit frustrating:

```
$ git pull
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
See git-pull(1) for details.

    git pull <remote> <branch>

If you wish to set tracking information for this branch you can do so with:

    git branch --set-upstream-to=origin/<branch> my-branch
```

Git doesn't know which branch to pull from the remote even though we've just pushed that branch.
We can use the proposed command (`git branch --set-upstream-to`) to set the upstream branch,
but what if I want git to be smarter?

## Option 1: set the upstream during push

Use `--set-upstream` [option](https://git-scm.com/docs/git-push#Documentation/git-push.txt---set-upstream)
when pushing:

```
$ git push --set-upstream origin my-branch
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
To .\origin\
 * [new branch]      my-branch -> my-branch
branch 'my-branch' set up to track 'origin/my-branch'.
```

Cons:

- we need to always remember to use this flag. There is a short `-u` form, but it's not very descriptive;
- this option _always_ overrides the mapping to the upstream branch
  (the output always contains this line);

## Option 2: create a git alias

Use the power of [git aliases](https://git-scm.com/book/ms/v2/Git-Basics-Git-Aliases):

```
git config --global alias.pushu 'push --set-upstream'
```

And then `git pushu origin my-branch` (note: `push` vs `pushu`) will use this alias.
You can come up with a better name for the alias.

If you're already using git aliases, this might be a good solution.

## Option 3: set `push.autoSetupRemote` in git config

git config has `push.autoSetupRemote` [option](https://git-scm.com/docs/git-config#Documentation/git-config.txt-pushautoSetupRemote)
which automatically adds `--set-upstream` to _default_ pushes.
According to the [documentation](https://git-scm.com/docs/git-config#Documentation/git-config.txt-pushdefault),
a _default_ push is

> Defines the action git push should take if no refspec is given

It works for `git push origin`, but doesn't work for `git push origin my-branch` -
which is an obvious con if you want to be explicit.

## Option 4: use shell magic

Bash aliases, fish shell abbreviations, etc. Many developers already use them in day-to-day work.

I use [abbreviations](https://fishshell.com/docs/current/cmds/abbr.html) in [fish shell](https://fishshell.com/),
they allow to run a custom function to expand the short name:

```fish
function abbr_git_push_origin --description "git push origin CURRENT_BRANCH_WITH_UPSTREAM"
    set CURRENT_BRANCH (git symbolic-ref --quiet --short HEAD 2>/dev/null)
    set UPSTREAM (git rev-parse --abbrev-ref --symbolic-full-name "@{upstream}" 2>/dev/null)
    if test -z "$UPSTREAM"
        set UPSTREAM_FLAG "--set-upstream "
    end
    echo "git push origin $UPSTREAM_FLAG$CURRENT_BRANCH"
end
abbr -a gpo --function abbr_git_push_origin
```

Type `gpo` and press Space to expand it:

{{< shell_abbreviation "gpo" "git push origin --set-upstream my-branch" >}}
