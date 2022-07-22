import { CIDString, Web3File, Web3Storage } from 'web3.storage'

declare global {
  interface Window {
    web3Storage?: Web3Storage;
    [index: string]: any;
  }
}

function getAccessToken(): string {
  // If you're just testing, you can paste in a token
  // and uncomment the following line:
  // return ''
  // In a real app, it's better to read an access token from an
  // environement variable or other configuration that's kept outside of
  // your code base. For this to work, you need to set the
  // WEB3STORAGE_TOKEN environment variable before you run your code.
  if (process.env.WEB3STORAGE_TOKEN !== undefined)  {
    return process.env.WEB3STORAGE_TOKEN!
  } else {
    throw new Error('Missing WEB3STORAGE_TOKEN env var')
  }
}

function makeStorageClient(): Web3Storage {
  return new Web3Storage(
    { 
      token: getAccessToken(),
      endpoint: new URL('https://api.web3.storage'),
      rateLimiter: undefined,
      fetch: undefined,
    }
 )
}

export async function storeFiles(files: File[]): Promise<CIDString> {
  const client = makeStorageClient()
  const cid = await client.put(files)
  console.log('stored files with cid:', cid)
  return cid
}

export async function storeFilesWithProgress(files: File[]): Promise<CIDString> {
  // show the root cid as soon as it's ready
  const onRootCidReady = (cid: string) => {
    console.log('uploading files with cid:', cid)
  }

  // when each chunk is stored, update the percentage complete and display
  const totalSize = files.map(f => f.size).reduce((a, b) => a + b, 0)
  let uploaded = 0

  const onStoredChunk = (size: number) => {
    uploaded += size
    const pct = totalSize / uploaded
    console.log(`Uploading... ${pct.toFixed(2)}% complete`)
  }

  // makeStorageClient returns an authorized Web3.Storage client instance
  const client = makeStorageClient()
  // client.put will invoke our callbacks during the upload
  // and return the root cid when the upload completes
  return await client.put(files, { onRootCidReady, onStoredChunk })
}

/**
 *
 * @param {CIDString} cid is the file identifier in IPFS
 * @returns {Promise<string>} promise with the ceramic streamID's output
 */
export async function retrieveFiles (cid: CIDString): Promise<Web3File[]>  {
  const client = makeStorageClient()
  const res = await client.get(cid)
  console.log(`Got a response! [${res?.status}] ${res?.statusText}`)
  if (!res?.ok) {
    throw new Error(`failed to get ${cid} - [${res?.status}] ${res?.statusText}`)
  }

  // unpack File objects from the response
  const files = await res.files()
  for (const file of files) {
    console.log(`${file.cid} -- ${file.name} -- ${file.size}`)
  }
  return files
}
