<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [decryptFile][1]
    *   [Parameters][2]
*   [encryptFile][3]
    *   [Parameters][4]
*   [encryptFile][5]
    *   [Parameters][6]
*   [createEncryptedFileMetadata][7]
    *   [Parameters][8]

## decryptFile

decrypt encrypted zip and symmetric key using the lit protocol

### Parameters

*   `encryptedFile` **File** 
*   `metadata` **EncryptedFileMetadata** 
*   `encryptedZip` **[Uint8Array][9]** encrypted data that will be converted into a string
*   `encryptedSymmKey` **[Uint8Array][9]** symmetric key
*   `accessControlConditions` **[Array][10]\<any>** conditions that determine access
*   `chain` **[string][11]** the chain you'd like to use for checking the access control conditions
*   `accessControlConditionType` **[string][11]** the access control condition type you are using.  Pass `accessControlConditions` for traditional access control conditions.  This is the default if you don't pass anything.  Pass `evmContractConditions` for custom smart contract access control conditions

Returns **[Promise][12]<[string][11]>** promise with the decrypted string

## encryptFile

Encrypt a single file, save the key to the Lit network, and then zip it up with the metadata.

### Parameters

*   `file` **(File | [Blob][13])** 
*   `params` **[Object][14]** 

    *   `params.authSig` **[Object][14]** The authSig of the user.  Returned via the checkAndSignAuthMessage function
    *   `params.accessControlConditions` **[Array][10]\<AccessControlCondition>** The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
    *   `params.evmContractConditions` **[Array][10]\<EVMContractCondition>** EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
    *   `params.solRpcConditions` **[Array][10]\<SolRpcCondition>** Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
    *   `params.unifiedAccessControlConditions` **[Array][10]<(AccessControlCondition | EVMContractCondition | SolRpcCondition)>** An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
    *   `params.chain` **[string][11]** The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
    *   `params.file` **File** The file you wish to encrypt
    *   `params.readme` **[string][11]** An optional readme text that will be inserted into readme.txt in the final zip file.  This is useful in case someone comes across this zip file and wants to know how to decrypt it.  This file could contain instructions and a URL to use to decrypt the file.

Returns **[Promise][12]<[Object][14]>** A promise containing an object with 3 keys: zipBlob, encryptedSymmetricKey, and symmetricKey.  zipBlob is a zip file that contains an encrypted file and the metadata needed to decrypt it via the Lit network.  encryptedSymmetricKey is the symmetric key needed to decrypt the content, encrypted with the Lit network public key.  You may wish to store encryptedSymmetricKey in your own database to support quicker re-encryption operations when adding additional access control conditions in the future, but this is entirely optional, and this key is already stored inside the zipBlob.  symmetricKey is the raw symmetric key used to encrypt the files.  DO NOT STORE IT.  It is provided in case you wish to create additional "OR" access control conditions for the same file.

## encryptFile

Encrypt a single file, save the key to the Lit network

### Parameters

*   `file` **(File | [Blob][13])** 

Returns **[Promise][12]<[Object][14]>** A promise containing an object with 3 keys: zipBlob, encryptedSymmetricKey, and symmetricKey.  zipBlob is a zip file that contains an encrypted file and the metadata needed to decrypt it via the Lit network.  encryptedSymmetricKey is the symmetric key needed to decrypt the content, encrypted with the Lit network public key.  You may wish to store encryptedSymmetricKey in your own database to support quicker re-encryption operations when adding additional access control conditions in the future, but this is entirely optional, and this key is already stored inside the zipBlob.  symmetricKey is the raw symmetric key used to encrypt the files.  DO NOT STORE IT.  It is provided in case you wish to create additional "OR" access control conditions for the same file.

## createEncryptedFileMetadata

encrypts a message with Lit returns required details
this obfuscates data such that it can be stored on ceramic without
non-permissioned eyes seeing what the data is

### Parameters

*   `encriptedFile` **File** 
*   `encryptedFileCid` **CIDString** 
*   `symmetricKey` **[Uint8Array][9]** 
*   `accessControlConditions` **[Array][10]<[Object][14]>** the access control conditions that govern who is able to decrypt this data.  See the docs here for examples: [https://developer.litprotocol.com/docs/SDK/accessControlConditionExamples][15]
*   `chain` **[string][11]** the chain you'd like to use for checking the access control conditions
*   `fileToEncrypt` **[string][11]** the file you'd like encrypted

Returns **[Promise][12]\<EncryptedFileMetadata>** Encrypted file metadata used to retrieve and decrypt it

[1]: #decryptfile

[2]: #parameters

[3]: #encryptfile

[4]: #parameters-1

[5]: #encryptfile-1

[6]: #parameters-2

[7]: #createencryptedfilemetadata

[8]: #parameters-3

[9]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array

[10]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[11]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[12]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise

[13]: https://developer.mozilla.org/docs/Web/API/Blob

[14]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[15]: https://developer.litprotocol.com/docs/SDK/accessControlConditionExamples