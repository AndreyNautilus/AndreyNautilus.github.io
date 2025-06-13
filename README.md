# Personal website

[![Push to Deploy](https://github.com/AndreyNautilus/AndreyNautilus.github.io/actions/workflows/push-to-deploy.yaml/badge.svg)](https://github.com/AndreyNautilus/AndreyNautilus.github.io/actions/workflows/push-to-deploy.yaml)
[![pages-build-deployment](https://github.com/AndreyNautilus/AndreyNautilus.github.io/actions/workflows/pages/pages-build-deployment/badge.svg?branch=deploy)](https://github.com/AndreyNautilus/AndreyNautilus.github.io/actions/workflows/pages/pages-build-deployment)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://github.com/pre-commit/pre-commit)

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fandreynautilus.github.io%2F&label=andreynautilus.github.io)](https://andreynautilus.github.io/)
[![Static Badge](https://img.shields.io/badge/%D0%AF%D0%BD%D0%B4%D0%B5%D0%BA%D1%81.%D0%9C%D0%B5%D1%82%D1%80%D0%B8%D0%BA%D0%B0-FFCC00)](https://metrika.yandex.ru/)
[![Static Badge](https://img.shields.io/badge/Google_Analytics-757575?logo=googleanalytics)](https://analytics.google.com/)

Powered by [Hugo](https://gohugo.io/getting-started/quick-start/) with [PaperMod theme](https://github.com/adityatelange/hugo-PaperMod) (as submodule).
[GitHub Pages](https://docs.github.com/en/pages) are deployed from `deploy` [branch](https://github.com/AndreyNautilus/AndreyNautilus.github.io/tree/deploy).

## Local commands

`hugo server` - run the server on localhost

`hugo server --bind=0.0.0.0 --baseURL=http://AAA.BBB.CCC.DDD:1313` - run the server and expose it to local network
(where `AAA.BBB.CCC.DDD` is your local IP address). To get local IP address: `ipconfig` (on Windows),
find the correct adapter (Wi-Fi, Ethernet or something else) and take IPv4 Address.

`hugo server --buildDrafts` - run the server (including _draft_ content)

`hugo new content posts/my-post.md` - create a new post

## Local environment

- hugo (see `hugo_version.txt` for the version)
- python 3.9+
- `pre-commit install` to enable pre-commit hooks locally

### hugo installation/upgrade

**Win:** download `hugo_extended_***_windows-amd64.zip` from [hugo releases](https://github.com/gohugoio/hugo/releases),
unpack and add to `$PATH`.

**Theme init:** it's a submodule, so:

```bash
git submodule deinit -f --all  # clean the theme
git submodule update --init  # re-checkout the theme
```

**Theme update:**

```bash
git fetch
git checkout <LATEST_HASH>
```

## Windows terminal

- `Shift + Alt + '-'` split window horizontally
- `Shift + Alt + '+'` split window vertically
