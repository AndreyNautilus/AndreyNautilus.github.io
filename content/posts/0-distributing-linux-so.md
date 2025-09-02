---
title: Build linux shared libraries for distribution
summary: Build the library, strip debug info and manage symbols visibility
# description: "Short description"  # will be shown in the post as subtitle
date: '2025-08-23T19:33:30+02:00'

# check for TBD/TODO before publishing
# TODO: expose learning-playground/shared-linux-so
draft: true  # draft mode by default

ShowToc: true   # show table of content
TocOpen: true   # open table of content by default
tags: [C++, shared library, cmake]
---

Imagine we're developing a C++ library. We need to deliver this library to a client,
and the agreement is to deliver it as a _shared library_ for linux. How to do this?

Let's define the setup and assumptions:

- we use a fixed C++ standard, for example C++17;
- we develop on linux system using well-known compiler, like gcc or clang;
- we use cmake as build system (backed by make or ninja);
- we know how to build for the target platform (for example the client provides the toolchain);
- the target platform may be so different from the development platform,
  that the produced library doesn't run and requires an emulator.

The setup for our example project includes:

- `libfoo` is the library we need to deliver;
- `app` is our internal developer app, that uses `libfoo`;

The code of example project can be found [here](<>).

## Build configuration

`cmake` has a concept of [Build Configurations](https://cmake.org/cmake/help/latest/manual/cmake-buildsystem.7.html#build-configurations)
which controls what options are passed to the compiler.
There are [4 default configurations](https://stackoverflow.com/questions/48754619/what-are-cmake-build-type-debug-release-relwithdebinfo-and-minsizerel/59314670#59314670) -
`Debug`, `Release`, `RelWithDebInfo` and `MinSizeRel` -
and `CMAKE_BUILD_TYPE` [variable](https://cmake.org/cmake/help/latest/variable/CMAKE_BUILD_TYPE.html)
is configures this.

- **Debug** - for development use only. No optimizations, debug symbols included.
- **Release** - produces final deliverable binary. Optimized for speed, no debug info included.
- **RelWithDebInfo** - same as Release, but includes debug info. Debug info significantly increases
  the size of the binary, but also allows to analyze crash dumps.
- **MinSizeRel** - similar to Release, but optimized for binary size rather than speed.

We can consider shipping a library without debug info - built with Release or MinSizeRel configuration -
if we don't expect to receive and analyze crash dumps from our clients.
If we do need to investigate crashes, we need debug symbols, but we also need optimizations,
so RelWithDebInfo is our only option. But we don't want to ship debug symbols to customers.

The solution is to put debug info in a separate file.

### Strip the binary

`file` [command](https://man7.org/linux/man-pages/man1/file.1.html) or
`readelf` [tool](https://www.man7.org/linux/man-pages/man1/readelf.1.html)
from `binutils` [package](https://www.gnu.org/software/binutils/) can show if a binary contains debug info.
Let's build the library in RelWithDebInfo [mode](https://cmake.org/cmake/help/latest/variable/CMAKE_BUILD_TYPE.html):

```bash
cmake -DCMAKE_BUILD_TYPE=RelWithDebInfo -DBUILD_SHARED_LIBS=ON ..
cmake --build .  # build succeeds
```

and inspect it:

```bash
$ file libfoo.so
libfoo.so: ELF 64-bit LSB shared object, ..., with debug_info, not stripped
$ readelf --sections libfoo.so | grep debug
...
  [28] .debug_aranges    PROGBITS         0000000000000000  000030b5
  [29] .debug_info       PROGBITS         0000000000000000  00003145
...
```

`file` prints `with debug_info`, and `readelf --sections` shows debug sections, which means
the library contains debug symbols. If we would use `-DCMAKE_BUILD_TYPE=Release`, there would be
no debug sections in `readelf` and `file` wouldn't show `with debug_info`.

`objcopy` [tool](https://man7.org/linux/man-pages/man1/objcopy.1.html) from `binutils` can
copy debug info into a separate file:

```bash
objcopy --only-keep-debug libfoo.so libfoo.so.debug
objcopy --strip-debug --add-gnu-debuglink=libfoo.so.debug libfoo.so
```

`cmake` usually provides `CMAKE_OBJCOPY` [variable](https://cmake.org/cmake/help/latest/module/CPack.html#variable:CPACK_OBJCOPY_EXECUTABLE)
that points to `objcopy` executable. We can use it to add a custom command to our `cmake` target
and extract debug info during the build.

If we rebuild the library with `LIBFOO_STRIP=ON`:

```bash
# `LIBFOO_STRIP` is a custom option in the example project
cmake -DCMAKE_BUILD_TYPE=RelWithDebInfo -DBUILD_SHARED_LIBS=ON -DLIBFOO_STRIP=ON ..
cmake --build .  # build succeeds
```

and inspect the produced binary:

```bash
$ file libfoo.so
libfoo.so: ELF 64-bit LSB shared object, ..., not stripped
$ readelf --sections libfoo.so | grep debug
  [28] .gnu_debuglink    PROGBITS         0000000000000000  000030b8
```

`readelf` shows `.gnu_debuglink` section only which is a link to a file containing debug info
(caused by `--add-gnu-debuglink` option in the example project). `file` doesn't show `with debug_info`,
but still shows `not stripped` - this means that our binary still contains additional unneeded info -
`.symtab` section. It can be removed if `objcopy` is invoked with `--strip-unneeded` parameter instead of `--strip-debug`.

`cmake --install` has `--strip` [option](https://cmake.org/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-install-strip)
which performs such aggressive atripping during installation. If we use it after the build:

```bash
# `LIBFOO_STRIP` is a custom option in the example project
cmake -DCMAKE_BUILD_TYPE=RelWithDebInfo -DBUILD_SHARED_LIBS=ON -DLIBFOO_STRIP=ON ..
cmake --build .  # build succeeds
ctest
cmake --install . --prefix=../out --strip
```

and inspect the _built_ and _installed_ binaries, we'll see that _installed_ binary is finally stripped:

```bash
$ file libfoo.so
libfoo.so: ELF 64-bit LSB shared object, ..., not stripped
$ file ../out/lib/libfoo.so
../out/lib/libfoo.so: ELF 64-bit LSB shared object, ..., stripped
```

We need to save files with debug info (`libfoo.so.debug`) for every shipped binary, then we will be able
to analyze crashdumps that customers may send to us.

## Visibility of exported symbols

Shared libraries provide functionality via _exported dynamic symbols_.
If we build `libfoo` as shared
in Release [mode](https://cmake.org/cmake/help/latest/variable/CMAKE_BUILD_TYPE.html):

```bash
cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=ON ..
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
   by default all statically linked symbols are visible and exported from dynamic libraries.
   Users of the library can try to use these symbols which is undesirable.
   We need to limit symbols visibility to keep the library API clean.

Let's [inspect](https://man7.org/linux/man-pages/man1/nm.1.html#DESCRIPTION) `nm` output in more details.
Symbols with address in the first column are "real" symbols exported from the library.
Users that link against our library can use these symbols (call the functions) freely.
The second column is the _type_ of the symbol. What's importatnt for now:

- `U` means "undefined symbol" - the symbol comes from a dependency (note `@GLIBCXX_3.4` suffix);
- `T` means _global_ symbol "in .text section" - exported from the library.
- `t` also means a symbol "in .text section", but it's _local_ and not exported.
  `nm --dynamic` doesn't show them;
- `w`/`W` means "week symbol".
  When linking the final application, the linker will pick a non-week symbol over week symbols,
  and pick any week symbol if no non-week symbols exist. Typically, week symbols are
  default constructors/destructors and templates instantiations.
  They don't violate [ODR rule](https://en.wikipedia.org/wiki/One_Definition_Rule),
  and the linker will eliminate duplicates.

Our goal is to have all symbols forming public API of our library marked as `T`,
and no other symbols should be marked `T`.

### Pass "version script" file to linker

Widely used linkers (like GNU `ld` and `gold` or LLVM `lld`) support
[_version script_ files](https://man7.org/conf/lca2006/shared_libraries/slide18c.html)
via `--version-script` parameter. Version script files can be used to define visibility of symbols.
An example of such file to export symbols from `libfoo::` namespace only can look like this:

```
{
    global:
        _ZN6libfoo*;
    local:
        *;
};
```

This file uses _mangled_ symbol names, so you need know them upfront (by running `nm` for example).

To pass a version file to the linker we need to add `-Wl,--version-script=FILENAME` linker option
(or add this flag to `LINK_FLAGS` [property](https://cmake.org/cmake/help/latest/prop_tgt/LINK_FLAGS.html)
of the cmake target).
Let's build the library and inspect exported symbols:

```bash
# `LIBFOO_USE_VERSION_SCRIPT` is a custom option in the example project
cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=ON -DLIBFOO_USE_VERSION_SCRIPT=ON ..
cmake --build .
nm --dynamic --demangle libfoo.so
...
                 U _Unwind_Resume@GCC_3.0
00000000000012c0 T libfoo::foo()
00000000000013d0 T libfoo::foo2()
0000000000001450 T libfoo::internal::foo_internal[abi:cxx11]()
                 U std::ctype<char>::_M_widen_init() const@GLIBCXX_3.4.11
...
```

We see that only symbols from `libfoo::` namespace(s) are exported. But internal symbols
from `libfoo::internal::` namespace are also exported, which we want to avoid.

And here comes the problem: it's not possible to refine the filter by adding `libfoo::internal::*`
in the `local` section:

```
{
    global:
        _ZN6libfoo*;
    local:
        _ZN6libfoo8internal*;  # won't work :(
        *;
};
```

If a symbol matches any wild-star pattern in `global` section, this symbol
[will not be checked](https://maskray.me/blog/2020-11-26-all-about-symbol-versioning#version-script)
against patterns in `local` section.

One potential to overcome this limitation is to list all symbols we want to export explicitly,
but that's a tedious work. A script to fetch symbols from `nm` output can be handy,
but requires additional effort.

**Pros**: no code changes required. Configuration lives in a separate file
which can be dynamically created or adjusted.

**Cons**: limitation for visibility of nested namespaces.

### Explicitly annotate exported symbols

A better way is to tell linker to hide all symbols by default and explicitly annotate symbols
we want to export. Use `-fvisibility=hidden` linker flag (or set `CXX_VISIBILITY_PRESET`
[cmake property](https://cmake.org/cmake/help/latest/prop_tgt/LANG_VISIBILITY_PRESET.html)) to make
all symbols hidden by default.

`__attribute__((visibility("default")))` annotation
(for [GCC](https://gcc.gnu.org/onlinedocs/gcc/Common-Function-Attributes.html#index-visibility-function-attribute)
and [clang](https://clang.llvm.org/docs/LTOVisibility.html))
marks symbols for exporting. We can use a macro to avoid typing it every time:

```c
#define PUBLIC_API __attribute__((visibility("default")))
PUBLIC_API void foo();
```

It's a common practice to annotate symbols in public header files, but these headers are also
usually shipped to a customer, and the customer doesn't need this annotation in their code.
This macro needs to be defined to nothing when used outside of our build system.
`cmake` automatically provides `<target>_EXPORTS`
[compiler definition](https://cmake.org/cmake/help/latest/prop_tgt/DEFINE_SYMBOL.html)
when a library is built as shared, so we can use it:

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
# `LIBFOO_API_VISIBILITY` is a custom option in the example project
cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=ON -DLIBFOO_API_VISIBILITY=ON ..
cmake --build .
nm --dynamic --demangle libfoo.so
...
                 U _Unwind_Resume@GCC_3.0
00000000000012a0 T libfoo::foo()
                 U std::ctype<char>::_M_widen_init() const@GLIBCXX_3.4.11
...
```

we'll see that only annotated symbols are exported.

Don't forget to include public headers that define exported symbols into compilable files (`*.cpp/cxx/cc`).
If a header file is never included in any translation unit, it's not processed and effectively ignored.

**Pros**: all exported symbols are explicitly annotated. It's a conscious decision and low risk of mistakes.

**Cons**:

- public headers are "polluted" with `PUBLIC_API` macro, which is meaningless for the client;
- if different clients need to have access to different set of symbols,
  this approach requires bulky fine-tuning (for example, split API into categories and export
  different categories for different customers);

## Dependencies

Shared libraries as any other binaries may have dependencies on other shared libraries.
`readelf` [tool](https://www.man7.org/linux/man-pages/man1/readelf.1.html) can show what dependencies
our library has. Let's build `libfoo`:

```bash
cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=ON ..
cmake --build .  # build succeeds
```

and inspect the produced library:

```bash
$ readelf --dynamic libfoo.so
  Tag        Type                         Name/Value
 0x0000000000000001 (NEEDED)             Shared library: [libstdc++.so.6]
 0x0000000000000001 (NEEDED)             Shared library: [libgcc_s.so.1]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so.6]
 0x000000000000000e (SONAME)             Library soname: [libfoo.so]
...
```

`NEEDED` records are shared libraries that our library depends on.

Alternatively we can use `ldd` [tool](https://man7.org/linux/man-pages/man1/ldd.1.html)
to print all (including transitive) shared dependencies.
On the other hand, `ldd` is a runtime tool: it actually invokes the dynamic linker to find dependencies,
so it might not always work (for example if we're cross-compiling for armv8 architecture).

```bash
$ ldd libfoo.so
        linux-vdso.so.1 (0x00007ffc04386000)
        libstdc++.so.6 => /lib/x86_64-linux-gnu/libstdc++.so.6 (0x00007734bbc00000)
        libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x00007734bbe9e000)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007734bb800000)
        libm.so.6 => /lib/x86_64-linux-gnu/libm.so.6 (0x00007734bbb19000)
        /lib64/ld-linux-x86-64.so.2 (0x00007734bbeca000)
```

If our library depends on another _our_ library, we have to ship this dependency along with the library itself,
or we can link that dependency statically into our deliverable.
If we ship multiple dynamic libraries that depend on each other,
we need to properly configure `RPATH`/`RUNPATH`,
so the dynamic linker of the final app can find them.

**Note**: there's a very good talk
["how shared libraries are found"](https://www.youtube.com/watch?v=Ik3gR65oVsM) that explains
`RPATH`/`RUNPATH` handling.

General tip: try to to avoid dynamic dependencies between your shared libraries.

## ABI versioning via SONAME

`readelf --dynamic` shows `SONAME` record, which contains value similar to the filename of the shared library.
This value will be embedded into the client application as dynamic dependency, when the app is linked
against our library. Even though the app uses `libfoo.so` during build,
at runtime the app will look for a file with name taken from `SONAME` record of `libfoo.so`.

This mechanism is used to allow updates of libraries without rebuilding client applications.
Libraries that use ABI version management are usually shipped with symlinks, for example:

```bash
libfoo.so -> libfoo.so.1  # symlink
libfoo.so.1 -> libfoo.so.1.0.0  # symlink
libfoo.so.1.0.0  # actual library file
```

and `SONAME` record of this library contains `libfoo.so.1`.
When an app is linked against `libfoo.so`, the app will at runtime look for a file `libfoo.so.1`
(value of `SONAME` record). This allows the user of the app to update `libfoo` to version `1.0.1` or `1.1.0`
and the app will continue to work (as long as the update process updates symlinks:
`libfoo.so.1 -> libfoo.so.1.0.1`).
The user can even install multiple major versions of the same library (`1.1.0` and `2.0.0`) and
apps will be able to find the correct dependencies at runtime
(an app that depends on `libfoo.so.1` will find `libfoo.so.1.1.0` and another app that depends on `libfoo.so.2`
will find `libfoo.so.2.0.0`).

**Note**: it's the responsibility of the library authors to _actually_ maintain ABI compatibility.

In `cmake` this can be configured via `VERSION` and `SOVERSION` [properties](https://cmake.org/cmake/help/latest/prop_tgt/SOVERSION.html).
Let's build `libfoo`:

```bash
# `LIBFOO_VERSIONING` is a custom option in the example project
cmake -DCMAKE_BUILD_TYPE=RelWithDebInfo -DBUILD_SHARED_LIBS=ON -DLIBFOO_VERSIONING=ON ..
cmake --build .
```

and inspect the produced files:

```bash
$ ls -la *.so*
lrwxrwxrwx 1 user user     11 Sep  2 19:56 libfoo.so -> libfoo.so.1*
lrwxrwxrwx 1 user user     15 Sep  2 19:56 libfoo.so.1 -> libfoo.so.1.2.3*
-rwxr-xr-x 1 user user 106840 Sep  2 19:56 libfoo.so.1.2.3*
$ readelf --dynamic libfoo.so | grep SONAME
 0x000000000000000e (SONAME)             Library soname: [libfoo.so.1]
```

If an app is linked against `libfoo.so`, it will depend at runtime on `libfoo.so.`:

```bash
$ readelf --dynamic ./app
...
 0x0000000000000001 (NEEDED)             Shared library: [libfoo.so.1]
...
```

This might be useful if the shared library that we deliver may be updated on-the-fly,
and client apps must continue to work.
If the client app is used as a single package and library updates can't happen
(for example if our library is packaged in an Android application),
this versioning can be safely ignored.

## Usage

When clients want to use our library, they need to add the path to public headers of our library
to their include path and link against `libfoo.so`.

`cmake` provides [imported targets](https://cmake.org/cmake/help/latest/command/add_library.html#imported-libraries) for this purpose:

```cmake
add_library(foo SHARED IMPORTED)
set_target_properties(foo PROPERTIES
    IMPORTED_LOCATION path/to/libfoo.so
    IMPORTED_SONAME libfoo.so
)
target_include_directories(foo INTERFACE path/to/libfoo/headers)
```

`IMPORTED_SONAME` [property](https://cmake.org/cmake/help/latest/prop_tgt/IMPORTED_SONAME.html)
must match `SONAME` record in `libfoo.so`.
After that `foo` target can be used as any other target and can be linked against:

```cmake
target_link_libraries(app PRIVATE foo)
```

A more detailed client cmake project setup is out of scope for this page.

## References

- [StackOverflow: What are CMAKE_BUILD_TYPE: Debug, Release, RelWithDebInfo and MinSizeRel?](https://stackoverflow.com/a/59314670/10286966)
- [Controlling the Exported Symbols of Shared Libraries](https://www.gnu.org/software/gnulib/manual/html_node/Exported-Symbols-of-Shared-Libraries.html)
- [Stripped binaries (wiki)](<https://en.wikipedia.org/wiki/Strip_(Unix)>)
- [{{< builtin_icon "youtube" >}} C++ Shared Libraries and Where To Find Them](https://www.youtube.com/watch?v=Ik3gR65oVsM)
- [GNU Wiki: Visibility attribute](https://gcc.gnu.org/wiki/Visibility)
