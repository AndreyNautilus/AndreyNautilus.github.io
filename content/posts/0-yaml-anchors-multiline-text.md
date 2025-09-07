---
title: 'YAML: anchors and multiline text'
# summary: "Post summary"  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2025-09-06T22:37:49+02:00'
draft: true  # draft mode by default

tags: [yaml]
---

YAML format is used in many config files, and here are a few tips to
make your yaml files look nicer.

## Multiline text values

[YAML since version 1.1](https://yaml.org/spec/1.1/) support _flags_ to control
how parser should handle multiline text.
See [interactive demo](https://yaml-multiline.info/).

Examples:

`>-` means "treat single newline symbols (`'\n'`) as spaces (`' '`), and remove all newlines at the end"
(useful to put long description in a yaml key).

{{< columns >}}

```yaml
# yaml
key: >-
  very
  long
  text
```

NEW_COLUMN

```json
// json
"key": "very long text"
```

{{< /columns >}}

`|` means "keep newline symbols (`'\n'`) as they are" (useful when writing multiple commands
in a workflow for GitHub Actions ).

{{< columns >}}

```yaml
# yaml
key: |
  command1
  command2
  command3
```

NEW_COLUMN

```json
// json
"key": "command1\ncommand2\ncommand3\n"
```

{{< /columns >}}

## Anchors

## References

- [YAML Multiline cheatsheet](https://yaml-multiline.info/)
- [YAML online parser](https://yaml-online-parser.appspot.com/)
