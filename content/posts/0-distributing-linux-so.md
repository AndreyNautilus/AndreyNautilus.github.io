---
title: Build linux shared libraries for distribution
# summary: "Post summary"  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2025-08-23T19:33:30+02:00'

# check for TBD before publishing
draft: true  # draft mode by default

tags: [C++, shared library, cmake]
---

Imagine we're making a C++ library. We need to deliver this library to a client,
and the agreement is to deliver it as _shared library_ for linux. How to do this?

Let's define the setup and assumptions:

- we use a fixed C++ standard, for example C++17;
- we develop on linux system using well-known compiler, like gcc or clang;
- we use cmake as build system (backed by make or ninja);
- we know how to build for the target platform (for example the client provides the toolchain);
- the target platform may be so different from the development platform,
  that the produced library doesn't run and requires an emulator.

Sample code for this page can be found [here](<>).

The setup includes:

- `libfoo` is the library we need to deliver;
- `app` is our internal developer app, that uses `libfoo`;

# Build

**Debug** - for development. No optimizations, debug symbols included.

**Release** -

**RelWithDebInfo** -

# Visibility of exported symbols

Shared libraries provide functionality via _exported dynamic symbols_.
If we build `libfoo`
in [Release mode](https://cmake.org/cmake/help/latest/variable/CMAKE_BUILD_TYPE.html) as shared:

```bash
cmake -DCMAKE_BUILD_TYPE=Release -DLIBFOO_SHARED=ON ..
cmake --build .  # build succeeds
ctest  # tests run successfully
```

we'll get `libfoo.so` as our shared library.
To list dynamic symbols we can use `nm` [tool](https://man7.org/linux/man-pages/man1/nm.1.html)
from `binutils` [package](https://www.gnu.org/software/binutils/):

```bash
$ nm --dynamic libfoo.so  # or "nm -D"
...
                 w _ITM_registerTMCloneTable
                 U _Unwind_Resume@GCC_3.0
00000000000012c0 T _ZN6libfoo3fooEv
00000000000013d0 T _ZN6libfoo4foo2Ev
0000000000001450 T _ZN6libfoo8internal12foo_internalB5cxx11Ev
                 U _ZNKSt5ctypeIcE13_M_widen_initEv@GLIBCXX_3.4.11
0000000000001440 W _ZNKSt5ctypeIcE8do_widenEc
                 U _ZNSo3putEc@GLIBCXX_3.4
                 U _ZNSo5flushEv@GLIBCXX_3.4
...
```

Looking at this list, there are 2 observations that raise questions:

1. this list contains "ugly" names instead of pretty C++ names. This is called
   [name mangling](https://en.wikipedia.org/wiki/Name_mangling) and compilers do this to C++ symbols
   to make them unique. We can add `--demangle` parameter to `nm` to get pretty symbols back:
   ```bash
   $ nm --dynamic --demangle libfoo.so  # or "nm -DC"
   ...
                    w _ITM_registerTMCloneTable
                    U _Unwind_Resume@GCC_3.0
   00000000000012c0 T libfoo::foo()
   00000000000013d0 T libfoo::foo2()
   0000000000001450 T libfoo::internal::foo_internal[abi:cxx11]()
                    U std::ctype<char>::_M_widen_init() const@GLIBCXX_3.4.11
   0000000000001440 W std::ctype<char>::do_widen(char) const
                    U std::ostream::put(char)@GLIBCXX_3.4
                    U std::ostream::flush()@GLIBCXX_3.4
   ...
   ```
   Another option is `c++filt` [tool](https://man7.org/linux/man-pages/man1/c++filt.1.html)
   from `binutils`: `nm --dynamic libfoo.so | c++filt`.
1. there are way too many symbols in the list including our internal symbols
   (`libfoo::internal::foo_internal`)
   and symbols from library dependencies (`std::ostream::flush()`). This happens because
   by default all symbols are visible and exported from dynamic libraries. Users of the library can
   try to use these symbols which is undesirable.
   We need to limit symbols visibility to keep the library API clean.

Let's inspect `nm` [output](https://man7.org/linux/man-pages/man1/nm.1.html).
Symbols with address as prefix are "real" symbols exported from the library.
Users that link against our library can use these symbols (call the functions) freely.
The second column is the _type_ of the symbol. What's importatnt for now:

- `U` means "undefined symbol" - the symbol comes from a dependency (note `@GLIBCXX_3.4` suffix);
- `T` means "in text section" - the symbol is exported from the library;
- `w`/`W` means "week symbol" - TBD;

Our goal is to have all symbols forming public API of our library marked as `T`,
and no other symbols should be marked `T`.

## Pass "version script" file to the linker

## Explicitly annotate exported symbols

A better way is to tell linker to hide all symbols by default and explicitly annotate symbols
we want to export. Use `-fvisibility=hidden` linker flag (or set `CXX_VISIBILITY_PRESET`
[cmake property](https://cmake.org/cmake/help/latest/prop_tgt/LANG_VISIBILITY_PRESET.html)) to make
all symbols hidden by default.

`__attribute__((visibility("default")))` annotation marks symbols for exporting.
We can use a macro to avoid typing it every time:

```c
#define PUBLIC_API __attribute__((visibility("default")))
PUBLIC_API void foo();
```

It's a common practice to annotate symbols in public header files, but these headers are also
usually shipped to a customer, and the customer doesn't need this annotation in their code.
This macro needs to be defined to nothing when used outside of our build system.
`cmake` automatically provides `<target>_EXPORTS`
[compiler definition](https://cmake.org/cmake/help/latest/prop_tgt/DEFINE_SYMBOL.html)
when a library is built as shared, so we can use it in our code:

```c
#ifdef foo_EXPORTS
#   define PUBLIC_API __attribute__((visibility("default")))
#else
#   define PUBLIC_API
#endif
PUBLIC_API void foo();
```

If we now build the library and inspect exported symbols:

```bash
cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=ON -DLIBFOO_API_VISIBILITY=ON ..
cmake --build .
nm --dynamic --demangle libfoo.so
...
                 U _Unwind_Resume@GCC_3.0
00000000000012a0 T libfoo::foo()
                 U std::ctype<char>::_M_widen_init() const@GLIBCXX_3.4.11
...
```

We'll see that only annotated symbols are exported.

**Pros**: the best approach to control API visibility, all exported symbols are explicitly
annotated. It's a conscious decision and low risk of mistakes.

**Cons**:

- public headers are "polluted" with `PUBLIC_API` macro, which is meaningless for the client;
- if different clients need to have access to different set of symbols,
  this approach requires bulky fine-tuning (for example, split API into categories and export
  different categories for different customers);

# Strip the binary

# Dependencies

```bash
$ readelf -d build/libfoo.so

Dynamic section at offset 0x3dd8 contains 27 entries:
  Tag        Type                         Name/Value
 0x0000000000000001 (NEEDED)             Shared library: [libstdc++.so.6]
 0x0000000000000001 (NEEDED)             Shared library: [libgcc_s.so.1]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so.6]
 0x000000000000000e (SONAME)             Library soname: [libfoo.so]
...
```

and

```bash
$ ldd build/libfoo.so
        linux-vdso.so.1 (0x00007ffd3cf77000)
        libstdc++.so.6 => /lib/x86_64-linux-gnu/libstdc++.so.6 (0x00007c8f91400000)
        libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x00007c8f916d6000)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007c8f91000000)
        libm.so.6 => /lib/x86_64-linux-gnu/libm.so.6 (0x00007c8f91319000)
        /lib64/ld-linux-x86-64.so.2 (0x00007c8f91703000)
```

# References

- [StackOverflow: What are CMAKE_BUILD_TYPE: Debug, Release, RelWithDebInfo and MinSizeRel?](https://stackoverflow.com/a/59314670/10286966)
- [Controlling the Exported Symbols of Shared Libraries](https://www.gnu.org/software/gnulib/manual/html_node/Exported-Symbols-of-Shared-Libraries.html)
