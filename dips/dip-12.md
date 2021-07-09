---
dip: 12
title: Blockchain Coin Trade Flow
authors: Lu Zhang (@LuZhang-Lou)
dip manager: David Wolinsky (@davidiw)
status: Last Call
type: Informational
created: 3/5/2021
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Summary and Motivation
This document proposes a standardized method for coin trade flows in the Diem Network. The flow is generic for coin purchase and coin sell transactions. It supports single and batch settlements.

A Blockchain coin trade is the process where an entity, for example a Virtual Asset Service Provider (VASP), transacts with a Designated Dealer to purchase or sell coins. A coin trade usually involves several stages, such as
  1. trade initialization
  2. fiat currency (or other types of cryptocurrency) debited
  3. on-chain transfer.
 The first couple of steps are typically distinct to the parties involved. However, there are possibilities and benefits to generalize the on-chain phase, in pursuit of interoperability among Diem Blockchain participants.

# Terminology
* trade_id - a unified trade identifier used over the course. It is agreed upon, by both entities, during the trade initialization and negotiation phase. It should be unique for every trade between a buyer and a seller. It is represented by a UTF-8 string with a recommended maximum length of 255 characters.

# Specification
A new type of on-chain Metadata is proposed - `CoinTradeMetadata`.

```
enum Metadata {
  Undefined,
  GeneralMetadata(GeneralMetadata),
  TravelRuleMetadata(TravelRuleMetadata),
  UnstructuredBytesMetadata(UnstructuredBytesMetadata),
  RefundMetadata(RefundMetadata),
  CoinTradeMetadata(CoinTradeMetadata),
  /// and other types of metadatas
}

/// List of supported transaction metadata format versions for coin trade transaction
enum CoinTradeMetadata {
    CoinTradeMetadataV0(CoinTradeMetadatav0),
}

/// Transaction metadata format for coin trades (purchases/sells)
struct CoinTradeMetadataV0 {
    /// A nonempty list of trade_ids this transaction wants to settle
    trade_ids: Vec<String>,
}
```

`CoinTradeMetadata` holds a list of trade_ids that the coin transfer wants to settle. Refer to [Binary Canonical Serialization](https://github.com/diem/bcs#binary-canonical-serialization-bcs) for serialization/deserialization details.

<img alt="Coin Trade Flow" src={useBaseUrl('img/dip12-coin-trade-flow.png')} />

# Refund

To refund a coin trade, the [`RefundMetadata`](https://github.com/diem/dip/blob/master/dips/dip-4.md#refunds) should be used in on-chain payment. `transaction_version` should be the transaction version of the original payment. `reason` should be populated accordingly. The refund receiver (namely the original coin seller)  uses `transaction_version` to link it to the original payment and thus related coin trades.
