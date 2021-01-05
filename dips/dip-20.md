---
dip: 20
title: Diem On-Chain Currency Management
authors: Tim Zakian, Sam Blackshear
status: Draft
type: Informational
created: 08/28/2020
---

---
# Summary
---

This DIP describes the conceptual model and implementation of currencies on the Diem
blockchain. Currencies in Diem are represented statically at the type level, each
currency with a unique Move type. A type is treated as a currency in Diem
if and only if it has previously been registered as a currency on-chain. Once a currency
is registered it remains registered forever.

Every currency that is registered on-chain has metadata
associated with it at the time of registration. That metadata includes the currency code, value
held on-chain in the currency, and other relevant information[[1]](#registration_and_metadata). One of the most
important properties held in a currency's metadata is whether it is a Single Currency Stablecoin
(SCS), i.e., a fiat currency, or a synthetic currency that may consist of one or
multiple other currencies registered on-chain, e.g., ≋XDX.

On-chain, all assets with a value of `x` in a registered currency `C` are held as a "Diem Coin" resource
of type [`Diem<C>`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-diem)
with its `value` field set to `x`. Every Diem Coin has a certain set of
operations that may be performed on it and other coins of the same
currency[[2]](#general_currency_operations), and every registered currency possesses a
specific set of metadata about itself[[3]](#metadata_spec) that may be
queried[[4]](#currency_ops). All operations must be performed on a registered
currency type, with the exception of registration.

---
# <a name="requirements">Requirements</a>
---

This DIP describes the definition of currencies on-chain and their registration
process (in a technical setting), the representation of assets in a given
currency, and the operations that may be performed with registered currencies
and assets in a registered currency (or "Diem Coins").

The requirements for a currency in Diem are as follows:
1. *Privileged Registration*: The registration of a Move type as a currency
   on-chain is restricted to accounts with the
   [`RegisterNewCurrency` permission](https://github.com/diem/dip/blob/master/dips/dip-2.md#permissions).
2. *Privileged minting and burning*: Every on-chain currency must have a way
   for new coins to minted and burned from the system. Additionally, minting
   and burning of Diem Coins of any currency type must be a privileged action
   and tightly controlled yet also flexible in its specification for each
   currency that is defined. This is so that it can be used, e.g., to grant
   specific designated addresses the ability to mint coins of a specific
   currency, or to ensure that certain preconditions are met before coins are
   minted or burned.
3. *Explicit representation*: The representation of value in a currency is
   explicitly represented at the type level in Move. Move values that have a
   Diem Coin type of a given currency cannot be accidentally or purposefully
   misinterpreted as anything other than a coin in the given value and
   currency.
4. *Fungibility and correctness*: The way currencies may interact and be
   interchanged must always be well-defined. Any undefined or invalid behaviors
   such as trying to combine coins of different currency types must never be
   allowed, and error conditions well specified.
5. *Conservation, and encapsulation of value*: The value of a coin in
   circulation can never be accidentally or purposefully altered except through
   the specified operations defined in this document. Additionally, the
   `total_value` of all coins minted in a currency must equal the sum of the
   values of all coins in circulation in that currency no matter the operations
   performed, with the exception of minting and burning operations.
6. *Value normalization*: Every currency must have a way to _roughly_ normalize
   its value to a specified currency so that values expressed across different
   currencies may be compared for use in the system. In Diem, this specified
   currency is ≋XDX.

The Diem currency management on-chain is designed to provide a common interface that can
be used for any currency that ensures that these key properties are kept.

---
# <a name="registration_and_metadata">Registration of Currencies and Currency Metadata</a>
---

Every currency on-chain is represented as a Move-defined type `C`. This type can be
either a resource or struct type. In order for the system to view a type `C` as
representing a currency on-chain, it must first be _registered_ as such. This may be done by
calling one of either [`Diem::register_SCS_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_scs_currency)
or [`Diem::register_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_currency)
instantiated with the type `C` that is to be registered as a new SCS or synthetic currency respectively.

## <a name="metadata_spec">Required information for registration of a currency and metadata</a>

When a currency is registered using these functions, a number of metadata need to be
provided about the currency that is being registered. In particular, every registered
currency on-chain contains the following data, names in bold are metadata that must be
provided at the time of registration:

| Name                          | Type                                   | Mutable      | Description                                                                                                                                      |
| ----------------------------- | -------------------------------------- | ------------ | -----------------------------------------------------------------------------------------------------------------------                          |
| **to_xdx_exchange_rate**      | FixedPoint32                           | true         | The _rough_ exchange rate from `C` to XDX. Used only for dual attestation threshold and mempool gas price normalization                          |
| **is_synthetic**              | bool                                   | false        | Whether `C` is a synthetic currency or not (if false, then it is an SCS currency). Informational only with the except for its effects on events. |
| **scaling_factor**            | u64                                    | false        | The scaling factor that a coin's value in `C` should be multiplied by to arrive at the off-chain "real world" value                              |
| **fractional_part**           | u64                                    | false        | The smallest fractional part (number of decimal places) to be used in the human-readable representation of the currency                          |
| **currency_code**             | vector\<u8\>                           | false        | The currency code (e.g., "XDX") for `C`                                                                                                          |
| total_value                   | u128                                   | true         | The total value of all currency in circulation on-chain, initialized to zero                                                                     |
| preburn_value                 | u64                                    | true         | The total value of all coins in this currency waiting to be burned                                                                               |
| can_mint                      | bool                                   | true         | Whether more value in this currency can be added to circulation                                                                                  |

All of the metadata about a specific currency `C` is held as part of the
[`CurrencyInfo<C>`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-currencyinfo)
resource that is uniquely published for each registered currency type `C` under the [Diem Root](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles) (see also the implementation of
[`Diem::register_SCS_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_scs_currency)
and
[`Diem::register_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_currency))
account address. We now describe each of these data and their purpose.

### <a name="to_xdx_exchange_rate">`to_xdx_exchange_rate`</a>

There are certain cases where values in two different currencies need to be
compared against each other. This exchange rate is used to normalize both values to their
approximate ≋XDX value so that their values may be compared. In particular:
* Transactions can set their gas price in different currencies, however transactions
  need to be ranked against each other based upon their gas prices. This field is used by
  the rest of the system to normalize gas prices to one single "unit" for comparison and
  ranking purposes.
* The dual attestation threshold needs to apply to payments in all currencies. This limit is set in
  terms of ≋XDX, transfers are first normalized using this exchange rate and then compared
  against the limit.

#### Mutability
The initial exchange rate to ≋XDX must be provided at the time of registration. The
exchange rate may be [updated](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-update_xdx_exchange_rate)
by an account with the [Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles) to correspond to
fluctuations in the real-time exchange rate between the specified currency `C` and
≋XDX. Note that this is not meant to be an exact exchange rate and _should not_ be used for
determining exchange rates for value transfer between different currencies.

### `is_synthetic`

This defines whether the given currency is synthetic or an SCS. In the case of
[`Diem::register_SCS_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_scs_currency)
the function sets this to `false`. For
[`Diem::register_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_currency)
this must be provided to the function.

#### Mutability
Immutable

### <a name="scaling_factor">`scaling_factor`</a>

This defines what fraction each unit of value on-chain represents in the
off-chain representation of the currency. As an example, if the on-chain
unit of value in a currency `C` is one millionth of `C`'s smallest real-world
unit of value, `C`'s `scaling_factor` would be `1,000,000`, since each on-chain
unit of value is `1/1,000,000` of the smallest real-world unit of value
representation for `C`.

### `fractional_part`

This defines the rounding that needs to be performed when transferring from the on-chain
representation to the smallest denomination real-world coin for that currency off-chain.
For example, if an SCS `C` has a scaling factor of `1,000,000` but the smallest
denomination real-world coin for `C` is 100'th of a `C`, then the
`fractional_part` for `C` would be `100`.

#### Mutability
Immutable

### `currency_code`

The currency code is specified at the time of registration of the currency. In addition to
being recorded here for use by clients to determine the correct (human readable) currency code to use to
display the currency, this is also registered in a global set of registered currency codes
for off-chain use.

#### Mutability
Immutable

### <a name="total_value">`total_value`</a>

This field holds the current value of all coins in circulation on-chain in the given currency.

#### Mutability

This field's value remains constant with the exception of minting and burning operations from the
system. Details on these operations and how they effect the `total_value` for the currency
are given in the section on [minting and burning of value](#minting_and_burning) from the
system.

### `preburn_value`

This field holds the value of all coins currently slated to be burned from the
system as detailed in the [Preburning](#pre_burning) section.

#### Mutability

This field's value remains constant with the exception of burning operations as detailed in the section
on [minting and burning of value](#minting_and_burning) from the system.

### <a name="can_mint">`can_mint`</a>

This specifies whether additional value in the specified currency may be added
to the system. Coins in the currency can be burned from the system, accounts may hold balances
in the currency, and payments can be made in the currency regardless of the
value of this field.

#### Mutability

This field is only updatable through the
[`Diem::update_minting_ability`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-update_minting_ability)
function, and must be done by an account with the [Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles).

## Capabilities Created at Registration

Whenever a type `C` is registered as a currency, a
[`MintCapability<C>`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-mintcapability)
and
[`BurnCapability<C>`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-burncapability),
are created. If the currency is registered using the
[`Diem::register_SCS_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_scs_currency)
function, both of these capabilities are stored under the Treasury Compliance account at address
`0xB1E55ED`. In the case that the [`Diem::register_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_currency)
is used to register the currency both of these capabilities are returned to the caller, which may store them in other structures.
The `MintCapability` and `BurnCapability` for each currency are [unique](https://github.com/diem/dip/blob/master/dips/dip-2.md#permissions); after
registration of a currency no future mint and burn capabilities for the currency may be created.

## On-chain list of registered currencies

Whenever a currency is registered on chain, its currency code is added to the
[`RegisteredCurrencies` on-chain config](https://github.com/diem/dip/blob/master/dips/dip-6.md#registered-currencies).
The list of currency codes registered on-chain is always a set, and attempting to
register a currency with an already taken currency code will fail. There are some
[restrictions on the format and length of currency codes](#operational_things)
that need to be considered from the on-chain perspective when choosing a
currency code.

---
# <a name="coin_value_representation">Representation of Value</a>
---

All assets in a currency `Currency` with a specific value are represented on-chain as a
Diem Coin with the specified value, which has the following form:

```rust
resource struct Diem<Currency> {
    value: u64,
}
```

Where the `value` field of the coin is represented in the "base units" for `Currency` as defined by
the [`scaling_factor`](#scaling_factor) for `Currency`.

It is important to note that in the system any value of type `Diem<Currency>` is considered a
valid asset in the `Currency` currency with its value given by the `value` field.  Therefore the
minting of any non-zero value of this type needs to be considered a privileged operation
since it represents minting of value on-chain. Additionally, this is an if-and-only-if
relation; a value represents a specific amount `v` in a given currency `Currency`, if, and only
if the value has the type `Diem<Currency>`.

---
# <a name="minting_and_burning">Minting and Burning of Value</a>
---

Since the minting and burning of Diem Coins on-chain represent the changes to
the total value held on the network, any changes to the total on-chain "market
capitalization" are considered highly privileged operations. Additionally, the total
on-chain capitalization of the system for a specific currency is recorded on-chain in the
[`total_value`](#total_value) metadata field for each currency.

Recall that the [minting of coins needs to be tightly controlled](#minting). The burning of coins
the network similarly needs to be controlled to reduce off-chain counterparty risk between any off-chain
reserves, and the owner of the coins that are to be burned. In particular, the burning process
needs to ensure that once the transfer of assets off-chain has begun between the any off-chain reserve
and the owner of the Diem Coins to be burned, that the Diem Coins in question cannot be
re-introduced to circulation on-chain without the authorization of the party
responsible for burning the coins.

To facilitate the burning process and prevent the re-introduction of Diem Coins into circulation whose backing
assets have already been (or are in the process of being) transferred off-chain, any Diem Coins that are to be removed
must first be placed into an association-controlled escrow, or
[Preburn resource](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-preburn).
Once Diem Coins have been [placed into such a preburn resource](#pre_burning) an account with the appropriate
[`BurnCapability`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-burncapability)
for the currency of the coins may then [remove them from the system](#burning) once the appropriate
off-chain actions (if any) have been performed.

The specific set of operations that may be performed that relate to minting, preburning,
and burning of Diem Coins are as follows:

### <a name="minting">Minting</a>

Diem Coins in a currency `C` with a non-zero value may be created by calling

```rust
public fun mint_with_capability<C>(value: u64, capability: MintCapability<C>): Diem<C>
```

A reference to the `MintCapability<C>` resource for the currency being minted
must be passed-in to this function as a witness of having the privilege to mint
coins in the specific currency.

Additionally, non-zero-value coins for SCS currencies can be minted by calling

```rust
public fun mint<C>(value: u64): Diem<C>
```

The `mint` function may only be called by an account with the
[Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles)
that has a `MintCapability<C>` resource published under it. Recall that only
one mint capability resource is created for a currency when it is
registered.

#### Reference Implementations
1. [`Diem::mint_with_capability`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-mint_with_capability)
2. [`Diem::mint`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-mint)

### <a name="pre_burning">Pre-burning</a>

In order to remove coins from circulation, they must first be moved to a preburn area.
The movement of coins to a specific preburn area will emit [events](#currency_events)
that may be used to initiate the off-chain transfer of backing funds for those coins.

Funds may be moved to a preburn area only by an account that has access to a
[Preburn capability](https://github.com/diem/dip/blob/master/dips/dip-2.md#permissions)
resource for the currency in question. This action may be performed by calling either

```rust
public fun preburn_with_resource<C>(coin: Diem<C>, preburn: &mut Preburn<C>, preburn_address: address)
```

where the passed in `Preburn<C>` resource is stored under `preburn_address`, or calling

```rust
public fun preburn_to<C>(account: &signer, coin: Diem<C>)
```

where `account` has a `Preburn<C>` resource published under it.

A `Preburn` resource can only be created by an account with the
[Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles)
by calling either the `create_preburn` function

```rust
public fun create_preburn<C>(account: &signer): Preburn<C>
```

and storing the `Preburn` resource returned by this function in a different module's resource. Or, by
calling the `publish_preburn_to_account` function and passing in the signer for
the `account` under which the created preburn resource will be stored along with a
signer proving authority to create a preburn resource

```rust
public fun publish_preburn_to_account<C>(account: &signer, tc_account: &signer)
```

The `account` must have the
[Designated Dealer role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles)
and the `tc_account` account must have the
[Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles).


#### Reference Implementations
1. [`Diem::create_preburn`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-create_preburn)
2. [`Diem::publish_preburn_to_account`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-publish_preburn_to_account)
3. [`Diem::preburn_to`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-preburn_to)
4. [`Diem::preburn_with_resource`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-preburn_with_resource)

### <a name="burning">Burning</a>

Once the preburn process has started and coins have been deposited in the
preburn area, an off-chain transfer of funds is initiated. There are two
possible outcomes from this.

1. If the off-chain transfer of the backing funds for the coins in the preburn resource
      held under `preburn_address` has completed successfully, an account with
      the [Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles)
      must then remove or "burn" these funds by calling either the
      ```rust
        public fun burn<C>(tc_account: &signer, preburn_address: address)
      ```
      function, or by calling the
      ```rust
        public fun burn_with_capability<C>(preburn_address: address, burn_capability: &BurnCapability<C>)
      ```
      function, and passing in a `BurnCapability` resource to prove authority to burn coins in that currency.

2. If the off-chain transfer was not able to be completed successfully an
      `account` with the [Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles)
      may remove the funds in the `C` currency from the preburn area under
      `preburn_address`, and re-introduce them to circulation by using
      ```rust
        public fun cancel_burn<C>(account: &signer, preburn_address: address)
      ```
      or by using a capability-based version and passing the `BurnCapability` for `C`
      ```rust
        public fun cancel_burn_with_capability<C>(burn_capability: &BurnCapability<C>, preburn_address: address)
      ```

#### Reference Implementations
1. [`Diem::burn`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-cancel_burn)
2. [`Diem::burn_with_capability`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-cancel_burn_with_capability)
3. [`Diem::cancel_burn`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-cancel_burn)
4. [`Diem::cancel_burn_with_capability`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-cancel_burn_with_capability)

---
# <a name="general_currency_operations">General Currency Operations</a>
---

## Coin Operations

Any amount of value in a currency `C` in circulation on-chain will always be held in a value
of type `Diem<C>`. The
[`Diem`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md)
modules defines the set of operations that may be performed on values of this type. These
operations are as follows, and may be called by anyone:

1. Create a coin with zero value in currency `C`
      ```rust
          public fun zero<C>(): Diem<C>
      ```
2. Get the underlying value of a coin in a currency `C` as an integer
      ```rust
        public fun value<C>(coin: &Diem<C>): u64
      ```
3. Split the passed in `coin` in currency `C` into two coins. The first coin
  contains the remaining value after `amount` has been removed, and the second
  coin has a value of `amount`.
    ```rust
        public fun split<C>(coin: Diem<C>): (Diem<C>, Diem<C>)
    ```
4. Withdraw `amount` of value from the `coin` in-place and return a coin of the
  same currency with value equal to `amount`.
    ```rust
        public fun withdraw<C>(coin: &mut Diem<C>, amount: u64): Diem<C>
    ```
5. Withdraw all of the value from `coin` in-place and return a coin with the
  same value as `coin` before this function was called. Equivalent to
  `withdraw(&mut coin, value(&coin))`.
    ```rust
        public fun withdraw_all<C>(coin: &mut Diem<C>): Diem<C>
    ```
6. Combine the value of two coins. Returns a coin in the same currency with
  value equal to the sum of the passed-in coins values.
    ```rust
        public fun join<C>(coin1: Diem<C>, coin2: Diem<C>): Diem<C>
    ```
7. Deposit the `check` coin into the passed-in `coin`. The value of `coin` after
  this call is equal to the sum of the `check` value and the previous value of
  `coin`.
      ```rust
        public fun deposit<C>(coin: &mut Diem<C>, check: Diem<C>)
      ```
8. Destroys a coin with a value of zero. Attempting to destroy a non-zero value
  coin will result in an error and the passed in `coin` will not be destroyed.
      ```rust
        public fun destroy_zero<C>(coin: Diem<C>)
      ```

#### Reference Implementations
* [`Diem::zero`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-zero)
* [`Diem::value`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-value)
* [`Diem::split`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-split)
* [`Diem::withdraw`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-withdraw)
* [`Diem::withdraw_all`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-withdraw_all)
* [`Diem::join`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-join)
* [`Diem::deposit`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-deposit)
* [`Diem::destroy_zero`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-destroy_zero)

## <a name="currency_ops">Currency Operations</a>

There are a number of different operations that may be performed to view and update the
metadata for a given currency (viz. [Required information for registration of a currency
and metadata](#metadata_spec)). They can be divided in to "getters" (non-mutative),
"setters" (mutative), and predicate operations, and are as follows.

### Non-Mutative ("getters")
1. Get the sum of values for all coins of currency `C` held in preburn resources across the system.
    ```rust
        Diem::preburn_value<C>(): u64
    ```
2. Get the sum all values for all coins of currency `C` currently in existence
  in the system (including coins in preburn areas).
    ```rust
        Diem::market_cap<C>(): u128
    ```
3. Return the approximate value in ≋XDX for `from_value` in currency `C` using the on-chain exchange rate from `C` to ≋XDX.
    ```rust
        Diem::approx_xdx_for_value<C>(from_value: u64): u64
    ```
4. Return the approximate value in ≋XDX for a coin in currency `C` using the on-chain exchange rate from `C` to ≋XDX.
    ```rust
        Diem::approx_xdx_for_coin<C>(coin: &Diem<C>): u64
    ```
5. Return the [`scaling_factor`](#scaling_factor) for currency `C`.
    ```rust
        Diem::scaling_factor<C>(): u64
    ```
6. Return the [`fractional_part`](#fractional_part) for currency `C`.
    ```rust
        Diem::fractional_part<C>(): u64
    ```
7. Return the [`currency_code`](#currency_code) for currency `C`.
    ```rust
        Diem::currency_code<C>(): vector<u8>
    ```
8. Return the to [`xdx_exchange_rate`](#to_xdx_exchange_rate) for currency `C`.
    ```rust
        Diem::xdx_exchange_rate<C>(): FixedPoint32
    ```

#### Reference Implementations
* [`Diem::preburn_value`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-preburn_value)
* [`Diem::market_cap`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-market_cap)
* [`Diem::approx_xdx_for_value`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-approx_xdx_for_value)
* [`Diem::approx_xdx_for_coin`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-approx_xdx_for_coin)
* [`Diem::scaling_factor`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-scaling_factor)
* [`Diem::fractional_part`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-fractional_part)
* [`Diem::currency_code`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-currency_code)
* [`Diem::xdx_exchange_rate`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-xdx_exchange_rate)

### Mutative ("setters")
1. Update the [`to_xdx_exchange_rate`](#to_xdx_exchange_rate) metadata field for `C` to `new_to_xdx_exchange_rate`.
  Must be called by an `account` with a [Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles).
    ```rust
        Diem::update_xdx_exchange_rate<C>(account: &signer, new_to_xdx_exchange_rate: FixedPoint32)
    ```
2. Set the [`can_mint`](#can_mint) metadata field for `C` to the value of `can_mint`.
  Must be called by an `account` with a [Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles).
    ```rust
        Diem::update_minting_ability<C>(account: &signer, can_mint: bool)
    ```

#### Reference Implementations
* [`Diem::update_xdx_exchange_rate`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-update_xdx_exchange_rate)
* [`Diem::update_minting_ability`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-update_minting_ability)

### Predicates
1. Return if the type `C` represents a registered currency on-chain.
    ```rust
        Diem::is_currency<C>(): bool
    ```
    Related assertion
    ```rust
        Diem::assert_is_currency<C>()
    ```
2. Return if the type `C` represents a registered SCS currency on-chain.
    ```rust
        Diem::is_SCS_currency<C>(): bool
    ```
    Related assertion:
    ```rust
        Diem::assert_is_SCS_currency<C>()
    ```
3. Return if the type `C` represents a registered synthetic currency on-chain.
    ```rust
        Diem::is_synthetic_currency<C>(): bool
    ```

#### Reference Implementations

* [`Diem::is_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-is_currency)
    - Related assertion [`Diem::assert_is_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-assert_is_currency)
* [`Diem::is_SCS_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-is_SCS_currency)
    - Related assertion [`Diem::assert_is_SCS_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-assert_is_SCS_currency)
* [`Diem::is_synthetic_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-is_synthetic_currency)

---
# <a name="currency_events">Currency-Related Events</a>
---

In addition to the metadata that each currency must possess, each currency has a number of
events that are associated with it, and that are emitted when
the metadata for a currency is changed. These events are as follows:

| Name                          | Type                                                                                                                                                     | Description                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| mint_events                   | EventHandle\<[MintEvent](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#struct-mintevent)\>                             | Event emitted whenever SCSs are created on-chain                                                            |
| burn_events                   | EventHandle\<[BurnEvent](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#struct-burnevent)\>                             | Event emitted whenever SCSs are removed on-chain                                                            |
| preburn_events                | EventHandle\<[PreburnEvent](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#struct-preburnevent)\>                       | Event emitted whenever SCSs are moved to a preburn area                                                     |
| cancel_burn_events            | EventHandle\<[CancelBurnEvent](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#struct-cancelburnevent)\>                 | Event emitted whenever SCSs in a preburn area are moved back to circulation                                 |
| exchange_rate_update_events   | EventHandle\<[ExchangeRateUpdateEvent](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#struct-exchangerateupdateevent)\> | Event emitted whenever the `to_xdx_exchange_rate` metadata field is updated (for all registered currencies) |

With each of these events there are certain properties with respect to the
state of the blockchain that should be kept. These are:
1. For any SCS currency `C` the `total_value` field in its `CurrencyInfo` resource
   should be equal to the sum of the amounts in all `mint_events`
   for that currency minus the amounts in all `burn_events` for that currency.
2. For any currency `C` the `to_xdx_exchange_rate` stored on-chain should be
   equal to the most recently emitted `exchange_rate_update_event` for the
   currency `C`.
3. For any SCS currency `C` the `preburn_value` field in its `CurrencyInfo`
   resource should be equal to the sum of all amounts in the `preburn_events`
   minus the sum of amounts in all `burn_events` and `cancel_burn_events` for
   the `C` currency.

---
# <a name="operational_things">Operational Restrictions</a>
---

When deciding the on-chain currency code for a currency,
the module, as well as the type name chosen for the currency must match the on-chain currency
code chosen for the currency. e.g., if you want to use currency code `"ABC"` for a
currency, then the fully qualified Move type that is used for that currency on-chain
_must_ be `0x1::ABC::ABC`.

Because of this, and in addition:
* An on-chain currency code must be a valid Move identifier; and
* It can consist solely of uppercase alphanumeric characters.
