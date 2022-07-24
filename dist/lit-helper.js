"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataForFile = exports.createEncryptedFileMetadata = exports.encryptFile = exports.decryptFile = void 0;
var LitJsSdk = __importStar(require("lit-js-sdk"));
var to_string_1 = require("uint8arrays/to-string");
/**
 * decrypt encrypted file, using metadata and the lit protocol
 * @param {Uint8Array} encryptedFile encrypted file
 * @param {EncryptedFileMetadata} encryptedFileMetadata the metadata associated with the encrypted file, used to decrypt it
 * @returns {Promise<Blob>} promise with the decrypted file Blob
 */
function decryptFile(encryptedFile, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var authSig, symmetricKey, decryptedFileBlob;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    authSig = getAuthSignature();
                    if (authSig == null) {
                        throw new Error("Missing lit-auth-signature");
                    }
                    authSig = JSON.parse(authSig);
                    return [4 /*yield*/, window.litNodeClient.getEncryptionKey({
                            evmContractConditions: metadata.evmContractConditions,
                            toDecrypt: metadata.encryptedSymmetricKey,
                            chain: metadata.chain,
                            authSig: authSig
                        })];
                case 1:
                    symmetricKey = _a.sent();
                    return [4 /*yield*/, LitJsSdk.decryptFile({
                            symmetricKey: symmetricKey,
                            file: encryptedFile,
                        })];
                case 2:
                    decryptedFileBlob = _a.sent();
                    return [2 /*return*/, decryptedFileBlob];
            }
        });
    });
}
exports.decryptFile = decryptFile;
var getAuthSignature = function () {
    var authSig = localStorage.getItem("lit-auth-signature");
    if (authSig != null) {
        var length_1 = authSig === null || authSig === void 0 ? void 0 : authSig.length;
        authSig = authSig.slice(1, length_1 - 1);
    }
    return authSig;
};
/**
 * Encrypt a single file using the Lit
 * @param {File} params.file The file you wish to encrypt
 * @returns {Promise<Object>} A promise containing an object with 2 keys: encryptedFileBlob and symmetricKey. encryptedFileBlob is the encrypted file
 */
function encryptFile(file) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, encryptedFile, symmetricKey;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, LitJsSdk.encryptFile({ file: file })];
                case 1:
                    _a = _b.sent(), encryptedFile = _a.encryptedFile, symmetricKey = _a.symmetricKey;
                    return [2 /*return*/, { encryptedFileBlob: encryptedFile, symmetricKey: symmetricKey }];
            }
        });
    });
}
exports.encryptFile = encryptFile;
/**
 * encrypts a message with Lit returns required details
 * this obfuscates data such that it can be stored on ceramic without
 * non-permissioned eyes seeing what the data is
 * @param {string} fileToEncrypt the file you'd like encrypted
 * @param {Array<Object>} evmContractConditions the access control conditions that govern who is able to decrypt this data.  See the docs here for examples: https://developer.litprotocol.com/docs/SDK/accessControlConditionExamples
 * @param {string} chain the chain you'd like to use for checking the access control conditions
 * @returns {Promise<EncryptedFileMetadata>} Encrypted file metadata used to retrieve and decrypt it
 */
function createEncryptedFileMetadata(encriptedFile, encryptedFileCid, symmetricKey, evmContractConditions, chain) {
    return __awaiter(this, void 0, void 0, function () {
        var authSig, encryptedSymmetricKey, metadata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    authSig = getAuthSignature();
                    if (authSig == null) {
                        throw new Error("Missing lit-auth-signature");
                    }
                    authSig = JSON.parse(authSig);
                    return [4 /*yield*/, window.litNodeClient.saveEncryptionKey({
                            evmContractConditions: evmContractConditions,
                            symmetricKey: symmetricKey,
                            authSig: authSig,
                            chain: chain,
                        })
                        // create metadata
                    ];
                case 1:
                    encryptedSymmetricKey = _a.sent();
                    metadata = metadataForFile(encryptedFileCid, encriptedFile.name, encriptedFile.type, encriptedFile.size, [], evmContractConditions, [], [], chain, encryptedSymmetricKey);
                    return [2 /*return*/, metadata];
            }
        });
    });
}
exports.createEncryptedFileMetadata = createEncryptedFileMetadata;
function metadataForFile(fileCid, fileName, fileType, fileSize, accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions, chain, encryptedSymmetricKey) {
    return {
        fileCid: fileCid,
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSize,
        accessControlConditions: accessControlConditions,
        evmContractConditions: evmContractConditions,
        solRpcConditions: solRpcConditions,
        unifiedAccessControlConditions: unifiedAccessControlConditions,
        chain: chain,
        encryptedSymmetricKey: (0, to_string_1.toString)(encryptedSymmetricKey, "base16"),
    };
}
exports.metadataForFile = metadataForFile;
