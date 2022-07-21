// Don't forget to rebuild
import type { DID } from "dids"
import * as LitHelper from "./lit-helper"
import { _startLitClient } from "./client"
// import { storeFiles, storeFilesWithProgress, retrieveFiles } from "./web3.storage-helper"
import * as Web3StorageHelper from "./web3.storage-helper"
import { CIDString } from "web3.storage"

declare global {
  interface Window {
    did?: DID
  }
}

export class Integration {
  chain: string

  constructor(chainParam: string = "ethereum") {
    this.chain = chainParam;
  }

  startLitClient(window: Window) {
    _startLitClient(window);
  }

  // /**
  //  * Encrypts a file using Lit and then writes using Ceramic
  //  *
  //  * @param {File} fileToEncrypt File to encrypt and store on ceramic
  //  * @param {Array<Object>} accessControlConditions the access control conditions that govern who is able to decrypt this data.  See the docs here for examples: https://developer.litprotocol.com/docs/SDK/accessControlConditionExamples
  //  * @param {string} accessControlConditionType the access control condition type you are using.  Pass `accessControlConditions` for traditional access control conditions.  This is the default if you don't pass anything.  Pass `evmContractConditions` for custom smart contract access control conditions
  //  * @returns {Promise<string>} A promise that resolves to a streamID for the encrypted data that's been stored
  //  */
  // async encryptFileAndStoreWithZip(
  //   fileToEncrypt: File,
  //   accessControlConditions: Array<Object>,
  //   accessControlConditionType: string = "accessControlConditions"
  // ): Promise<string> {
  //   if (
  //     accessControlConditionType !== "accessControlConditions" &&
  //     accessControlConditionType !== "evmContractConditions"
  //   ) {
  //     throw new Error("accessControlConditionType must be accessControlConditions or evmContractConditions")
  //   }
  //   try {
  //     const en = await LitHelper.encryptFileAndZipWithLit(
  //       fileToEncrypt,
  //       accessControlConditions,
  //       this.chain,
  //       accessControlConditionType
  //     )
  //     /*
  //     return [
  //       zipBlob,
  //       encryptedSymmetricKey,
  //       accessControlConditions,
  //       chain,
  //       accessControlConditionType,
  //     ];
  //     */
  //     const file = new File([en[0]], fileToEncrypt.name,{ type: fileToEncrypt.type })
  //     const wr = await Web3StorageHelper.storeFiles([file])
  //     return wr
  //   } catch (error) {
  //     return `something went wrong encrypting: ${error}`
  //   }
  // }

  /**
  * Encrypts a file using Lit and stored it in Web3 Storage
  *
  * @param {File} fileToEncrypt File to encrypt and store on ceramic
  * @returns {Promise<CIDString>} A promise that resolves to a CID for the Zip file that contains the encrypted file that's been stored
  */
  async uploadFile(fileToEncrypt: File): Promise<CIDString> {
    const accessControlConditionType: string = "accessControlConditions"
    // User must posess at least 0.00000 ETH on eth
    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: this.chain,
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '000000000000',
        },
      },
    ]
    try {
      // Encrypt file
      const { encryptedFileBlob, symmetricKey } = await LitHelper.encryptFile(fileToEncrypt)
      // Store encrypted file in IPFS
      const encryptedFile = new File([encryptedFileBlob], fileToEncrypt.name, { type: fileToEncrypt.type })
      const encryptedFileCid = await Web3StorageHelper.storeFiles([encryptedFile])
      // Create metadata file for the encrypted file
      const encryptedFileMetadata: LitHelper.EncryptedFileMetadata = await LitHelper.createEncryptedFileMetadata(
        encryptedFile,
        encryptedFileCid,
        symmetricKey,
        accessControlConditions,
        this.chain
      )
      const encryptedFileMetadataFile = new File([JSON.stringify(encryptedFileMetadata)], 'encryptedFileMetadata.json',{ type: 'application/json' })
      // Store metadata file in Web3 Storage
      const encryptedFileMetadataCid = await Web3StorageHelper.storeFiles([encryptedFileMetadataFile])
      return encryptedFileMetadataCid
    } catch (error) {
      console.log(error)
      return `something went wrong processing file ${fileToEncrypt}: ${error}`
    }
  }

    /**
   * Retrieves a stream and decrypts message then returns to user
   *
   * @param {string} cid the CID of the encrypted data the user wants to access
   * @returns {Promise<Blob>} A promise with the decrypted file Blob
   */
  async retrieveAndDecryptFile(cid: string): Promise<Blob | undefined> {
    try {
      const metadataWeb3Files = await Web3StorageHelper.retrieveFiles(cid)
      if (metadataWeb3Files.length != 1) {
        throw new Error("Retrieved Web3Storage files are more than one. We expect a single zip file")
      }
      const metadataWeb3File = await metadataWeb3Files[0]
      console.log("read from web3Storage: ", metadataWeb3File)
      const metadataString = await metadataWeb3File.text()
      const metadata: LitHelper.EncryptedFileMetadata = JSON.parse(metadataString)
      // Get the actual encrypted file
      const encryptedWeb3File = await Web3StorageHelper.retrieveFiles(metadata.fileCid)
      if (encryptedWeb3File.length != 1) {
        throw new Error("Retrieved Web3Storage files are more than one. We expect a single encrypted file")
      }
      const decryptedFileBlob = await LitHelper.decryptFile(encryptedWeb3File[0], metadata);
      return decryptedFileBlob
    } catch (error) {
      console.log('something went wrong decrypting:', error)
      console.log(`CID sent: ${cid}`)
      return undefined
    }
  }

}
