---
title: 'Linux process memory: RSS, PSS, USS'
summary: RSS, PSS, USS, etc. of linux processes    # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2024-07-16T00:54:08+02:00'

tags: [linux]
---

Linux has multiple values that indicate the amount of memory associated with a process:

- **RSS** or **Resident Set Size** - total amount of memory associated with the process including
  all shared libraries.
- **PSS** or **Proportional Set Size** - similar to RSS, but shared libraries are counted
  proportionally: if a library is loaded by multiple (let's say 5) processes, memory will be
  distributed proporiaonally between them (each process will get 1/5 of the library memory). Sum of
  PSS values of all processes show _total system usage_.
- **USS** or **Unique Set Size** - memory unique to the process. When the process is killed, this
  amount will be returned to the system.

Links:

- https://stackoverflow.com/questions/22372960/is-this-explanation-about-vss-rss-pss-uss-accurate
