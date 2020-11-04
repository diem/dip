---
lip: 9
title: Libra Private Transaction Metadata
authors: Daniel Prinz
status: Draft
type: Informational
created: 09/10/2020
---
# Summary
This LIP describes the conceptual model and implementation of a private, on-chain description attribute, that could be added to every P2P transaction. An example of that would be short and descriptive information about the transaction, like what are the purchased items that are being paid in a transaction. 

# Abstract / Overview
The Libra blockchain can carry informational metadata with every transaction made. This data could vary and usually used for validating both sides of the transaction could "understand" its mean. While this metadata deals with the functioning of the sender and receiver VASPs, and/or with the FATF travel rule regulatory constraints, the transaction info itself remains opaque to the end-users. This property is missing from the current payment experience of any traditional network.
This LIP's goal is to propose a standard way of describing any transaction while keeping the following principles:
1. Indisputable data
2. Privacy of the end-user (sender)
3. Ownership of the data by the end-user 


# Terminology
* *End users/Customers* are custodial or non-custodial wallet users which wish to transfer funds from their account to the beneficiary account (Receiver/Merchant)
* *End-user wallet* is an on-chain VASP who provides custodian services to the end-users. This entity is considered optional and this role could be played by the end-users in a non-custodial wallet scenarios
* *Receiver/Merchant VASP* is an entity that provides the same VASP services to the other side of the transaction, such as a regular receiver or merchant
* *Receiver/Merchant* is the beneficiary of the transaction
* *Private/Public keys* are keys used to sign and verify as well as encrypt and decrypt data by both sides. a private key is usually used to sign and encrypt while a public key is usually used for verification  


# Specification
## Basic flow

The basic flow consists of a payment request presented to the end-user with the following additional info parts:
1. A short string description of the reason for this transaction (e.g. 'Pair of shoes')
2. The specific subaddress that should be used in the transaction 
3. Timestamp of which this info was generated
4. Receiver signature of the above

The end-user wallet would present the request info to the end-user, and upon consent given by the user for the transaction to take place, the user should encrypt the additional parts by its private key. this encrypted binary will be attached to the transaction metadata as a new variant (proposed - PaymentInfoVariant)

When the transaction is final and chained, the end-user could always look and decipher the transaction info regardless of the end-user VASP and/or the receiver/merchant VASP willing to give this information. This opens a lot of new options for peripheral services, such as shopping analyzing, categorization, and many more. The end-user private key ensures that the metadata belongs to the user alone, could not be parsed by any other entity, and the user is free to migrate between wallets without losing any important info of the user Libra usage. 

Another added value of this LIP is the ability to resolve disputes by the user presenting the metadata decrypted, but the content of the metadata could be verified to be produced by the receiver/merchant, as it signed and related to the specific transaction subaddress. 
The user from the other side can be sure about the transaction info that is going to be written to the blockchain. 

### Sample draft POC written in Python
```python
@dataclass
class ProductDescription:
    description: str
    subaddress: bytes
    timestamp: int64

@dataclass
class SignedProductDescription:
    product: ProductDescription
    signature: bytes


product_desc = ProductDescription(description='Pair of shoes',
                                  subaddress=bytes.fromhex(merchant_subaddress),
                                  timestamp=current_timestamp)
product_bytes = product_desc.serialize()
signed_product = SignedProductDescription(product=product_bytes, signature=merchant_key.sign(product_bytes))

encrypted_product_description = client_aes.encrypt(signed_product.serialize())

# Submit the payment transaction with *encrypted_product_description* as metadata variant
```

## End-user private key security
As with every secret private key, usual end users tend to be afraid of having such solely. In most cases, the end-user chooses to store it in a secure location and retrieve it with a more conventual method of identification such as a username/password or biometric. this feature doesn't deny such service to securely store an end user keys. it is expected to be a service supplied by the end-user wallet. it is distinguished from the wallet blockchain account private key, as it is a different one for each customer and not only one for the custodial account as a whole. this way the end-users would be able to ask their wallet to get this secret key and import it to a 3rd party software for analysis purposes. In case of end-users chooses to use their private keys, on their own risk of losing it, it should be supported, and the consequence of such a loss shouldn't be significant in terms of funds locked in an account or being lost.  

## Blockchain consequences
There are two major discussions to make regarding the blockchain involvement in this feature: 
1. Size of a transaction
2. The blockchain goal and does it need to be stored on-chain

### Size of a transaction
The actual overhead of implementing this feature on the size of a transaction would be as follows:

| Field                       | Size calculation                                       | Total bytes  |
| --------------------------- | ------------------------------------------------------ | ------------ |
| Product description / info  | description + subaddress + timestamp = (X + 8 + 8)     | X + 16 bytes |
| Receiver/Merchant signature | 64 bytes (using Ed25519)                               | 64 bytes     |
| LCS additional info         | description bytes length                               | 8 bytes      |


from the table above we can calculate the total overhead of such metadata to be 88 bytes + the actual description (string) size.
To that, an AES prefix should be added (considering CTR mode it would be a random counter of 4 bytes) and if an AES stream mode is chosen, no additional overhead would be added. 

All in all, 92 bytes + description length. To limit the storage implications of this proposal, we suggest a limit of 164 bytes (to fill the gap up to 256 bytes).

## Extended scenarios
This proposal is focused on a very basic buyer/merchant scenario. more potential applications might be utilizing such a feature to store private data attached to a transaction *owned by the users* and not by their VASPs. 

