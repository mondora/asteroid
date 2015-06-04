(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['ddp.js', 'q'], factory);
    } else if (typeof exports === "object") {
        var DDP = require('ddp.js');
        var Q = require('q');
        
        module.exports = factory(DDP, Q);
    } else {
        root.Asteroid = factory(root.DDP, root.Q);
    }
}(this, function (DDP, Q) {

"use strict";
