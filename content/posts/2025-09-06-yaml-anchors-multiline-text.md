---
title: 'YAML: anchors and multiline text'
summary: "'>-' and '|' for multiline text; '&id' and '*id' for anchors; '<<: *anchor' to merge keys"
# description: "Short description"  # will be shown in the post as subtitle
date: '2025-09-06T22:37:49+02:00'

ShowToc: true   # show table of content
TocOpen: true   # open table of content by default

tags: [yaml, GitHub Actions]
---

YAML format is used in many config files, and here are a few tips to
make your yaml files look nicer.

## Multiline text values

YAML since version 1.1 (2005) support [_block indicators_](https://yaml.org/spec/1.1/#id926836)
to control how parser should handle multiline text.
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

```python
# python
{ "key": "very long text" }
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

```python
# python
{ "key": "command1\ncommand2\ncommand3\n" }
```

{{< /columns >}}

## Anchors

YAML since version 1.1 (2005) support [_anchors_](https://yaml.org/spec/1.1/#id899912):
a way to annotate a node for future reuse.
`&anchor` at the beginning of a node value declares an anchor, `*anchor` value is expanded as anchored node.
Use [YAML online parser](https://yaml-online-parser.appspot.com/) for experimenting.

Examples:

{{< columns >}}

```yaml
# original yaml
first-key: &config
  key: value
  list:
    - item1
    - item2
second-key: *config
```

NEW_COLUMN

```yaml
# parsed yaml
first-key:
  key: value
  list:
    - item1
    - item2
second-key:
  key: value
  list:
    - item1
    - item2
```

{{< /columns >}}

An anchor needs to be defined (`&anchor`) before it can be referenced (`*anchor`).
Anchors are useful when we need to repeat certain sections without copy-pasting them.

Recently GitHub Actions [added support of yaml anchors](https://github.com/actions/runner/issues/1182#issuecomment-3150797791),
but `actionlint` (a widely used [linter](https://github.com/rhysd/actionlint) for GitHub Actions)
[doesn't support](https://github.com/rhysd/actionlint/issues/133) them yet.

### Anchor limitations

Anchors are expanded as _entire node_, it's impossible to add/remove/change keys of a dictionary
or items in a list.

{{< columns >}}

```yaml
# INVALID
first-list: &items
  - item1
  - item2
second-list: *items
  - item3  # can't add items
```

NEW_COLUMN

```yaml
# INVALID
first-list: &mapping
  key1: value1
  key2: value2
second-list: *mapping
  key3: value3  # can't add key/values
```

{{< /columns >}}

If we need to extend a _mapping_, we can use "merge key" feature.

## Merge key Language-Independent Type

It's an [optional feature proposed](https://yaml.org/type/merge.html) for YAML 1.1
to merge multiple mappings defined by anchors into one node (`<<: *anchor`).

Example:

{{< columns >}}

```yaml
# original yaml
first-key: &config
  key: value
  foo: bar
second-key: &addon
  abc: xyz
target-1:
  <<: *config
  # add new key
  new-key: new value
  # override existing key
  key: another value
target-2:  # merge multiple mappings
  <<: [*config, *addon]
```

NEW_COLUMN

```yaml
# parsed yaml
first-key:
  key: value
  foo: bar
second-key:
  abc: xyz
target-1:
  key: another value  # overridden
  foo: bar
  new-key: new value  # addede
target-2:  # combined
  key: value
  foo: bar
  abc: xyz
```

{{< /columns >}}

Check your yaml framework for support. For example `PyYaml` and `ruaml.yaml` support merge keys.

Merge key feature does not allow to merge lists.

## References

- [YAML specs](https://yaml.org/)
- [YAML Multiline cheatsheet](https://yaml-multiline.info/)
- [YAML online parser](https://yaml-online-parser.appspot.com/)
