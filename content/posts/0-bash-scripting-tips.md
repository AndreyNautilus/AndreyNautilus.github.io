---
title: Bash scripting tips
summary: EnvVars expansions, loops  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2026-09-03T23:57:25+02:00'
draft: true  # draft mode by default

tags: [bash, cheatsheet]
---

## Environment Variable expansions

https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameter-Expansion-1

## Loops

## stdout/stderr redirection

According to the [docs](https://tldp.org/LDP/abs/html/io-redirection.html):

- `CMD 1>/dev/null` - redirect **stdout** to `/dev/null`, keep **stderr** where it was;
- `CMD 2>/dev/null` - redirect **stderr** to `/dev/null`, keep **stdout** where it was;
- `CMD 2>&1` - redirect **stderr** to **stdout** (effectively merging them);

## Tips

trap

https://man7.org/linux/man-pages/man1/trap.1p.html
https://stackoverflow.com/questions/36335186/bash-exit-and-cleanup-on-error

IFS= read
