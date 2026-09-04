---
title: SSL certificates
# summary: "Post summary"  # will be shown on a post card on the main page
# description: "Short description"  # will be shown in the post as subtitle
date: '2026-09-04T00:07:10+02:00'
draft: true  # draft mode by default

tags: [ssl]
---

`openssl s_client -connect example.com:443 -servername example.com -verify_return_error -showcerts` - get the cert via `openssl` CLI;

`openssl x509 -noout -subject -issuer -dates < ams4-bk-tscs8148-z06m02.crt` - decode the cert from DER encoding (`*.pem/crt` file).

plan:
1. get the certificate from a host
2. decode the cert
3. cert chain
4. verification of the cert

5. custom CA
6. verify with custom CA
