---
title: Mysterious signed operand
summary: Integral promotion in action
date: 2025-04-24T19:09:05+02:00
tags: [C++]
---

I came across the following piece of C++ code:

```cpp
    const std::uint8_t mask = 0x06;
    std::uint8_t value = foo();

    if (mask & ~value) {
        // do something
    }
```

and SonarQube scan emitted [a warning](https://rules.sonarsource.com/cpp/tag/bad-practice/RSPEC-874/)
for this code:

```
    if (mask & ~value) {
        ^~~~~~~~~~~~~
        Do not apply "&" bitwise operator to a signed operand.
```

But, both `mask` and `value` are unsigned, so where does the _signed_ operand come from?

## Integral promotion

C++ language allows implicit conversion of integral types in some cases,
this is called [Integral promotion](https://en.cppreference.com/w/cpp/language/implicit_conversion#Integral_promotion):

> prvalues of small integral types (such as char) and unscoped enumeration types may be converted to
> prvalues of larger integral types (such as int). In particular,
> [arithmetic operators](https://en.cppreference.com/w/cpp/language/operator_arithmetic) do not accept types
> smaller than int as arguments, and integral promotions are automatically applied after lvalue-to-rvalue conversion,
> if applicable. This conversion always preserves the value.

And _bitwise NOT_ - `~` - is an [arithmetic operator](https://en.cppreference.com/w/cpp/language/operator_arithmetic),
so it will involve integral promotion:

> If the operand passed to a built-in arithmetic operator is integral or unscoped enumeration type,
> then before any other action (but after lvalue-to-rvalue conversion, if applicable), the operand undergoes integral promotion.

So, that's what happens:

1. `value` is promoted to `int`;
1. bitwise `~` operator is applied to `value` producing `int`;
1. `mask` is promoted to `int`;
1. bitwise `&` operator is called with two ints;

That's where signed operand comes from.

Interestingly, explicit cast of `~value` to `std::uint8_t` via `static_cast<std::uint8_t>(~value)` silences the SonarQube warning
(but does not remove the promotion).

[Compiler Explorer](https://godbolt.org/#z:OYLghAFBqd5QCxAYwPYBMCmBRdBLAF1QCcAaPECAMzwBtMA7AQwFtMQByARg9KtQYEAysib0QXACx8BBAKoBnTAAUAHpwAMvAFYTStJg1DIApACYAQuYukl9ZATwDKjdAGFUtAK4sGIAMzSrgAyeAyYAHI%2BAEaYxBIAbKQADqgKhE4MHt6%2BAdKp6Y4CoeFRLLHxXEl2mA6ZQgRMxATZPn6Btpj2RQwNTQQlkTFxibaNza25HQrjA2FD5SNVAJS2qF7EyOwc5v5hyN5YANQm/m7IM/iCp9gmGgCCu/uHmCdnTjPEmKw3d48PlxAIC8YQIAA4APoEI78VAQZYnADsVgeRzRRy%2BBA2DCOGlOKMeiIAIn8/qCjiwmGF4UiCeijmgGDMjoDgaDIdDKQoANZvIm41QaBL4v701kgwQco4ANzEXlep35sPhIoeovRrLQXmhpzcupOZjM6QAXphUFQILLvJhlorzGY3nqziy8KbzZa5TbHfrWa5aKr7mKCOggVqdWd9faTWaLQA/K3y23%2BEmG73O6Pu%2BOehG6n3BoF%2BgNBkModbhp1uA1G10xiBc3nmBJHLPWpMph259M1931g1NluJtOV30MdD%2B/wE9VozVlodVggAT2SmDw6AgA5tdtTncri%2BXq/XCZtADpmGwaTuWfmQIWJ6TUejMdjcQGTMSOKtaJwAKy8PwcLRSFQTg9UsawWXWTYFTMfweFIAhNA/VZuRABJ/GPb9EUNBJEQATjMDQNFwyRCKSL8OEkP9EKAzheAUEANHgxDVjgWAYEQG9VFqbUSHISgmmABRlEMLohAQVAAHd/zgtAWGSOgmB6YTwloMTJP/QDZPk%2Bh4mAKQzFILS6DiCJWG2XgjJ0gB5bU1Kk6jMC45B7mIQTaNIRzagaK53P4QQRDEdgpBkQRFBUdQAJ0PQDCMFBrGsfQ8GiejIFWVBkh6eiOAAWkuRVTDAywuERXhUGlOJiFXTAUvhUhiC8QQ8DYAAVVBPBq1YFEgrY9EuMJlNE8T7O4XgJOIJhkk4HhPx/KjIpojhsCcnjiCOVQwQSbKEkkI5gGQZAjikY8HQgUCrEsUgjlwQgSANWDll4BDIuWZCJEI/ROEo0gWBASRv2OnDcO/MEgaIhJ8K4UgNNK9z6MYp6tBY9iICQTzkBWviIAEoSRNUobpIs1A5IUpTcbs6HDKJ7SRgOQw9NwrhGMskyzPc5niBs4R8YcpyXLcjheDR7ywl82QAvEYK/PkJQ1Go3QDJi4x4ou2gko6oCMsyLLcuDfLlYsYrSvK4hKqwdX6salq2todWuo2HrIb6hgBrx9SptG8bJpGmaOF/KHqOAxblqIVb1s27aGUVw7cOPLhjw0I5Tv1y7rpDu6uAepjntWBBviweJapQxnGPIr6fu/SRj0RfwCMkRnJFwjR/A0PD/fmwO6IYrPEde/wEmPSQzERauCLwxvv1w4iPo4fw5sAjvu6Q6ezDnmGBcXl7SGN9JnEkIA%3D%3D)
gives the expected result:

```
sizeof(value)=1
sizeof(~value)=4
sizeof(mask & ~value)=4
typeid(~value)=i
```

So, be careful with arithmetic operators when applied to "small" integer types.
