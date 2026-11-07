---
title: 'DUKPT for Android developers: why every card tap gets its own key'
description: 'A plain-English primer on DUKPT, BDKs and key serial numbers for Android developers moving into POS and card payments, from someone who shipped them at Paytm.'
date: 2026-11-10
tags: ['payments', 'android', 'security']
draft: true # ✍️ Review and add your own Paytm experience, then set to false
---

When I moved onto Paytm's POS payments app, the first thing that confused me wasn't Android. It was the alphabet soup around card security: BDK, IPEK, KSN, DUKPT. None of it is hard once someone draws the picture, so here's the picture I wish I'd had.

## The problem DUKPT solves

A POS terminal reads a card PIN or card data and has to send it, encrypted, to a payment processor. The obvious approach is one secret key per terminal. The trouble is that terminals sit on shop counters. They get stolen, opened and probed. If an attacker extracts that one key, every transaction the terminal has ever sent, and will ever send, is exposed.

**DUKPT** (Derived Unique Key Per Transaction, defined in ANSI X9.24) fixes that by giving every single transaction its own encryption key, while the processor still needs to store only one secret.

## The three pieces

**BDK: Base Derivation Key.** The master secret. It never leaves the processor's or key-injection facility's hardware security module (HSM), and it is never stored on a terminal. One BDK can serve thousands of terminals.

**KSN: Key Serial Number.** A number sent in the clear with every transaction. It has two parts: an ID that identifies the terminal (and which BDK it belongs to), and a transaction counter that goes up by one on every transaction.

**IPEK: Initial PIN Encryption Key.** Derived from the BDK and the terminal's initial KSN, then injected into the terminal at a secure facility. This is the only key the terminal is born with.

## How a transaction key is born

1. The terminal starts from its IPEK and, using its current counter, derives a fresh key for this transaction.
2. It encrypts the PIN or card data with that key and sends the ciphertext plus the KSN.
3. Once a key is used, the terminal deletes it. Keys for future counter values are derived forward, so there is no way to walk backwards to old keys.
4. The processor reads the KSN, uses the BDK in its HSM to re-derive exactly the same transaction key, and decrypts.

The terminal never holds the BDK, and a key pulled out of a terminal today can't decrypt yesterday's transactions. That property, *forward secrecy per transaction*, is the whole point.

## What this means for you as the Android developer

You will almost never implement the derivation maths yourself. On a payments terminal it lives inside the secure element or the vendor's PIN pad SDK. What you *do* own:

- **Handling the KSN correctly.** It travels with every request and must reach the backend untouched. A truncated or reformatted KSN fails decryption in ways that look like random declines.
- **Never logging what you shouldn't.** Ciphertext and KSN are usually fine to log for debugging; PINs, track data and keys never are. Make your logging layer enforce this, not code review.
- **Planning for key changes.** Terminals get re-keyed, BDKs get rotated and algorithms get upgraded, for example from Triple DES towards AES under X9.24-3. Treat the key scheme as a version the app can migrate, with a rollout plan, not a constant.
- **Testing with real test keys.** Vendors and processors provide test BDKs and test cards. Use them on real hardware early; emulators won't show you a mismatched KSN.

<!-- ✍️ Add a short story here: what the encryption migration at Paytm involved and how you shipped it with zero issues. That's the part only you can write, and it's what makes people share the post. -->

## The one-line summary

DUKPT lets a processor keep one secret while every card tap on every terminal is encrypted with a key that's used exactly once. As an Android developer your job is to carry the KSN faithfully, keep secrets out of logs and treat key schemes as something you'll migrate one day.
