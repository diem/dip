---
dip: 20
title: Diem On-Chain Currency Management
authors: Tim Zakian, Sam Blackshear, Dahlia Malkhi
status: Draft
type: Informational
created: 08/28/2020
---

---
# Summary
---

This DIP describes the conceptual model and implementation of currencies on
the Diem blockchain. Currencies in Diem are represented statically at the
type level, each currency with a unique Move type.

The Diem currency implementation maintains coin safety rules through two
principal mechanisms of the Move language, permissions and types.
Permissions guarantee coin scarcity, in that a coin can be created
("minted") or destroyed ("burned") only through explicit "treasury"
operations that require special privileges. Type safety guarantees that
operations on currencies cannot duplicate, lose, or otherwise mishandle
coins.

In order for a Move type to be considered a Diem currency, a specific
resource instantiated with that type must be registered at the [DiemRoot
account
address](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles) as
defined by the top-level [Diem
module](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md)
and [DIP-2](https://github.com/diem/dip/blob/master/dips/dip-2.md). The
Diem module is responsible for defining the representation of Diem
currencies, the set of operations that can be performed on Diem coins
(e.g., splitting, minting, burning) and their corresponding permissions,
and the registration process of a Move type as representing a Diem
currency.

Once a currency is registered it remains registered forever.

Every Diem currency has metadata associated with it at the time of
registration. That metadata includes the currency code, a total value held
on-chain in the currency and other relevant information. One of the most
important properties held in a currency's metadata is whether it is a
Single Currency Stablecoin (SCS), i.e., a fiat currency like  ≋XUS, or a
synthetic currency that may consist of one or multiple other currencies
registered on-chain, e.g., ≋XDX. These metadata and their meaning are
detailed in the
[section on Diem currency metadata](https://github.com/diem/dip/blob/master/dips/dip-20.md#metadata_spec).

On-chain, a currency asset  is held as a "Diem Coin" resource
[`Diem<C>`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-diem); a
Move resource with a generic currency type `C`  and a `value` field indicating
the amount held in the coin. The Diem Coin resource type has a statically
defined set of operations that may be performed on it and other coins of
the same currency by the public functions of the [Diem
module](https://github.com/diem/dip/blob/master/dips/dip-20.md#general_currency_operations). All
operations must be performed on a registered currency type, with the
exception of registration.

---
# <a name="requirements">Requirements</a>
---

The requirements for a currency in Diem are as follows:

1. *Privileged Registration*: The registration of a Move type as a currency
   on-chain is restricted to accounts with the
   [`RegisterNewCurrency`
   permission](https://github.com/diem/dip/blob/master/dips/dip-2.md#permissions).
   Once a Move type has been registered as a currency, it remains
   registered forever.
2. *Privileged minting and burning*: Every on-chain currency must have a
   way for new coins to be minted and burned in the system. Minting and
   burning of Diem Coins must be a privileged action yet customizable per
   currency. This can be used, e.g., to grant specific designated addresses
   the ability to mint coins of a specific currency, or to ensure that
   certain preconditions are met before coins are minted or burned.
3. *Explicit representation*: Value in a currency is explicitly represented
   at the type level in Move. Values that have a Diem Coin type of a given
   currency cannot be accidentally or purposefully misinterpreted as
   anything other than a coin in the given value and currency.
4. *Fungibility and correctness*: The way currencies may interact and be
   interchanged must be well-defined. Any undefined or invalid behaviors
   such as trying to combine coins of different currency types must never
   be allowed, and error conditions well specified.
5. *Conservation, and encapsulation of value*: The value of a coin in
   circulation can never be accidentally or purposefully altered except
   through the specified operations defined in this document. In addition,
   the `total_value` of all coins minted in a currency must be equal to the
   sum of the values of all coins in circulation in that currency no matter
   the operations performed, with the exception of minting and burning
   operations that will increase or decrease this value by the value of the
   coins being minted or burned respectively.
6. *Value normalization*: Every currency must have a way to *roughly*
   normalize its value to a specified currency so that values expressed
   across different currencies may be compared for use in the system. In
   Diem, this specified currency is ≋XDX.

The Diem currency management on-chain is designed to provide a common interface that can
be used for any currency that ensures that these key properties are kept.


---
# <a name="registration_and_metadata">Registration of Currencies and Currency Metadata</a>
---

Every currency on-chain is represented as a Move-defined type `C`. This type
can be either a resource or struct type. In order for the system to view a
type `C` as representing a currency on-chain, it must first be registered by
calling either
[`Diem::register_SCS_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_scs_currency) or
[`Diem::register_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_currency)
instantiated with the type `C`. The first call registers a new SCS, the
second a synthetic currency.

The registration of a type `C` as a Diem currency publishes a unique
resource instantiated with the
type---[`Diem::CurrencyInfo<C>`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-currencyinfo)---containing
metadata about the currency being registered under the
[DiemRoot](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles)
account address (see the implementation of
[`Diem::register_SCS_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_scs_currency)
and
[`Diem::register_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_currency)).

## <a name="metadata_spec">Required information for registration of a currency and metadata</a>

Every registered currency on-chain contains the information listed below.
When a currency is registered, the "Mandatory" parameters must be provided
at the time of registration, other fields are optional or cannot be set at
registration, e.g., the `total_value` field can only be changed through the
minting and burning of coins:


| Name                          | Type                                   | Mutable      | Description                                                                                                                             | Mandatory |
| ----------------------------- | -------------------------------------- | ------------ | -----------------------------------------------------------------------------------------------------------------------                 | --------  |
| to_xdx_exchange_rate          | FixedPoint32                           | Yes          | The _rough_ exchange rate from `C` to XDX. Used only for dual attestation threshold and mempool gas price normalization                 | Yes       |
| is_synthetic                  | bool                                   | No           | Whether `C` is a synthetic currency or not (if false, then it is an SCS currency). Informational only except for its effects on events. | Yes       |
| scaling_factor                | u64                                    | No           | The scaling factor that a coin's value in `C` should be multiplied by to arrive at the off-chain "real world" value                     | Yes       |
| fractional_part               | u64                                    | No           | The smallest fractional part (number of decimal places) to be used in the human-readable representation of the currency                 | Yes       |
| currency_code                 | vector\<u8\>                           | No           | The currency code (e.g., "XDX") for `C`                                                                                                 | Yes       |
| total_value                   | u128                                   | Yes          | The total value of all currency in circulation on-chain, initialized to zero at time of registration                                    | No        |
| preburn_value                 | u64                                    | Yes          | The total value of all coins in this currency waiting to be burned                                                                      | No        |
| can_mint                      | bool                                   | Yes          | Whether more value in this currency can be added to circulation                                                                         | No        |

We now describe each of these data and their purpose.

### <a name="to_xdx_exchange_rate">`to_xdx_exchange_rate`</a>

There are certain cases where values in two different currencies need to be
compared against each other. This exchange rate is used to normalize both
values to their approximate ≋XDX value so that their values may be
compared. In particular:

* Transactions can set their gas price in different currencies, however
  transactions need to be ranked against each other based upon their gas
  prices. This field is used to normalize gas prices to one single "unit"
  for comparison and ranking purposes.
* The dual attestation threshold needs to apply to payments in all
  currencies. This limit is set in terms of ≋XDX, transfers are first
  normalized using this exchange rate and then compared against the limit.

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
currency. As an example, the on-chain unit of value for XUS is
one-millionth of an XUS, therefore XUS's `scaling_factor` is 1,000,000.

#### Mutability
Immutable

### `fractional_part`

This defines the truncation that needs to be performed when transferring
from the on-chain representation to the smallest denomination real-world
coin for that currency off-chain. For example, for XUS the smallest
off-chain denomination coin is one cent (1/100th of an XUS), so the
`fractional_part` for XUS would be 100. If you wanted to translate from an
on-chain value `v` to a number in XUS's currency units, you would multiply
by 1,000,000 (XUS's `scaling_factor`) and then truncate all digits after the
hundredths place.

#### Mutability
Immutable

### `currency_code`

The currency code specified at the time of registration of the currency.
This is an ASCII field holding a human-readable code, e.g., "XDX". The code
is also registered in a global set of registered currency codes for
off-chain use as an on-chain configuration defined in the
[`RegisteredCurrencies` module](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/RegisteredCurrencies.md).

#### Mutability
Immutable

### <a name="total_value">`total_value`</a>

This field holds the current value of all coins in circulation on-chain in the given currency.

#### Mutability

This field's value remains constant with the exception of minting and burning operations.
Details on these operations and how they effect the `total_value` for the currency
are given in the section on [minting and burning of value](#minting_and_burning).

### `preburn_value`

This field holds the value of all coins currently slated to be burned
as detailed in the [Preburning](#pre_burning) section.

#### Mutability

This field's value remains constant with the exception of preburning and burning operations as detailed in the sections
on [minting and burning of value](#minting_and_burning) and [Preburning](#pre_burning).

### <a name="can_mint">`can_mint`</a>

This specifies whether additional value in the specified currency may be added
to the system. Coins in the currency can be burned, accounts may hold balances
in the currency, and payments can be made in the currency regardless of the
value of this field.

#### Mutability

This field is only updatable through the
[`Diem::update_minting_ability`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-update_minting_ability)
function, and must be done by an account with the [Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles).

## Capabilities Created at Registration

When a type `C` is registered as a currency a
[`MintCapability<C>`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-mintcapability)
and
[`BurnCapability<C>`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-burncapability)
are created. If the currency is registered using the
[`Diem::register_SCS_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_scs_currency)
function, both of these capabilities are stored under and controlled by the Treasury Compliance account at address
`0xB1E55ED`. In the case that [`Diem::register_currency`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-register_currency)
is used to register the currency both of these capabilities are returned to the caller, which may store them in other structures.
The `MintCapability` and `BurnCapability` for each currency are [unique](https://github.com/diem/dip/blob/master/dips/dip-2.md#permissions); after
registration of a currency no future mint and burn capabilities for the currency may be created.

## On-chain list of registered currencies

When a currency is registered on chain, its currency code is added to the
[`RegisteredCurrencies` on-chain config](https://github.com/diem/dip/blob/master/dips/dip-6.md#registered-currencies).
The list of currency codes registered on-chain is set, and attempting to
register an existing currency code will fail. There are some
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
as it represents minting of value on-chain. Additionally, this is an if-and-only-if
relation; a Move value represents a specific amount `v` in a given currency `Currency`, if, and only
if the Move value has the type `Diem<Currency>` with a `value` field equal to `v`.

---
# <a name="minting_and_burning">Minting and Burning of Value</a>
---

The minting and burning of Diem Coins on-chain represent changes to the
total value held on the network. These operations are designed to support a
system of single-currency stablecoins (SCS) backed by reserves. Hence, they
require special privileges dedicated for reserve management, e.g.,
[MintCurrency, BurnCurrency, and PreburnCurrency](https://github.com/diem/dip/blob/master/dips/dip-2.md#permissions).

The total on-chain value of all coins in a Diem currency are recorded
on-chain in the
[`total_value`](https://github.com/diem/dip/blob/master/dips/dip-20.md#total_value)
metadata field. Generally, Diem Coin operations are designed to support a
reserve guarantee that the total value for a stablecoin should never exceed
the value held in the reserve for the coin.

In order to support inflight redemption orders, Diem Coins that are to be
removed are placed in a [Preburn
resource](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#resource-preburn).
Moving coins from a preburn resource requires a [BurnCurrency
privilege](https://github.com/diem/dip/blob/master/dips/dip-2.md#permissions)
for the currency of the coins being moved--granted to the currency's
reserve management--removing them once a redemption has been completed.

The specific set of operations that may be performed that relate to
minting, preburning, and burning of Diem Coins are as follows.

### <a name="minting">Minting</a>

Diem Coins in a currency `C` with a non-zero value may be created by calling

```rust
Diem::mint_with_capability<C>(value: u64, capability: MintCapability<C>): Diem<C>
```

A reference to the `MintCapability<C>` resource for the currency being minted
must be passed-in to this function as a witness of having the privilege to mint
coins in the specific currency.

Additionally, non-zero-value coins for SCS currencies can be minted by calling

```rust
Diem::mint<C>(value: u64): Diem<C>
```

The `mint` function may only be called by an account with the
[Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles)
that has a `MintCapability<C>` resource published under it. Recall that only
one mint capability resource is created for a currency when it is
registered.

#### Reference Implementations
1. [`Diem::mint_with_capability`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-mint_with_capability)
2. [`Diem::mint`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-mint)

### <a name="pre_burning">Preburning</a>

In order to remove coins from circulation, they must first be moved to a
preburn area. The movement of coins to a specific preburn area will emit
[events](#currency_events) that may be used by the reserve management to initiate transfer of
backing funds for those coins.

Funds may be moved to a preburn area only by an account that has access to a
[Preburn capability](https://github.com/diem/dip/blob/master/dips/dip-2.md#permissions)
resource for the currency in question. This action may be performed by calling either

```rust
Diem::preburn_with_resource<C>(coin: Diem<C>, preburn: &mut Preburn<C>, preburn_address: address)
```

where the `Preburn<C>` resource is stored under `preburn_address`, or calling

```rust
Diem::preburn_to<C>(account: &signer, coin: Diem<C>)
```

where `account` has a `Preburn<C>` resource published under it.

A `Preburn` resource can only be created by an account with the
[Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles)
by calling either the `create_preburn` function

```rust
Diem::create_preburn<C>(account: &signer): Preburn<C>
```

and storing the `Preburn` resource returned by this function in a different module's resource. Or, by
calling the `publish_preburn_to_account` function and passing in the signer for
the `account` under which the created preburn resource will be stored, along with a
signer proving authority to create a preburn resource

```rust
Diem::publish_preburn_to_account<C>(account: &signer, tc_account: &signer)
```

The `account` must have the
[Designated Dealer role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles)
and the `tc_account` must have the
[Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles).


#### Reference Implementations
1. [`Diem::create_preburn`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-create_preburn)
2. [`Diem::publish_preburn_to_account`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-publish_preburn_to_account)
3. [`Diem::preburn_to`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-preburn_to)
4. [`Diem::preburn_with_resource`](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md#function-preburn_with_resource)

### <a name="burning">Burning</a>

Once coins are placed in the preburn area, there are two supported
operations representing two possible outcomes of coin redemption by the
reserve.

1.  If the transfer of the backing funds for the coins in the preburn
    resource held under `preburn_address` has completed successfully, an
    account with the [Treasury Compliance role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles) must then remove or "burn"
    these funds by calling either the
      ```rust
        Diem::burn<C>(tc_account: &signer, preburn_address: address)
      ```
      function, or by calling the
      ```rust
        Diem::burn_with_capability<C>(preburn_address: address, burn_capability: &BurnCapability<C>)
      ```
      function, and passing a `BurnCapability<C>` resource to prove authority to burn coins in that currency.

2.  If the transfer was not able to be completed successfully an account
    with the [Treasury Compliance
    role](https://github.com/diem/dip/blob/master/dips/dip-2.md#roles) may
    remove the funds in the `C` currency from the preburn area under
    `preburn_address`, and re-introduce them to circulation by using
      ```rust
        Diem::cancel_burn<C>(account: &signer, preburn_address: address): Diem<C>
      ```
      or by using a capability-based version and passing the `BurnCapability` for `C`
      ```rust
        Diem::cancel_burn_with_capability<C>(burn_capability: &BurnCapability<C>, preburn_address: address): Diem<C>
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
[`Diem` module](https://github.com/diem/diem/blob/master/language/stdlib/modules/doc/Diem.md)
module defines the set of operations that may be performed on values of this type. These
operations are as follows, and may be called by anyone:

1. Create a coin with zero value in currency `C`
      ```rust
          Diem::zero<C>(): Diem<C>
      ```
2. Get the underlying value of a coin in a currency `C` as an integer
      ```rust
        Diem::value<C>(coin: &Diem<C>): u64
      ```
3. Split the `coin` in currency `C` into two coins. The first coin
  contains the remaining value after `amount` has been removed, and the second
  coin has a value of `amount`
    ```rust
        Diem::split<C>(coin: Diem<C>, amount: u64): (Diem<C>, Diem<C>)
    ```
4. Withdraw `amount` of value from the `coin` in-place and return a coin of the
  same currency with value equal to `amount`
    ```rust
        Diem::withdraw<C>(coin: &mut Diem<C>, amount: u64): Diem<C>
    ```
5. Withdraw all of the value from `coin` in-place and return a coin with the
  same value as `coin` before this function was called. Equivalent to
  `withdraw(&mut coin, value(&coin))`
    ```rust
        Diem::withdraw_all<C>(coin: &mut Diem<C>): Diem<C>
    ```
6. Combine the value of two coins. Returns a coin in the same currency with
  value equal to the sum of the passed-in coins values
    ```rust
        Diem::join<C>(coin1: Diem<C>, coin2: Diem<C>): Diem<C>
    ```
7. Deposit the `check` coin into the passed-in `coin`. The value of `coin` after
  this call is equal to the sum of the `check` value and the previous value of
  `coin`
      ```rust
        Diem::deposit<C>(coin: &mut Diem<C>, check: Diem<C>)
      ```
8. Destroys a coin with a value of zero. Attempting to destroy a non-zero value
  coin will result in an error and the passed in `coin` will not be destroyed.
      ```rust
        Diem::destroy_zero<C>(coin: Diem<C>)
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
and metadata](#metadata_spec)). They can be divided into "getters" (non-mutative),
"setters" (mutative), and predicate operations. They are as follows:

### Non-Mutative ("getters")
1. Get the sum of values for all coins of currency `C` held in preburn resources across the system.
    ```rust
        Diem::preburn_value<C>(): u64
    ```
2. Get the sum of all values for all coins of currency `C` currently in existence
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
