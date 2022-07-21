import * as LitJsSdk from "lit-js-sdk"
import { toString as uint8arrayToString } from "uint8arrays/to-string"
import JSZip from "jszip"
import { CIDString } from "web3.storage"

// /**
//  * encrypts a message with Lit returns required details
//  * this obfuscates data such that it can be stored on ceramic without
//  * non-permissioned eyes seeing what the data is
//  * @param {string} fileToEncrypt the file you'd like encrypted
//  * @param {Array<Object>} accessControlConditions the access control conditions that govern who is able to decrypt this data.  See the docs here for examples: https://developer.litprotocol.com/docs/SDK/accessControlConditionExamples
//  * @param {string} chain the chain you'd like to use for checking the access control conditions
//  * @param {string} accessControlConditionType the access control condition type you are using.  Pass `accessControlConditions` for traditional access control conditions.  This is the default if you don't pass anything.  Pass `evmContractConditions` for custom smart contract access control conditions
//  * @returns {Promise<Array<any>>} returns, in this order: encryptedZipBase64, encryptedSymmetricKeyBase64, accessControlConditions, chain
//  */
//  export async function encryptFileAndZipWithLit(
//   fileToEncrypt: File,
//   accessControlConditions: Array<Object>,
//   chain: string,
//   accessControlConditionType: string = "accessControlConditions"
// ): Promise<Array<any>> {
//   let authSig = await LitJsSdk.checkAndSignAuthMessage({
//     chain,
//   })
//   const { zipBlob, encryptedSymmetricKey, symmetricKey } = await encryptFileAndZipWithMetadata(
//       authSig, // authSig: string,
//       accessControlConditions, // accessControlConditions: Array<Object>,
//       [], // evmContractConditions: Array<Object>,
//       [], // solRpcConditions: Array<Object>,
//       [], // unifiedAccessControlConditions: Array<Object>,
//       chain, // chain: string,
//       fileToEncrypt, // file: File,
//       null, // readme: string,
//       false, // permanant: boolean,
//   )
//   return [
//     zipBlob,
//     encryptedSymmetricKey,
//     accessControlConditions,
//     chain,
//     accessControlConditionType,
//   ]
// }

/**
 * decrypt encrypted zip and symmetric key using the lit protocol
 * @param {Uint8Array} encryptedZip encrypted data that will be converted into a string
 * @param {Uint8Array} encryptedSymmKey symmetric key
 * @param {Array<any>} accessControlConditions conditions that determine access
 * @param {string} chain the chain you'd like to use for checking the access control conditions
 * @param {string} accessControlConditionType the access control condition type you are using.  Pass `accessControlConditions` for traditional access control conditions.  This is the default if you don't pass anything.  Pass `evmContractConditions` for custom smart contract access control conditions
 * @returns {Promise<string>} promise with the decrypted string
 */
export async function decryptFile(
  encryptedFile: File,
  metadata: EncryptedFileMetadata,
): Promise<Blob> {
  let authSig = await LitJsSdk.checkAndSignAuthMessage({
   chain: metadata.chain
  })
  const {decryptedFile, metadata2} = await LitJsSdk.decryptFile({
    authSig: authSig,
    file: encryptedFile, 
  })
  console.log("decryptedFile: ", decryptedFile)
  return decryptedFile
}

/**
 * Encrypt a single file, save the key to the Lit network, and then zip it up with the metadata.
 * @param {Object} params
 * @param {Object} params.authSig The authSig of the user.  Returned via the checkAndSignAuthMessage function
 * @param {Array.<AccessControlCondition>} params.accessControlConditions The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
 * @param {Array.<EVMContractCondition>} params.evmContractConditions  EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
 * @param {Array.<SolRpcCondition>} params.solRpcConditions  Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
 * @param {Array.<AccessControlCondition|EVMContractCondition|SolRpcCondition>} params.unifiedAccessControlConditions  An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
 * @param {string} params.chain The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
 * @param {File} params.file The file you wish to encrypt
 * @param {string} params.readme An optional readme text that will be inserted into readme.txt in the final zip file.  This is useful in case someone comes across this zip file and wants to know how to decrypt it.  This file could contain instructions and a URL to use to decrypt the file.
 * @returns {Promise<Object>} A promise containing an object with 3 keys: zipBlob, encryptedSymmetricKey, and symmetricKey.  zipBlob is a zip file that contains an encrypted file and the metadata needed to decrypt it via the Lit network.  encryptedSymmetricKey is the symmetric key needed to decrypt the content, encrypted with the Lit network public key.  You may wish to store encryptedSymmetricKey in your own database to support quicker re-encryption operations when adding additional access control conditions in the future, but this is entirely optional, and this key is already stored inside the zipBlob.  symmetricKey is the raw symmetric key used to encrypt the files.  DO NOT STORE IT.  It is provided in case you wish to create additional "OR" access control conditions for the same file.
 */
//  async function encryptFileAndZipWithMetadata(
//   authSig: object,
//   accessControlConditions: Array<Object>,
//   evmContractConditions: Array<Object>,
//   solRpcConditions: Array<Object>,
//   unifiedAccessControlConditions: Array<Object>,
//   chain: string,
//   file: File,
//   readme: string | null,
//   permanant = false,
// ) {
//   const symmetricKey = await LitJsSdk.generateSymmetricKey();
//   const exportedSymmKey = new Uint8Array(
//     await crypto.subtle.exportKey("raw", symmetricKey)
//   );
//   const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
//     accessControlConditions,
//     evmContractConditions,
//     solRpcConditions,
//     unifiedAccessControlConditions,
//     symmetricKey: exportedSymmKey,
//     authSig,
//     chain,
//     permanant,
//   })
//   console.log("encrypted key saved to Lit", encryptedSymmetricKey)
//   // encrypt the file
//   var fileAsArrayBuffer = await file.arrayBuffer()
//   const encryptedFileBlob = await LitJsSdk.encryptWithSymmetricKey(
//     symmetricKey,
//     fileAsArrayBuffer
//   )
//   const zip = new JSZip();
//   const metadata = metadataForFile(
//     file.name,
//     file.type,
//     file.size,
//     accessControlConditions,
//     evmContractConditions,
//     solRpcConditions,
//     unifiedAccessControlConditions,
//     chain,
//     encryptedSymmetricKey)
//   zip.file("lit_protocol_metadata.json", JSON.stringify(metadata))
//   if (readme != null) {
//     zip.file("readme.txt", readme)
//   }
//   zip.folder("encryptedAssets")?.file(file.name, encryptedFileBlob)
//   const zipBlob = await zip.generateAsync({ type: "blob" })
//   return { zipBlob, encryptedSymmetricKey, symmetricKey: exportedSymmKey }
// }

/**
 * Encrypt a single file, save the key to the Lit network
 * @param {File} params.file The file you wish to encrypt
 * @returns {Promise<Object>} A promise containing an object with 3 keys: zipBlob, encryptedSymmetricKey, and symmetricKey.  zipBlob is a zip file that contains an encrypted file and the metadata needed to decrypt it via the Lit network.  encryptedSymmetricKey is the symmetric key needed to decrypt the content, encrypted with the Lit network public key.  You may wish to store encryptedSymmetricKey in your own database to support quicker re-encryption operations when adding additional access control conditions in the future, but this is entirely optional, and this key is already stored inside the zipBlob.  symmetricKey is the raw symmetric key used to encrypt the files.  DO NOT STORE IT.  It is provided in case you wish to create additional "OR" access control conditions for the same file.
 */
 export async function encryptFile(file: File | Blob) {
  const { encryptedFileBlob, symmetricKey } = await LitJsSdk.encryptFile({file: file})
  return { encryptedFileBlob, symmetricKey }
}

/**
 * encrypts a message with Lit returns required details
 * this obfuscates data such that it can be stored on ceramic without
 * non-permissioned eyes seeing what the data is
 * @param {string} fileToEncrypt the file you'd like encrypted
 * @param {Array<Object>} accessControlConditions the access control conditions that govern who is able to decrypt this data.  See the docs here for examples: https://developer.litprotocol.com/docs/SDK/accessControlConditionExamples
 * @param {string} chain the chain you'd like to use for checking the access control conditions
 * @returns {Promise<EncryptedFileMetadata>} Encrypted file metadata used to retrieve and decrypt it
 */
export async function createEncryptedFileMetadata(
  encriptedFile: File,
  encryptedFileCid: CIDString,
  symmetricKey: Uint8Array,
  accessControlConditions: Array<Object>,
  chain: string
): Promise<EncryptedFileMetadata> {
  // Obtain user's authSig
  let authSig = await LitJsSdk.checkAndSignAuthMessage({
    chain,
  })
  // Save key to lit network
  const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
    accessControlConditions,
    symmetricKey,
    authSig,
    chain,
  })
  // create metadata
  const metadata: EncryptedFileMetadata = metadataForFile(
    encryptedFileCid,
    encriptedFile.name,
    encriptedFile.type,
    encriptedFile.size,
    accessControlConditions,
    [],
    [],
    [],
    chain,
    encryptedSymmetricKey)
  return metadata   
}

export function metadataForFile(
  fileCid: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  accessControlConditions: any,
  evmContractConditions: any,
  solRpcConditions: any,
  unifiedAccessControlConditions: any,
  chain: string,
  encryptedSymmetricKey:  any
): EncryptedFileMetadata {
  return {
    fileCid,
    fileName,
    fileType,
    fileSize,
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
    chain,
    encryptedSymmetricKey: uint8arrayToString(encryptedSymmetricKey, "base16"),
  }
}

export type EncryptedFileMetadata = {
  fileCid: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  accessControlConditions: any;
  evmContractConditions: any;
  solRpcConditions: any;
  unifiedAccessControlConditions: any;
  chain: string;
  encryptedSymmetricKey:  any;  
};
 