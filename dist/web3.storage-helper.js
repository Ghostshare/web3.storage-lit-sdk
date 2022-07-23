"use strict";
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
exports.retrieveFiles = exports.storeFilesWithProgress = exports.storeFiles = void 0;
var web3_storage_1 = require("web3.storage");
function getAccessToken() {
    // If you're just testing, you can paste in a token
    // and uncomment the following line:
    // return ''
    // In a real app, it's better to read an access token from an
    // environement variable or other configuration that's kept outside of
    // your code base. For this to work, you need to set the
    // WEB3STORAGE_TOKEN environment variable before you run your code.
    if (process.env.WEB3STORAGE_TOKEN !== undefined) {
        return process.env.WEB3STORAGE_TOKEN;
    }
    else {
        throw new Error('Missing WEB3STORAGE_TOKEN env var');
    }
}
function makeStorageClient() {
    return new web3_storage_1.Web3Storage({
        token: getAccessToken(),
        endpoint: new URL('https://api.web3.storage'),
        rateLimiter: undefined,
        fetch: undefined,
    });
}
function storeFiles(files) {
    return __awaiter(this, void 0, void 0, function () {
        var client, cid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = makeStorageClient();
                    return [4 /*yield*/, client.put(files)];
                case 1:
                    cid = _a.sent();
                    console.log('stored files with cid:', cid);
                    return [2 /*return*/, cid];
            }
        });
    });
}
exports.storeFiles = storeFiles;
function storeFilesWithProgress(files) {
    return __awaiter(this, void 0, void 0, function () {
        var onRootCidReady, totalSize, uploaded, onStoredChunk, client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    onRootCidReady = function (cid) {
                        console.log('uploading files with cid:', cid);
                    };
                    totalSize = files.map(function (f) { return f.size; }).reduce(function (a, b) { return a + b; }, 0);
                    uploaded = 0;
                    onStoredChunk = function (size) {
                        uploaded += size;
                        var pct = totalSize / uploaded;
                        console.log("Uploading... ".concat(pct.toFixed(2), "% complete"));
                    };
                    client = makeStorageClient();
                    return [4 /*yield*/, client.put(files, { onRootCidReady: onRootCidReady, onStoredChunk: onStoredChunk })];
                case 1: 
                // client.put will invoke our callbacks during the upload
                // and return the root cid when the upload completes
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.storeFilesWithProgress = storeFilesWithProgress;
/**
 *
 * @param {CIDString} cid is the file identifier in IPFS
 * @returns {Promise<string>} promise with the ceramic streamID's output
 */
function retrieveFiles(cid) {
    return __awaiter(this, void 0, void 0, function () {
        var client, res, files, _i, files_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = makeStorageClient();
                    return [4 /*yield*/, client.get(cid)];
                case 1:
                    res = _a.sent();
                    console.log("Got a response! [".concat(res === null || res === void 0 ? void 0 : res.status, "] ").concat(res === null || res === void 0 ? void 0 : res.statusText));
                    if (!(res === null || res === void 0 ? void 0 : res.ok)) {
                        throw new Error("failed to get ".concat(cid, " - [").concat(res === null || res === void 0 ? void 0 : res.status, "] ").concat(res === null || res === void 0 ? void 0 : res.statusText));
                    }
                    return [4 /*yield*/, res.files()];
                case 2:
                    files = _a.sent();
                    for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                        file = files_1[_i];
                        console.log("".concat(file.cid, " -- ").concat(file.name, " -- ").concat(file.size));
                    }
                    return [2 /*return*/, files];
            }
        });
    });
}
exports.retrieveFiles = retrieveFiles;
