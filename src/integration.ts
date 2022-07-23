// Don't forget to rebuild
import type { DID } from "dids"
import * as LitHelper from "./lit-helper"
import { _startLitClient } from "./client"
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

  /**
  * Encrypts a file using Lit and stored it in Web3 Storage
  *
  * @param {File} fileToEncrypt File to encrypt and store on ceramic
  * @returns {Promise<CIDString>} A promise that resolves to a CID for the Zip file that contains the encrypted file that's been stored
  */
  async uploadFile(fileToEncrypt: File): Promise<CIDString> {
    try {
      // Encrypt file
      const { encryptedFileBlob, symmetricKey } = await LitHelper.encryptFile(fileToEncrypt)
      // Store encrypted file in IPFS
      const encryptedFile = new File([encryptedFileBlob], fileToEncrypt.name, { type: fileToEncrypt.type })
      const encryptedFileCid = await Web3StorageHelper.storeFiles([encryptedFile])
      const evmContractConditions = [
        {
          contractAddress: "0xcd1B4690F317F3108f34074620A59dF86baB871D",
          functionName: "hasAccess",
          functionParams: [encryptedFileCid, ":userAddress"],
          functionAbi: {
            name: "hasAccess",
            inputs: [
              {
                internalType: "bytes32",
                name: "fileId",
                type: "bytes32"
              },
              {
                internalType: "address",
                name: "recipient",
                type: "address"
              }
            ],
            outputs: [
              {
                internalType: "bool",
                name: "_hasAccess",
                type: "bool"
              }
            ],
            stateMutability: "view",
            payable: false,
            type: "function"
          },
          chain: this.chain,
          returnValueTest: {
            key: "_hasAccess",
            comparator: "=",
            value: true,
          },
        },
      ];
      // Create metadata file for the encrypted file
      const encryptedFileMetadata: LitHelper.EncryptedFileMetadata = await LitHelper.createEncryptedFileMetadata(
        encryptedFile,
        encryptedFileCid,
        symmetricKey,
        evmContractConditions,
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
   * @returns {Promise<File>} A promise with the decrypted file Blob
   */
  async retrieveAndDecryptFile(cid: string): Promise<File | undefined> {
    try {
      const metadataWeb3Files = await Web3StorageHelper.retrieveFiles(cid)
      if (metadataWeb3Files.length != 1) {
        throw new Error("Retrieved Web3Storage files are more than one. We expect a single file")
      }
      const metadataWeb3File = await metadataWeb3Files[0]
      const metadataString = await metadataWeb3File.text()
      const metadata: LitHelper.EncryptedFileMetadata = JSON.parse(metadataString)
      // Get the actual encrypted file
      const encryptedWeb3File = await Web3StorageHelper.retrieveFiles(metadata.fileCid)
      if (encryptedWeb3File.length != 1) {
        throw new Error("Retrieved Web3Storage files are more than one. We expect a single encrypted file")
      }
      const decryptedFileBlob = await LitHelper.decryptFile(encryptedWeb3File[0], metadata);
      return new File([decryptedFileBlob], metadata.fileName, { type: metadata.fileType }) 
    } catch (error) {
      console.log('something went wrong decrypting:', error)
      console.log(`CID sent: ${cid}`)
      return undefined
    }
  }

}
