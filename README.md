<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [This module is based on the Lit Ceramic Integration Module](#this-module-is-based-on-the-lit-ceramic-integration-module)
- [Web3.Storage Lit Integration Module](#web3storage-lit-integration-module)
  - [Why?](#why)
  - [Motivation](#motivation)
  - [Installation](#installation)
  - [Usage](#usage)
  - [EVM Contract Conditions](#evm-contract-conditions)
  - [API Docs](#api-docs)
  - [Example](#example)
  - [More info](#more-info)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# This module is based on the Lit Ceramic Integration Module 

Thanks Lit Protocol for this great module!

https://github.com/LIT-Protocol/CeramicIntegration

# Web3.Storage Lit Integration Module

## Why?

Web3.Storage is amazing, but doesn't have read permissions on data. Everything is public. With the Lit Protocol, you can specify who is able to decrypt and therefore read data based on on-chain conditions. This module allows you to integrate Ceramic with Lit.

For example, you could use this to share fies and specify that only allowed wallets can decrypt the file stored in Web3.Storage.

## Motivation

The goal of this project is to provide a decentralized fully serverless file sharing solution with the ability to easily share private data. Web3.Storage is a great solution for the decentralized serverless file storage, but it doesn't have the ability to share private data on it's own. This module will allow you to share private data on Web3.Storage with the ability to specify who can decrypt the data.

## Installation

1. `yarn add web3.storage-lit-sdk`
2. `cp .env.example .env`
3. Update `WEB3STORAGE_TOKEN=""` env var in `.env` with your Web3.Storage API Token

## Usage

1. Install as shown above
2. Import into your TS/JS where you'd like to use it. This is a typescript package as an FYI.

Javascript requires minor amounts of extra work to use a Typescript project, [here's an example](https://www.freecodecamp.org/news/how-to-add-typescript-to-a-javascript-project/) of what that can look like, but there are plenty of good resources for this online.

`import { Integration } from 'web3.storage-lit-sdk'`

3. Create a new Integration that runs upon startup and is accessible where you intend to do encryptAndWrite or readAndDecrypt operations. Pass your Ceramic RPC URL and the chain you wish to use:
   `let web3StorageLitIntegration = new Integration("ethereum")`
4. Start the Lit Client when the DOM is loaded, or early on in the lifecycle:
   `web3StorageLitIntegration.startLitClient(window)`
5. You'll need to define access control conditions for your data. This will govern who is able to decrypt and therefore read the data. The access control conditions variable should be an array of conditions and the user must satisify all of them (a boolean "AND" operation) to access the data. You can find examples of conditions here: https://developer.litprotocol.com/docs/SDK/accessControlConditionExamples

For example, this access control condition lets anyone who holds an NFT in the collection at 0x319ba3aab86e04a37053e984bd411b2c63bf229e on Ethereum to decrypt and read the data:

```
const accessControlConditions = [
  {
    contractAddress: '0x319ba3aab86e04a37053e984bd411b2c63bf229e',
    standardContractType: 'ERC721',
    chain,
    method: 'balanceOf',
    parameters: [
      ':userAddress'
    ],
    returnValueTest: {
      comparator: '>',
      value: '0'
    }
  }
]
```

6. Use uploadFile to encrypt and write your file to Web3.Storage:

```
async function handleUpload() {
  const fileToEncrypt: HTMLInputElement = document.getElementById('uploadInput')
  if (fileToEncrypt.files.length == 0) {
    updateAlert('danger', `Error, please select a file to share`)
    return
  }
  const file: File = fileToEncrypt.files[0] 
  const encryptedFileCid = await web3StorageLitIntegration.uploadFile(file)
  console.log(encryptedFileCid)
}
```

Note that the fileToEncrypt is the file which we are encrypting in this example, which could be any file of any size. The uploadFile function returns a promise that contains the Web3.Storage CID of the content that was written. Note that you do need to save the CID somewhere in order to retrieve the data later on. You could use localStorage or a database, but you'll need to save the CID somewhere.

7. Use retrieveAndDecryptFile to read your data from Web3.Storage and decrypt it:

```
async function retrieveFile(cid: string) {
  const unencryptedfileBlob = await web3StorageLitIntegration.retrieveAndDecryptFile(cid)
  saveData(unencryptedfileBlob, "test.txt")
  )
}

var saveData = (function () {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName) {
      var blob = new Blob([data], {type: "octet/stream"}),
          url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
  };
}())
```

This uses sample code will retrieve the file and trigger the download of that file.

## EVM Contract Conditions

If you're using EVM Contract conditions instead of access control conditions, make sure you pass the optional 3rd parameter to encryptAndWrite of 'evmContractConditions':

```
const stringToEncrypt = 'This is what we want to encrypt on Lit and then store on ceramic'
const response = litCeramicIntegration
   .encryptAndWrite(stringToEncrypt, evmContractConditions, 'evmContractConditions')
   .then((streamID) => console.log(streamID))
```

## API Docs

You can find API docs [here](documentation/integration.md)

## Example

You can find an example implementation here: https://github.com/Ghostshare/Web3.StorageLitIntegrationExample

## More info

Want to do something more complex with the Lit Protocol or Web3.Storage? Check out the Lit JS SDK docs https://developer.litprotocol.com/docs/SDK/intro and the Web3.Storage docs https://web3.storage/docs
