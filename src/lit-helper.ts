import * as LitJsSdk from "lit-js-sdk"
import { toString as uint8arrayToString } from "uint8arrays/to-string"
import { CIDString } from "web3.storage"

/**
 * decrypt encrypted file, using metadata and the lit protocol
 * @param {Uint8Array} encryptedFile encrypted file 
 * @param {EncryptedFileMetadata} encryptedFileMetadata the metadata associated with the encrypted file, used to decrypt it
 * @returns {Promise<Blob>} promise with the decrypted file Blob
 */
export async function decryptFile(
  encryptedFile: File,
  metadata: EncryptedFileMetadata,
): Promise<Blob> {
  // let authSig = await LitJsSdk.checkAndSignAuthMessage({
  //  chain: metadata.chain
  // })
  let authSig = localStorage.getItem("lit-auth-signature");
  if (authSig == null) {
    throw new Error("Missing lit-auth-signature");
  }
  authSig = JSON.parse(authSig);
  const symmetricKey = await window.litNodeClient.getEncryptionKey({
    accessControlConditions: metadata.accessControlConditions,
    toDecrypt: metadata.encryptedSymmetricKey,
    chain: metadata.chain,
    authSig: authSig
  })
  const decryptedFileBlob = await LitJsSdk.decryptFile({
    symmetricKey: symmetricKey,
    file: encryptedFile, 
  })
  return decryptedFileBlob
}

/**
 * Encrypt a single file using the Lit
 * @param {File} params.file The file you wish to encrypt
 * @returns {Promise<Object>} A promise containing an object with 2 keys: encryptedFileBlob and symmetricKey. encryptedFileBlob is the encrypted file
 */
 export async function encryptFile(file: File | Blob) {
  const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile({file: file})
  return { encryptedFileBlob: encryptedFile, symmetricKey }
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
  evmContractConditions: Array<Object>,
  chain: string
): Promise<EncryptedFileMetadata> {
  // Obtain user's authSig
  // let authSig = await LitJsSdk.checkAndSignAuthMessage({
  //   chain,
  // })
  let authSig = localStorage.getItem("lit-auth-signature");
  if (authSig == null) {
    throw new Error("Missing lit-auth-signature");
  }
  authSig = JSON.parse(authSig);
  // Save key to lit network
  const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
    accessControlConditions: evmContractConditions,
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
    [],
    evmContractConditions,
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
 