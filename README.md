# Personal website

[![Push to Deploy](https://github.com/AndreyNautilus/AndreyNautilus.github.io/actions/workflows/push-to-deploy.yaml/badge.svg)](https://github.com/AndreyNautilus/AndreyNautilus.github.io/actions/workflows/push-to-deploy.yaml)
[![pages-build-deployment](https://github.com/AndreyNautilus/AndreyNautilus.github.io/actions/workflows/pages/pages-build-deployment/badge.svg?branch=deploy)](https://github.com/AndreyNautilus/AndreyNautilus.github.io/actions/workflows/pages/pages-build-deployment)

[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://github.com/pre-commit/pre-commit)
[![Static Badge](https://img.shields.io/badge/url-andreynautilus.github.io-blue)](https://andreynautilus.github.io/)

Powered by [Hugo](https://gohugo.io/getting-started/quick-start/) with [PaperMod theme](https://github.com/adityatelange/hugo-PaperMod) (as submodule).
[GitHub Pages](https://docs.github.com/en/pages) are deployed from `deploy` [branch](https://github.com/AndreyNautilus/AndreyNautilus.github.io/tree/deploy).

## Local commands

`hugo server` - run the server

`hugo server --bind=0.0.0.0 --baseURL=http://AAA.BBB.CCC.DDD:1313` - run the server and expose to local network
(where `AAA.BBB.CCC.DDD` is your local IP address)

`hugo server --buildDrafts` - run the server (including _draft_ content)

`hugo new content posts/my-post.md` - create a new post

## Local environment

- python 3.X
- `pre-commit install` to enable pre-commit hooks locally
