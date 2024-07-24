---
title: 'Linux process memory: RSS, VSZ, etc'
summary: RSS, VSZ, PSS, USS explained  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2024-07-16T00:54:08+02:00'

tags: [linux]
aliases:
  - 04-linux-process-memory
---

Linux has multiple values that represent the amount of memory associated with a process:

- **RSS** or **Resident Set Size** or **RES** - total amount of physical memory associated with
  the process including all shared libraries.
- **PSS** or **Proportional Set Size** - similar to RSS, but shared libraries are counted
  proportionally: if a library is loaded by multiple (let's say 5) processes, associated memory will
  be distributed proporiaonally between them (each process will get 1/5 of the library memory). Sum of
  PSS values of all processes shows _total system usage_.
- **USS** or **Unique Set Size** - memory unique to the process. When the process is killed, this
  amount will be returned to the system.
- **VSS** or **Virtual Set Size** or **VSZ** - total accessible address space of a process including
  swapped memory and allocated, but not yet used.

## Examples

`top` [command](https://man7.org/linux/man-pages/man1/top.1.html) shows **VSS** (as VIRT) and **RSS** (as RES):

```
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  650 andrey    20   0    2892    932    840 S   0.0   0.0   0:00.00 sh
```

`ps -ux` [shows](https://man7.org/linux/man-pages/man1/ps.1.html) **VSS** (as VSZ) and **RSS**:

```
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
andrey     650  0.0  0.0   2892   932 pts/0    S+   Jul20   0:00 sh
```

## Links

For more details see:

- https://stackoverflow.com/questions/22372960/is-this-explanation-about-vss-rss-pss-uss-accurate
- https://2net.co.uk/tutorial/procrank
