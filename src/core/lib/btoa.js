/*
 *	Aftermarket implementation of the btoa function, since IE9 does not
 *	support it.
 *
 *	Code partly taken from:
 *	https://github.com/meteor/meteor/blob/devel/packages/base64/base64.js
 *	Copyright (C) 2011--2014 Meteor Development Group
 */

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.btoa = (function () {

	var BASE_64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	var getChar = function (val) {
		return BASE_64_CHARS.charAt(val);
	};

	var newBinary = function (len) {
		var ret = [];
		for (var i = 0; i < len; i++) {
			ret.push(0);
		}
		return ret;
	};

	return function (array) {

		if (typeof array === "string") {
			var str = array;
			array = newBinary(str.length);
			for (var j = 0; j < str.length; j++) {
				var ch = str.charCodeAt(j);
				if (ch > 0xFF) {
					throw new Error("Not ascii. Base64.encode can only take ascii strings");
				}
				array[j] = ch;
			}
		}

		var answer = [];
		var a = null;
		var b = null;
		var c = null;
		var d = null;
		for (var i = 0; i < array.length; i++) {
			switch (i % 3) {
				case 0:
					a = (array[i] >> 2) & 0x3F;
					b = (array[i] & 0x03) << 4;
					break;
				case 1:
					b = b | (array[i] >> 4) & 0xF;
					c = (array[i] & 0xF) << 2;
					break;
				case 2:
					c = c | (array[i] >> 6) & 0x03;
					d = array[i] & 0x3F;
					answer.push(getChar(a));
					answer.push(getChar(b));
					answer.push(getChar(c));
					answer.push(getChar(d));
					a = null;
					b = null;
					c = null;
					d = null;
					break;
			}
		}
		if (a !== null) {
			answer.push(getChar(a));
			answer.push(getChar(b));
			if (c === null) {
				answer.push("=");
			} else {
				answer.push(getChar(c));
			}
			if (d === null) {
				answer.push("=");
			}
		}
		return answer.join("");
	};

})();
