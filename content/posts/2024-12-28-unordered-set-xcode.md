---
title: Unspecified behaviour in std::unordered_set and MacOS SDK
summary: Unspecified behaviour may vary between different STL implementations  # will be shown on a post card on the main page
description: Never assume unspecified behaviour in C++  # will be shown in the post as subtitle
date: '2024-12-28T16:00:11+01:00'
tags: [C++, XCode]
---

Let's look at a simple C++ program:

```cpp
#include <iostream>
#include <unordered_set>

void print(const std::unordered_set<int>& s) {
    for (const auto& n : s) {
        std::cout << n << ' ';
    }
    std::cout << std::endl;
}

int main() {
    const std::unordered_set<int> s{1, 2, 3, 4, 5};  // construct a set
    print(s);

    const std::unordered_set<int> s_1{s};  // copy the set
    print(s_1);

    return 0;
}
```

What will be the output of this program? Well, it depends on the STL implementation, because it's unspecified by the standard.

## 3 different types of behaviour

[C++ standard](https://eel.is/c++draft/) defines 3 types of _behaviour_:

- [undefined behaviour](https://eel.is/c++draft/defns.undefined): the standard gives no guarantees, anything can happen.
  The program may behave differently between different runs; even "your computer may explode".
  That's why it is one of the scariest beasts in C++.
- [unspecified behaviour](https://eel.is/c++draft/defns.unspecified): the standard delegates the guarantees to the implementation.
  In this case, the behaviour is defined and the program is predictable, but it may differ per implementation.
- [implementation-defined behavior](https://eel.is/c++draft/defns.impl.defined): same as "unspecified behaviour",
  but the implementation must document it.

[The copy constructor](https://en.cppreference.com/w/cpp/container/unordered_set/unordered_set) of `std::unordered_set`
doesn't specify the order of elements in the copy (because it's _unordered_ set), so every STL implementation may behave differently.
It is _unspecified_ behaviour.

## Assumptions are wrong

Let's make an experiment and compile this program with `gcc` and `clang` and see the output:

```bash
clang++ -std=c++14 main.cpp -o main && ./main
g++ -std=c++14 main.cpp -o main && ./main
```

I use [GodBolt Compiler Explorer](https://godbolt.org/#z:OYLghAFBqd5QCxAYwPYBMCmBRdBLAF1QCcAaPECAMzwBtMA7AQwFtMQByARg9KtQYEAysib0QXACx8BBAKoBnTAAUAHpwAMvAFYTStJg1DIApACYAQuYukl9ZATwDKjdAGFUtAK4sGIM6SuADJ4DJgAcj4ARpjEEgCcpAAOqAqETgwe3r7%2ByanpAiFhkSwxcVyJdpgOGUIETMQEWT5%2BAVU1AnUNBEUR0bEJtvWNzTltwz2hfaUDFQCUtqhexMjsHOYAzKHI3lgA1CYbbk4KBMSYrIfYJhoAgpvbu5gHR14MJFjn6AD6SgRXN3udwAbqg8Og9kliKECBA0AxTntTugQCA3h9Ypgfn9DsdBACzAA2JFzA4Adisdz21L2/GIezhAkRTC8RHMxIYexAJPJlNuNIFSIIKJQSwILzcuL2nNxUrAHD28sOfIFJjJABFAQLkai0KyJVKdSBXLRlYC1Zq7oCYXsWExQhBSWqVTT4YijejiJ8sb9MP8jjCrkjnVxSHsAnsNmHpHsAKwW5V7AD0Sb2brOXgceyYSL9WppUJhEAUczNVqprqZ4o97y9mOxeYD%2BI22CR3y4zoUCY2FmpKbTqCSAE89gQEM8cRXqYXBMX26We%2Bap3tzgRlpyNGX7hqOAtaJxY7w/BwtKRUJxJZZrEilitnpseKQCJpdwsANYgDZkgB0ZLJ8Q0AAODZJA2LgzFjMkNljfROEkI8XzPTheAUEANCfF8FjgWAYCgXCICQTBVGqVkSHISgGmABRlEMTBaCEBBUAAd2PR80BYJI6CYRwBBosJ6MYljEPYzj6DiYApACES6FicJWDWXhpLEgB5VkGOY49TyI6pbmIKjkMCYjkDqfBj14fhBBEMR2CkGRBEUFR1BPHQ9AMIwUGsax9DwKJUMgBZBx4hFOAAWmRQ51VMK9LC4R9UGBWJoSwPzHVIYg3kcNgABVUE8FKFgUW9Vj0ZFQj4uj1KE7heCY4gmCSTgeD3A8EOcpCOGwIzSPpVRAMJELCUkPZgGQZA9ikb8zAZS8rEsMNcEIEgDjMMC5l4Z9nLmd8QFjdD9w4eDSBYEBJFjSbCX/WNAPiXb4kJeIzFDTTeHPDgULQjDNtIbDEGNLqiDICgIEo6jaIEjTGsU1AOK4oLyvBqrTyUgZgEJGDkeIOS2AMjHVOEQTnsMnS9NQt6ieM4VQgMizhFEcRbJphy1EQ3Qozc4xPLm2gfPys8kiC0mwuFCKotmixYpehLiCSzBefSwQ8Gy3LaF5wrlmK0NSoYeHKtYmq6oa6rmo4Q9SEJ17OpIgG9l6/rBuG0a9kJb9Y2mzmbD2BbrYfNbPq0LbSHHJhPkobbdtgg7WtPV73vQjb/eNsxeGO07zsu67bvux6zcQmO/d3b78Pwwj/rIoGQZ1gnIdIJTuIySuIbajGUHZiouHQjGsYUmvodE2I8d1xDtOQXT9LJ4eTKpsmaas%2BnpEZpRmba3QAnZjzopsbnfPgAL%2BYyQXwo2SL3Yls8pZluWMsVzAcrynfFnVmyhlMhuqsfWr6sh43TfNzhLeQbqNs%2BoDSGjsQwwBxrxG/Fwb8Gg3Yb3mvgb2K0uC%2B3jq%2BQOFwQ6pQ/OHfah1jqxkkL%2BDYZgNCSHbpIACGwND/hzm1POqE46YULvAAif0rZlwoiTV%2Bese4wwMHDMGg8m69xknEMBRhdqhk7vJHGYiVJqSrm1Yeo9Sa8AnpTMydlabWQkPPWQTMnKnl0NINeosvJb15oFfeoVD7Hw3qfeKiVwSy3vvLTKN9laqyKk/LWvDq4f0Nk1COP9c5/1Lj1YB9tJEQLOhoaB8CxaIMWvSH261MILCDtgsOe04JRxegZJh%2BcA77STkdHaxCoJkIoeQ6htDEi/zJuggOH5CRmEmmQ%2BIXA0aEkAmSSQRJCQRw2AU9qGTNqJzGXnFpCwpZpGcJIIAA%3D%3D%3D) for this.
The page shows the output for `gcc-14.2` and `clang-19.1.0` (latest), and `gcc-6.5` and `clang-5.0.1` (some old versions).
In all cases the output is similar: both lines `print(s)` and `print(s_1)` produce the same output.

This gives us an assumption that copy constructor simply copies the underlying data structure and preserves the order of elements.
But this is wrong.

## MacOS

Let's switch to MacOS and XCode. XCode uses a dedicated `apple-clang` compiler and MacOS SDK provides
the STL implementation. Let's compile and run the same program (tested on XCode-15.0.1 with MacOS SDK 14.0 and XCode-15.3 with MacOS SDK 14.4):

```bash
clang++ -std=c++14 main.cpp -o main && ./main
5 4 3 2 1
1 2 3 4 5
```

Wow, the order of elements has changed. Looking into STL sources we'll see that copy constructor _inserts_ elements of the original set
into the copy:

```cpp
template <class _Value, class _Hash, class _Pred, class _Alloc>
unordered_set<_Value, _Hash, _Pred, _Alloc>::unordered_set(
        const unordered_set& __u)
    : __table_(__u.__table_)
{
    _VSTD::__debug_db_insert_c(this);
    __table_.__rehash_unique(__u.bucket_count());
    insert(__u.begin(), __u.end());
}
```

This might explain the change. Let's extend our program and copy the set a few more times:

```cpp
int main() {
    const std::unordered_set<int> s{1, 2, 3, 4, 5}; // construct a set
    print(s);

    const std::unordered_set<int> s_1{s};  // copy the set
    print(s_1);

    const std::unordered_set<int> s_2{s_1};  // copy the set
    print(s_2);

    const std::unordered_set<int> s_3{s_2};  // copy the set
    print(s_3);

    return 0;
}
```

Compile and run it:

```bash
clang++ -std=c++14 main.cpp -o main && ./main
5 4 3 2 1
1 2 3 4 5
5 4 3 2 1
1 2 3 4 5
```

The order of elements changes every time the set is copied. And that's perfectly valid according to the standard,
and this proves that **the original assumption was wrong**.

## Conclusion

Never assume an unspecified behaviour, even if everything seems reasonable and _some_ experiments prove the assumption.
The assumption itself may be wrong and any change to the setup may break it and thus break the program.

### The history behind the story

There was a collection defined as

```cpp
struct Collection {
  std::unordered_set<std::vector<int>> unique_ids;
}
```

This collection used _deep copy_ in copy-constructor, so every time the object is copied,
the underlying `unordered_set` is also copied (which caused the vectors to be re-ordered on MacOS).
This collection also implemented an iterator interface (as vector iterator),
and this object was used to construct a `vector` from `begin` and `end` iterators.

Everything worked fine until XCode got updated from 15.0.1 to 15.3, which caused MacOS SDK to be updated
from 14.0 to 14.4, which updated STL implementation. `std::vector` constructor started to copy input iterators less times,
which caused the `Collection` object (as iterator) to be copied even (not odd) amount of times,
so the `unordered_set` is copied even amount of times and its elements got re-ordered.
That broke the construction of the resulting `vector`.

Luckily there was a unittest that started to fail and allowed to debug and find this bug.
