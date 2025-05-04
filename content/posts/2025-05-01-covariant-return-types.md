---
title: Covariant types in C++ virtual methods
summary: Return types of methods-overrides may be different  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: 2025-05-01T22:47:09+02:00

tags: [C++]
---

Many years ago I saw a code like this and was quite pizzled:
`Derived::bar` overrides `Base::bar` even though the return types are different.

```cpp
class A {
public:
    virtual void hello() const { std::cout << "Hello from A" << std::endl; }
};

class B: public A {
public:
    void hello() const override { std::cout << "Hello from B" << std::endl; }
};

class Base {
public:
    virtual A* bar() { return &a; }
private:
    A a;
};

class Derived: public Base {
public:
    // return type is different
    B* bar() override { return &b; }
private:
    B b;
};
```

(see [the code on Compiler Explorer](<https://godbolt.org/#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:c%2B%2B,selection:(endColumn:12,endLineNumber:16,positionColumn:12,positionLineNumber:16,selectionStartColumn:12,selectionStartLineNumber:16,startColumn:12,startLineNumber:16),source:'%23include+%3Ciostream%3E%0A%23include+%3Cmemory%3E%0A%0Aclass+A+%7B%0Apublic:%0A++++virtual+void+hello()+const+%7B+std::cout+%3C%3C+%22Hello+from+A%22+%3C%3C+std::endl%3B+%7D%0A%7D%3B%0A%0Aclass+B:+public+A+%7B%0Apublic:%0A++++void+hello()+const+override+%7B+std::cout+%3C%3C+%22Hello+from+B%22+%3C%3C+std::endl%3B+%7D%0A%7D%3B%0A%0Aclass+Base+%7B%0Apublic:%0A++++virtual+A*+bar()+%7B+return+%26a%3B+%7D%0Aprivate:%0A++++A+a%3B%0A%7D%3B%0A%0Aclass+Derived:+public+Base+%7B%0Apublic:%0A++++B*+bar()+override+%7B+return+%26b%3B+%7D%0Aprivate:%0A++++B+b%3B%0A%7D%3B%0A%0A%0Aint+main()+%7B%0A++++Derived+d%7B%7D%3B%0A++++d.bar()-%3Ehello()%3B%0A%0A++++Base+%26b+%3D+d%3B%0A++++b.bar()-%3Ehello()%3B%0A%0A++++return+0%3B%0A%7D'),l:'5',n:'0',o:'C%2B%2B+source+%231',t:'0')),k:46.768507638072855,l:'4',n:'0',o:'',s:0,t:'0'),(g:!((g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'0',compiler:g142,compilerName:'',compilerOutShown:'0',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:c%2B%2B,libs:!(),options:'-std%3Dc%2B%2B17',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+x86-64+gcc+14.2+(C%2B%2B,+Editor+%231)',t:'0')),k:100,l:'4',m:45.26795895096921,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'0',compiler:clang1910,compilerName:'',compilerOutShown:'0',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:2,lang:c%2B%2B,libs:!(),options:'-std%3Dc%2B%2B17',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+x86-64+clang+19.1.0+(C%2B%2B,+Editor+%231)',t:'0')),header:(),k:100,l:'4',m:54.73204104903079,n:'0',o:'',s:0,t:'0')),k:53.231492361927145,l:'3',n:'0',o:'',t:'0')),l:'2',n:'0',o:'',t:'0')),version:4>))

Well, according to C++ standard it's absolutely valid and
[in line with the definition of _virtual_ methods](https://en.cppreference.com/w/cpp/language/virtual#In_detail)

> If some member function _vf_ is declared as `virtual` in a class Base, and some class Derived,
> which is derived, directly or indirectly, from Base, has a declaration for member function with the same
>
> - name
> - parameter type list (but not the return type)
> - cv-qualifiers
> - ref-qualifiers
> - Then this function in the class Derived is also _virtual_ (whether or not the keyword `virtual` is used in its declaration) and
>   overrides Base::vf (whether or not the specifier `override` is used in its declaration).

The most interesting part is that the return type doesn't have to be the same.

## Covariant types

This trick is called [Covariant return types](https://en.cppreference.com/w/cpp/language/virtual#Covariant_return_types):

> If the function Derived::f overrides a function Base::f, their return types must either be the same or be _covariant_.
> Two types are _covariant_ if they satisfy all of the following requirements:
>
> - both types are pointers or references (lvalue or rvalue) to classes. Multi-level pointers or references are not allowed.
> - the referenced/pointed-to class in the return type of Base::f() must be an unambiguous and
>   accessible direct or indirect base class of the referenced/pointed-to class of the return type of Derived::f().
> - the return type of Derived::f() must be equally or less cv-qualified than the return type of Base::f().

In the example above both `A*` and `B*` are pointers, `A` is a base class of `B`, and `A*` and `B*` have the same cv-qualifiers.
So, they're _coveriant_ types, and `Derived::bar` overrides virtual `Base::bar` method.

Even more, `Base::bar` may change the return type to `const A*`, and everything will
[continue to work](<https://godbolt.org/#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:c%2B%2B,selection:(endColumn:1,endLineNumber:28,positionColumn:1,positionLineNumber:28,selectionStartColumn:1,selectionStartLineNumber:28,startColumn:1,startLineNumber:28),source:'%23include+%3Ciostream%3E%0A%23include+%3Cmemory%3E%0A%0Aclass+A+%7B%0Apublic:%0A++++virtual+void+hello()+const+%7B+std::cout+%3C%3C+%22Hello+from+A%22+%3C%3C+std::endl%3B+%7D%0A%7D%3B%0A%0Aclass+B:+public+A+%7B%0Apublic:%0A++++void+hello()+const+override+%7B+std::cout+%3C%3C+%22Hello+from+B%22+%3C%3C+std::endl%3B+%7D%0A%7D%3B%0A%0Aclass+Base+%7B%0Apublic:%0A++++virtual+const+A*+bar()+%7B+return+%26a%3B+%7D%0Aprivate:%0A++++A+a%3B%0A%7D%3B%0A%0Aclass+Derived:+public+Base+%7B%0Apublic:%0A++++B*+bar()+override+%7B+return+%26b%3B+%7D%0Aprivate:%0A++++B+b%3B%0A%7D%3B%0A%0A%0Aint+main()+%7B%0A++++Derived+d%7B%7D%3B%0A++++d.bar()-%3Ehello()%3B%0A%0A++++Base+%26b+%3D+d%3B%0A++++b.bar()-%3Ehello()%3B%0A%0A++++return+0%3B%0A%7D'),l:'5',n:'0',o:'C%2B%2B+source+%231',t:'0')),k:46.768507638072855,l:'4',n:'0',o:'',s:0,t:'0'),(g:!((g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'0',compiler:g142,compilerName:'',compilerOutShown:'0',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:c%2B%2B,libs:!(),options:'-std%3Dc%2B%2B17',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+x86-64+gcc+14.2+(C%2B%2B,+Editor+%231)',t:'0')),k:100,l:'4',m:45.26795895096921,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'0',compiler:clang1910,compilerName:'',compilerOutShown:'0',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:2,lang:c%2B%2B,libs:!(),options:'-std%3Dc%2B%2B17',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+x86-64+clang+19.1.0+(C%2B%2B,+Editor+%231)',t:'0')),header:(),k:100,l:'4',m:54.73204104903079,n:'0',o:'',s:0,t:'0')),k:53.231492361927145,l:'3',n:'0',o:'',t:'0')),l:'2',n:'0',o:'',t:'0')),version:4>)
(because `B*` is less cv-qualified than `const A*`).

```cpp
class Base {
public:
    virtual const A* bar() { return &a; }
private:
    A a;
};

class Derived: public Base {
public:
    // return type is different
    B* bar() override { return &b; }
private:
    B b;
};
```

## Notes

I haven't seen this trick in production code since then, so its usefulness is questionable.

Potentially, it can be used to get the implementation of the interface from the interface itself
in places where the implementation class is accessible.
