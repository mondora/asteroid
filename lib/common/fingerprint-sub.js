"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = fingerprintSub;
function fingerprintSub(name, params) {
    return JSON.stringify({ name: name, params: params });
}