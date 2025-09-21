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

[Examples](https://yaml-online-parser.appspot.com/?yaml=key-1%3A+%3E-%0A++very%0A++long%0A++text%0Akey-2%3A+%7C%0A++command1%0A++command2%0A++command3%0A&type=python):

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

[Example](https://yaml-online-parser.appspot.com/?yaml=first-key%3A%20%26config%0A%20%20key%3A%20value%0A%20%20list%3A%0A%20%20%20%20-%20item1%0A%20%20%20%20-%20item2%0Asecond-key%3A%20%2Aconfig&type=json):

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

[Example](https://yaml-online-parser.appspot.com/?yaml=first-key%3A+%26config%0A++key%3A+value%0A++foo%3A+bar%0Asecond-key%3A+%26addon%0A++abc%3A+xyz%0Atarget-1%3A%0A++%3C%3C%3A+*config%0A++new-key%3A+new+value%0A++key%3A+another+value%0Atarget-2%3A%0A++%3C%3C%3A+%5B*config%2C+*addon%5D&type=json):

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

## Type of values (the "Norway problem")

YAML defines types for values: string, number or boolean - sometimes using non-intuitive rules.
[For example](https://yaml-online-parser.appspot.com/?yaml=number1%3A+1%0Anumber2%3A+1.2%0Anumber3%3A+1.2.3%0Ano%3A+I%27m+false%0Aon%3A+I%27m+true&type=json),
`1` and `1.2` are numbers, while `1.2.3` is a string; but `no` and `on` are booleans
(`false` and `true` respectively).
This is called ["The Norway problem"](https://www.bram.us/2022/01/11/yaml-the-norway-problem/):
`NO` is [ISO country code 2 of Norway](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#NO);
`on:` is used in GitHub Actions to [list triggers](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#on).

{{< columns >}}

```yaml
# yaml
number1: 1
number2: 1.2
number3: 1.2.3
no: I'm false
on: I'm true
```

NEW_COLUMN

```json
{
  "number1": 1,
  "number2": 1.2,
  "number3": "1.2.3",
  "false": "I'm false",
  "true": "I'm true"
}
```

{{< /columns >}}

Wrapping values in quotes (`"1"`) will turn them into strings.

## References

- [YAML specs](https://yaml.org/)
- [YAML Multiline cheatsheet](https://yaml-multiline.info/)
- [YAML online parser](https://yaml-online-parser.appspot.com/)
