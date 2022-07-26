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

export type FileInfo = {
  fileCid: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export type UploadData = {
  metadataCid: string;
  fileCid: string;
}

export class Integration {
  chain: string

  constructor(chainParam: string = "ethereum") {
    this.chain = chainParam;
  }

  startLitClient(window: Window) {
    _startLitClient(window);
  }

  async hash(data: string) {
    const utf8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return "0x"+hashHex;
  }

  /**
  * Encrypts a file using Lit and stored it in Web3 Storage
  *
  * @param {File} fileToEncrypt File to encrypt and store on ceramic
  * @returns {Promise<UploadData>} A promise that resolves to a CID for the Zip file that contains the encrypted file that's been stored and the encrypted file CID
  */
  async uploadFile(fileToEncrypt: File): Promise<UploadData> {
    try {
      // Encrypt file
      const { encryptedFileBlob, symmetricKey } = await LitHelper.encryptFile(fileToEncrypt)
      // Store encrypted file in IPFS
      const encryptedFile = new File([encryptedFileBlob], fileToEncrypt.name, { type: fileToEncrypt.type })
      const encryptedFileCid = await Web3StorageHelper.storeFiles([encryptedFile])
      const hashedEncryptedFileCid = await this.hash(encryptedFileCid);
      const evmContractConditions = [
        {
          contractAddress: "0x9fa4f2c292f5e57ae59d786d1275e1623dada93c",
          functionName: "hasAccess",
          functionParams: [hashedEncryptedFileCid, ":userAddress"],
          functionAbi: {
            name: "hasAccess",
            type: "function",
            constant: true,
            stateMutability: "view",
            inputs: [
              {
                name: "fileId",
                type: "bytes32"
              },
              {
                name: "recipient",
                type: "address"
              },
            ],
            outputs: [
              {
                name: "_hasAccess",
                type: "bool"
              },
            ],
          },
          chain: this.chain,
          returnValueTest: {
            key: "_hasAccess",
            comparator: "=",
            value: "true",
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
      return {
        metadataCid: encryptedFileMetadataCid,
        fileCid: encryptedFileCid,
      }
    } catch (error) {
      throw new Error(`something went wrong processing file ${fileToEncrypt}: ${error}`)
    }
  }

  /**
   * Retrieves a stream and decrypts message then returns to user
   *
   * @param {string} cid the CID of the encrypted data the user wants to access
   * @returns {Promise<File>} A promise with the decrypted file Blob
   */
  async retrieveAndDecryptFile(cid: string): Promise<File> {
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
      throw new Error(`something went wrong decrypting CID: ${cid}: ${error}`)
    }
  }

  /**
   * Retrieves the metadata for a stored file
   *
   * @param {string} cid the CID of the metadata for the file the user wants to access
   * @returns {Promise<FileInfo>} A promise with the FileInfo data
   */
    async retrieveFileMetadata(cid: string): Promise<FileInfo> {
    try {
      const metadataWeb3Files = await Web3StorageHelper.retrieveFiles(cid)
      if (metadataWeb3Files.length != 1) {
        throw new Error("Retrieved Web3Storage files are more than one. We expect a single file for the metadata")
      }
      const metadataWeb3File = await metadataWeb3Files[0]
      const metadataString = await metadataWeb3File.text()
      const metadata: LitHelper.EncryptedFileMetadata = JSON.parse(metadataString)
      return {
        fileCid: metadata.fileCid,
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        fileType: metadata.fileType,
      } 
    } catch (error) {
      throw new Error(`something went wrong retrieving metadata with CID: ${cid}: ${error}`)
    }
  }

}
