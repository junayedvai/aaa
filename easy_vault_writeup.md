# Easy Vault — Writeup

**Category:** Crypto
**Flag:** `bcsctf{h1gh_b1t5_0f_n0nc35_5h4773r_pr1v473_k3y5}`

## Challenge

We get two files. `encryptor.py` is the script that made the challenge. `ciphertext.json` holds its output: a DSA public key, 14 signatures and the encrypted flag. There is no server.

## Analysis

The script creates a random DSA private key `x`. The parameters are a 1024-bit `p` and a 160-bit `q`. It signs 14 messages (`dispatch/NN/receipt`). Then it encrypts the flag with a key derived from `x`:

```
key  = sha256(DOMAIN || x.to_bytes(20))
pad  = shake_256(key || salt)
flag = sealed XOR pad
```

So once we have `x`, we can decrypt the flag.

The bug is in `sign()`:

```python
"counter": hex(nonce >> BOTTOM_BITS),   # BOTTOM_BITS = 128
```

Each signature publishes the **top 32 bits of its nonce** `k`. Leaking part of a DSA nonce is enough to recover the private key. This is the Hidden Number Problem (HNP).

## Attack

For each signature:

```
s·k ≡ z + x·r (mod q)
k = c·2^128 + e,   0 ≤ e < 2^128   (c = counter)
```

Rearranging:

```
e ≡ (s⁻¹·r)·x + (s⁻¹·z − c·2^128)  (mod q)
e = A_i·x + B_i  (mod q)
```

Each `e_i` has 128 bits, but `q` has 160, so every equation leaks 32 bits about `x`. The 14 signatures leak 448 bits, far more than the 160 bits of `x`. A lattice can recover it easily.

To shrink the target vector, center each `e_i` by subtracting `2^127` from `B_i`. Then build this lattice, with `S = 2^32` so that all coordinates have similar size:

```
[ q·S                          0     0     ]
[      ...                                 ]
[           q·S                0     0     ]
[ A_1·S ... A_n·S              1     0     ]
[ B_1·S ... B_n·S              0     2^160 ]
```

The vector `(e_1·S, …, e_n·S, x, 2^160)` is in this lattice and is very short, since every entry is about 2^160. Running LLL/BKZ finds it. Read `x` from column `n`, and confirm it by checking `pow(G, x, P) == public`.

## Solver

```python
import json,hashlib,hmac,re
from fpylll import IntegerMatrix,LLL,BKZ
exec(re.search(r"P = .*?\nG = \d+",open('encryptor.py').read(),re.S).group())
d=json.load(open('ciphertext.json'))
A=[];B=[]
for t in d['transcript']:
    r=int(t['r'],16);s=int(t['s'],16);c=int(t['counter'],16)
    z=int.from_bytes(hashlib.sha256(t['message'].encode()).digest(),'big')%Q
    si=pow(s,-1,Q)
    A.append(si*r%Q);B.append((si*z-(c<<128)-(1<<127))%Q)
n=len(A);S=1<<32;M=IntegerMatrix(n+2,n+2)
for i in range(n):M[i,i]=Q*S;M[n,i]=A[i]*S;M[n+1,i]=B[i]*S
M[n,n]=1;M[n+1,n+1]=1<<160
BKZ.reduction(M,BKZ.Param(20))
pub=int(d['public'],16)
for row in M:
    for x in (row[n]%Q,-row[n]%Q):
        if pow(G,x,P)==pub:
            key=hashlib.sha256(b"BCSCTF-2026/nonce-vault/v1"+x.to_bytes(20,'big')).digest()
            salt=bytes.fromhex(d['salt']);ct=bytes.fromhex(d['sealed'])
            pad=hashlib.shake_256(key+salt).digest(len(ct))
            print(hmac.new(key,salt+ct,hashlib.sha256).hexdigest()==d['tag'],bytes(a^b for a,b in zip(ct,pad)));raise SystemExit
print("fail")
```

Run with `pip install fpylll cysignals`, then `python3 s.py`:

```
True b'bcsctf{h1gh_b1t5_0f_n0nc35_5h4773r_pr1v473_k3y5}'
```

The `True` means the HMAC tag matches, so the decryption is correct.

## Takeaway

In DSA and ECDSA, every bit of the nonce must stay secret and uniformly random. Leaking a few bits from each of several signatures, whether through logs, timing or a biased RNG, is enough to recover the private key with a lattice attack.
