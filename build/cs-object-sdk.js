(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/common/content', [], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.Content = factory();
    }
}(this, function () {
    var uploadStatus = "";
    var chunkSize = 5;
    var extendOption = {};
    var isNeedCancelCallback = false;

    return {
        HOSTS: {
            PREPRODUCTION: {host: "betacs.101.com", uc: "https://ucbetapi.101.com/v0.93/"},              // 预生产环境
            PRODUCTION: {host: "cs.101.com", uc: "https://aqapi.101.com/v0.93/"},                        // 生产环境
            DEBUG: {host: "sdpcs.debug.web.nd", uc: "http://101uccenter.debug.web.nd/v0.93/"},           // 测试环境
            DEV: {host: "sdpcs.dev.web.nd", uc: "https://ucbetapi.101.com/v0.93/"},                      // 开发环境
            AWS: {host: "awscs.101.com", uc: "https://awsuc.101.com/v0.93/"},                            // AWS环境-新加坡
            AWSUS: {host: "cs-awsca.101.com", uc: "https://awsuc.101.com/v0.93/"}                        // AWS环境-加利福尼亚
        },
        VERSION: "/v0.1",
        JSONTYPE: 'application/json',                //默认请求Content_type
        PROTOCOL: "http://",
        HOST_EXPIRES: 3600,                          //host 缓存时间 默认3600s
        MAXFILESIZE: '5120M',                        //最大支持上传的文件大小  5G
        CALMD5CHUNK:10,                               //计算md5 读取的分块大小
        RETRYTIMES: 3,                               //sdk重试次数设置
        HOST: "cs.101.com",                          //默认cs地址
        UCHOST: "https://aqapi.101.com/v0.93/",      //默认uc地址
        ENV: "PRODUCTION",                           //默认环境
        THUMB_SIZE: [80, 120, 160, 240, 320, 480, 640, 960, 1080, 1200],           //允许下载的缩略图尺寸

        TOKENTYPE: {                                 //请求token的接口枚举
            UPLOAD_NORMAL: "UPLOAD_NORMAL",
            UPLOAD_DIRECT: "UPLOAD_DIRECT",
            STATUS: "STATUS",
            QUICK: "QUICK",
            DOWNLOAD_ID: "DOWNLOAD_ID",
            DOWNLOAD_PATH: "DOWNLOAD_PATH",
            DOWNLOAD_STATIC: "DOWNLOAD_STATIC",
            UPDATE: "UPDATE",
            LIST_ID: "LIST_ID",
            LIST_PATH: "LIST_PATH",
            DELETE_ID: "DELETE_ID",
            DELETE_PATH: "DELETE_PATH",
            READ_ID: "READ_ID",
            READ_PATH: "READ_PATH",
            VALID: "VALID"
        },


        /**
         * @param option    ajax配置
         * @param onNotifyProgress  进度方法
         * @param onNotifySuccess      成功处理方法
         * @param onNotifyFail      失败处理方法
         */
        send: function (option, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            if (typeof onNotifyFail === "undefined") {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = onNotifyProgress;
                onNotifyProgress = null;
            }
            option.url = this.urlProcess(option.url);
            var retryTimes = this.RETRYTIMES;
            var callbackConfig = {
                success: function (data, status, xhr) {
                    data = data || {};
                    if (xhr.getResponseHeader("ETag")) {
                        data.etag = xhr.getResponseHeader("ETag");
                    }
                    //避免回调出错情况  400错误码不重试
                    if (data.status > 400) {
                        onNotifySuccess = null;
                        if (retryTimes-- >= 0) {
                            $.ajax($.extend(option, callbackConfig));
                        } else {
                            onNotifyFail(data);
                        }
                    } else {
                        if (typeof (onNotifySuccess) == "function") {
                            onNotifySuccess(data);
                        }
                    }
                },
                error: function (error) {
                    //避免回调出错情况
                    if (error.status === 200 || error.status === 201) {
                        onNotifySuccess(error);
                    } else {
                        if (error && error.status < 400 && error.status >= 500 && retryTimes-- >= 0) {
                            $.ajax($.extend(option, callbackConfig));
                        } else {
                            //如果没有传入错误处理方法，则采用默认处理方式
                            if (typeof (onNotifyFail) == "function") {
                                onNotifyFail(error);
                            }
                        }
                    }
                },
                xhr: function () {
                    var that = this;
                    var xhr = $.ajaxSettings.xhr();
                    //上传进度回调
                    if (xhr.upload) {
                        xhr.upload.addEventListener('progress', function (e) {
                            //取消上传
                            if (uploadStatus === "stop") {
                                //用户主动终止 设置标志
                                that.isAbort = true;
                                xhr.abort();
                            }
                            if (typeof onNotifyProgress === "function") {
                                onNotifyProgress(e);
                            }
                        }, false);
                    }
                    return xhr;
                },
                async: true
            };
            option = $.extend(option, callbackConfig);

            //用户自定义ajax扩展
            if (Object.getOwnPropertyNames(extendOption).length > 0) {
                option = $.extend(extendOption, option);
            }
            $.ajax(option);
        },

        //设置当前上传状态
        setUploadStatus: function (status) {
            uploadStatus = status;
        },

        getUploadStatus: function () {
            return uploadStatus;
        },

        setChunkSize: function (chunk) {
            chunkSize = parseInt(chunk);
            if(chunkSize < 1){
                chunkSize = 1;
            }
            if(chunkSize > 10){
                chunkSize = 10;
            }
        },


        //设置是否需要主动终止上传回调
        setCancelCallback:function(flag){
            isNeedCancelCallback = flag;
        },

        //设置是否需要主动终止上传回调
        getCancelCallback:function(){
            return isNeedCancelCallback;
        },

        getChunkSize: function () {
            return chunkSize;
        },

        /**
         * url预处理
         * @param url
         */
        urlProcess: function (url) {
            var urlParams = url.split("://");
            var protocol;
            var uri;
            if (urlParams.length <= 1) {
                protocol = "http";
                uri = urlParams[0].replace("//", "/");
            } else {
                protocol = urlParams[0];
                uri = urlParams[1].replace("//", "/");
            }
            //将所有空格转成+
            url = (protocol + "://" + uri).replace(/\s+/g, "+").replace(/#/g, "%23");

            //生产环境不打印请求URL
            if (this.ENV !== "PRODUCTION") {
                console.log("request url:" + url);
            }
            return url;
        },

        /**
         * 设置用户自定义option
         * @param options
         */
        setAjaxOption: function (options) {
            if (typeof options === "object") {
                extendOption = options;
            }
        },

        /**
         * @param name       缓存名称
         * @param value      缓存值
         * @param type       类型  session-sessionStorage
         */
        setStorage: function (name, value, type) {

            var storage;
            if (type === "session") {
                if (window.sessionStorage) {
                    storage = window.sessionStorage;
                }
            } else {
                if (window.localStorage) {
                    storage = window.localStorage;
                }
            }
            //浏览器不支持sessionStorage或者localStorage
            if (!storage) {
                return;
            }

            if (typeof value !== "string") {
                value = JSON.stringify(value);
            }
            value.replace("%2F", "/");

            try {
                if (value) {
                    storage.setItem(name.trim(), value);
                } else {
                    storage.removeItem(name.trim());
                }
            } catch (e) {
                //容量超出本地存储限制
                storage.clear();
                storage.setItem(name.trim(), value);
            }
        },
        /**
         * @param name      cookie名称
         * @param type
         */
        getStorage: function (name, type) {

            var storage;
            if (type === "session") {
                if (window.sessionStorage) {
                    storage = window.sessionStorage;
                }
            } else {
                if (window.localStorage) {
                    storage = window.localStorage;
                }
            }
            //浏览器不支持sessionStorage或者localStorage
            if (!storage) {
                return "";
            }

            return storage.getItem(name.trim());

        },
        /**
         * 设置全局host
         * @param env
         */
        setEnv: function (env) {
            this.HOST = this.HOSTS[env].host;
            this.UCHOST = this.HOSTS[env].uc;
            this.ENV = env;
        }
    };
}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/lib/spark-md5',[], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require());
    } else {
        root.SparkMD5 = factory();
    }
}(this, function () {
    'use strict';

    /*
     * Fastest md5 implementation around (JKM md5).
     * Credits: Joseph Myers
     *
     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
     * @see http://jsperf.com/md5-shootout/7
     */

    /* this function is much faster,
     so if possible we use it. Some IEs
     are the only ones I know of that
     need the idiotic second function,
     generated by an if clause.  */
    var add32 = function (a, b) {
            return (a + b) & 0xFFFFFFFF;
        },
        hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];


    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function md5cycle(x, k) {
        var a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];

        a += (b & c | ~b & d) + k[0] - 680876936 | 0;
        a  = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[1] - 389564586 | 0;
        d  = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[2] + 606105819 | 0;
        c  = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
        b  = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[4] - 176418897 | 0;
        a  = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
        d  = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
        c  = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[7] - 45705983 | 0;
        b  = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
        a  = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
        d  = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[10] - 42063 | 0;
        c  = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
        b  = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
        a  = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[13] - 40341101 | 0;
        d  = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
        c  = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
        b  = (b << 22 | b >>> 10) + c | 0;

        a += (b & d | c & ~d) + k[1] - 165796510 | 0;
        a  = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
        d  = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[11] + 643717713 | 0;
        c  = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[0] - 373897302 | 0;
        b  = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[5] - 701558691 | 0;
        a  = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[10] + 38016083 | 0;
        d  = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[15] - 660478335 | 0;
        c  = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[4] - 405537848 | 0;
        b  = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[9] + 568446438 | 0;
        a  = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
        d  = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[3] - 187363961 | 0;
        c  = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
        b  = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
        a  = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[2] - 51403784 | 0;
        d  = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
        c  = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
        b  = (b << 20 | b >>> 12) + c | 0;

        a += (b ^ c ^ d) + k[5] - 378558 | 0;
        a  = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
        d  = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
        c  = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[14] - 35309556 | 0;
        b  = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
        a  = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
        d  = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[7] - 155497632 | 0;
        c  = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
        b  = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[13] + 681279174 | 0;
        a  = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[0] - 358537222 | 0;
        d  = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[3] - 722521979 | 0;
        c  = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[6] + 76029189 | 0;
        b  = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[9] - 640364487 | 0;
        a  = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[12] - 421815835 | 0;
        d  = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[15] + 530742520 | 0;
        c  = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[2] - 995338651 | 0;
        b  = (b << 23 | b >>> 9) + c | 0;

        a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
        a  = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
        d  = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
        c  = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
        b  = (b << 21 |b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
        a  = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
        d  = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
        c  = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
        b  = (b << 21 |b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
        a  = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
        d  = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
        c  = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
        b  = (b << 21 |b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
        a  = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
        d  = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
        c  = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
        b  = (b << 21 | b >>> 11) + c | 0;

        x[0] = a + x[0] | 0;
        x[1] = b + x[1] | 0;
        x[2] = c + x[2] | 0;
        x[3] = d + x[3] | 0;
    }

    function md5blk(s) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    function md5blk_array(a) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
    }

    function md51(s) {
        var n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        length = s.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);
        return state;
    }

    function md51_array(a) {
        var n = a.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
        }

        // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
        // containing the last element of the parent array if the sub array specified starts
        // beyond the length of the parent array - weird.
        // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
        a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);

        length = a.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= a[i] << ((i % 4) << 3);
        }

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);

        return state;
    }

    function rhex(n) {
        var s = '',
            j;
        for (j = 0; j < 4; j += 1) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    }

    function hex(x) {
        var i;
        for (i = 0; i < x.length; i += 1) {
            x[i] = rhex(x[i]);
        }
        return x.join('');
    }

    // In some cases the fast add32 function cannot be used..
    if (hex(md51('hello')) !== '5d41402abc4b2a76b9719d911017c592') {
        add32 = function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        };
    }

    // ---------------------------------------------------

    /**
     * ArrayBuffer slice polyfill.
     *
     * @see https://github.com/ttaubert/node-arraybuffer-slice
     */

    if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
        (function () {
            function clamp(val, length) {
                val = (val | 0) || 0;

                if (val < 0) {
                    return Math.max(val + length, 0);
                }

                return Math.min(val, length);
            }

            ArrayBuffer.prototype.slice = function (from, to) {
                var length = this.byteLength,
                    begin = clamp(from, length),
                    end = length,
                    num,
                    target,
                    targetArray,
                    sourceArray;

                if (to !== undefined) {
                    end = clamp(to, length);
                }

                if (begin > end) {
                    return new ArrayBuffer(0);
                }

                num = end - begin;
                target = new ArrayBuffer(num);
                targetArray = new Uint8Array(target);

                sourceArray = new Uint8Array(this, begin, num);
                targetArray.set(sourceArray);

                return target;
            };
        })();
    }

    // ---------------------------------------------------

    /**
     * Helpers.
     */

    function toUtf8(str) {
        if (/[\u0080-\uFFFF]/.test(str)) {
            str = unescape(encodeURIComponent(str));
        }

        return str;
    }

    function utf8Str2ArrayBuffer(str, returnUInt8Array) {
        var length = str.length,
            buff = new ArrayBuffer(length),
            arr = new Uint8Array(buff),
            i;

        for (i = 0; i < length; i += 1) {
            arr[i] = str.charCodeAt(i);
        }

        return returnUInt8Array ? arr : buff;
    }

    function arrayBuffer2Utf8Str(buff) {
        return String.fromCharCode.apply(null, new Uint8Array(buff));
    }

    function concatenateArrayBuffers(first, second, returnUInt8Array) {
        var result = new Uint8Array(first.byteLength + second.byteLength);

        result.set(new Uint8Array(first));
        result.set(new Uint8Array(second), first.byteLength);

        return returnUInt8Array ? result : result.buffer;
    }

    function hexToBinaryString(hex) {
        var bytes = [],
            length = hex.length,
            x;

        for (x = 0; x < length - 1; x += 2) {
            bytes.push(parseInt(hex.substr(x, 2), 16));
        }

        return String.fromCharCode.apply(String, bytes);
    }

    // ---------------------------------------------------

    /**
     * SparkMD5 OOP implementation.
     *
     * Use this class to perform an incremental md5, otherwise use the
     * static methods instead.
     */

    function SparkMD5() {
        // call reset to init the instance
        this.reset();
    }

    /**
     * Appends a string.
     * A conversion will be applied if an utf8 string is detected.
     *
     * @param {String} str The string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.append = function (str) {
        // Converts the string to utf8 bytes if necessary
        // Then append as binary
        this.appendBinary(toUtf8(str));

        return this;
    };

    /**
     * Appends a binary string.
     *
     * @param {String} contents The binary string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.appendBinary = function (contents) {
        this._buff += contents;
        this._length += contents.length;

        var length = this._buff.length,
            i;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
        }

        this._buff = this._buff.substring(i - 64);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            i,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = hex(this._hash);

        if (raw) {
            ret = hexToBinaryString(ret);
        }

        this.reset();

        return ret;
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.reset = function () {
        this._buff = '';
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */
    SparkMD5.prototype.getState = function () {
        return {
            buff: this._buff,
            length: this._length,
            hash: this._hash
        };
    };

    /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.setState = function (state) {
        this._buff = state.buff;
        this._length = state.length;
        this._hash = state.hash;

        return this;
    };

    /**
     * Releases memory used by the incremental buffer and other additional
     * resources. If you plan to use the instance again, use reset instead.
     */
    SparkMD5.prototype.destroy = function () {
        delete this._hash;
        delete this._buff;
        delete this._length;
    };

    /**
     * Finish the final calculation based on the tail.
     *
     * @param {Array}  tail   The tail (will be modified)
     * @param {Number} length The length of the remaining buffer
     */
    SparkMD5.prototype._finish = function (tail, length) {
        var i = length,
            tmp,
            lo,
            hi;

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(this._hash, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Do the final computation based on the tail and length
        // Beware that the final length may not fit in 32 bits so we take care of that
        tmp = this._length * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;
        md5cycle(this._hash, tail);
    };

    /**
     * Performs the md5 hash on a string.
     * A conversion will be applied if utf8 string is detected.
     *
     * @param {String}  str The string
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.hash = function (str, raw) {
        // Converts the string to utf8 bytes if necessary
        // Then compute it using the binary function
        return SparkMD5.hashBinary(toUtf8(str), raw);
    };

    /**
     * Performs the md5 hash on a binary string.
     *
     * @param {String}  content The binary string
     * @param {Boolean} raw     True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.hashBinary = function (content, raw) {
        var hash = md51(content),
            ret = hex(hash);

        return raw ? hexToBinaryString(ret) : ret;
    };

    // ---------------------------------------------------

    /**
     * SparkMD5 OOP implementation for array buffers.
     *
     * Use this class to perform an incremental md5 ONLY for array buffers.
     */
    SparkMD5.ArrayBuffer = function () {
        // call reset to init the instance
        this.reset();
    };

    /**
     * Appends an array buffer.
     *
     * @param {ArrayBuffer} arr The array to be appended
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.append = function (arr) {
        var buff = concatenateArrayBuffers(this._buff.buffer, arr, true),
            length = buff.length,
            i;

        this._length += arr.byteLength;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
        }

        this._buff = (i - 64) < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.ArrayBuffer.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            i,
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = hex(this._hash);

        if (raw) {
            ret = hexToBinaryString(ret);
        }

        this.reset();

        return ret;
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.reset = function () {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */
    SparkMD5.ArrayBuffer.prototype.getState = function () {
        var state = SparkMD5.prototype.getState.call(this);

        // Convert buffer to a string
        state.buff = arrayBuffer2Utf8Str(state.buff);

        return state;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.setState = function (state) {
        // Convert string to buffer
        state.buff = utf8Str2ArrayBuffer(state.buff, true);

        return SparkMD5.prototype.setState.call(this, state);
    };

    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;

    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;

    /**
     * Performs the md5 hash on an array buffer.
     *
     * @param {ArrayBuffer} arr The array buffer
     * @param {Boolean}     raw True to get the raw string, false to get the hex one
     *
     * @return {String} The result
     */
    SparkMD5.ArrayBuffer.hash = function (arr, raw) {
        var hash = md51_array(new Uint8Array(arr)),
            ret = hex(hash);

        return raw ? hexToBinaryString(ret) : ret;
    };

    return SparkMD5;
}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/common/httpclient', ['../common/content'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../common/content'));
    } else {
        root.CSHttpClient = factory(root.Content);
    }
}(this, function (Content) {
    return {
        /**
         * 执行GET请求
         * @param url
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doGetRequest: function (url, onNotifySuccess, onNotifyFail) {
            Content.send({
                url: url,
                type: "GET",
                dataType: 'json'
            }, onNotifySuccess, onNotifyFail);
        },
        /**
         * 执行POST请求
         * @param url
         * @param body
         * @param headers
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doPostRequest: function (url, body, headers, onNotifySuccess, onNotifyFail) {
            if ('function' === typeof headers) {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = headers;
                headers = {};
            }
            var datatype = headers.dataType || 'json';
            var contentType = headers.contentType || Content.JSONTYPE;
            delete headers.contentType;
            delete headers.dataType;
            Content.send({
                url: url,
                type: "POST",
                dataType: datatype,
                headers: headers,
                contentType: contentType,
                data: body
            }, onNotifySuccess, onNotifyFail);
        },

        /**
         * 执行POST请求
         * @param url
         * @param method
         * @param headers
         * @param body
         * @param onNotifyProgress
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doUploadRequest: function (url, method, headers, body, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            var contentType = headers.contentType || false;
            delete headers.contentType;
            var dataType = body instanceof Blob ? "xml" : "json";
            Content.send({
                url: url,
                type: method,
                headers: headers,
                contentType: contentType,
                dataType: dataType,
                processData: false,
                data: body
            }, onNotifyProgress, onNotifySuccess, onNotifyFail);
        },

        /**
         * 执行PUT请求
         * @param url
         * @param body
         * @param headers
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doPutRequest: function (url, body, headers, onNotifySuccess, onNotifyFail) {
            if ('function' === typeof headers) {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = headers;
                headers = {};
            }
            Content.send({
                url: url,
                type: "PUT",
                data: body,
                dataType: 'json',
                contentType: Content.JSONTYPE,
                headers: headers,
                processData: false
            }, onNotifySuccess, onNotifyFail);
        },
        /**
         * 执行DELETE请求
         * @param url
         * @param headers
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doDeleteRequest: function (url, headers, onNotifySuccess, onNotifyFail) {
            if ('function' === typeof headers) {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = headers;
                headers = {};
            }
            Content.send({
                url: url,
                type: "DELETE",
                dataType: 'json',
                headers: headers,
                contentType: Content.JSONTYPE
            }, onNotifySuccess, onNotifyFail);
        },
        /**
         * 执行PATCH请求
         * @param url
         * @param body
         * @param headers
         * @param onNotifySuccess
         * @param onNotifyFail
         */
        doPatchRequest: function (url, body, headers, onNotifySuccess, onNotifyFail) {
            if ('function' === typeof headers) {
                onNotifyFail = onNotifySuccess;
                onNotifySuccess = headers;
                headers = {};
            }
            Content.send({
                url: url,
                type: "PATCH",
                dataType: "json",
                headers: headers,
                contentType: Content.JSONTYPE,
                data: body
            }, onNotifySuccess, onNotifyFail);
        }
    };
}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('./cssdk/common/utils', ['../lib/spark-md5','../common/content'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS之类的
        module.exports = factory(
            require('../lib/spark-md5'),
            require('../common/content')
        );
    } else {
        // 浏览器全局变量(root 即 window)
        root.CSUtils = factory(root.SparkMD5,root.Content);
    }
}(this, function (SparkMD5,Content) {

    var hasError = false;
    var errorInfo = [];
    var paramsData = {};
    paramsData.params = [];

    paramsData.addParam = function (rule, name, value) {
        paramsData.params.push({rule: rule, name: name, value: value});
        return this;
    };

    return {
        params: paramsData,

        //对象深度拷贝 避免变量污染
        deepCopy: function (source) {
            var result = {};
            for (var key in source) {
                result[key] = typeof source[key] === "object" ? this.deepCopy(source[key]) : source[key];
            }
            return result;
        },

        objToFormdata: function (obj) {
            var formData = new FormData();
            for (var prop in obj) {
                if (typeof(obj[prop]) == "function") {
                    obj[prop]();
                } else {
                    formData.append(prop, obj[prop]);
                }
            }
            return formData;
        },

        randomString: function (length) {
            length = length || 32;
            var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
            /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
            var maxPos = chars.length;
            var randomStr = '';
            for (var i = 0; i < length; i++) {
                randomStr += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return randomStr;
        },

        hashCode: function (file) {
            var input = file.name + file.size + file.type + file.lastModifiedDate;

            var I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
            var hash = 5381;
            var i = input.length - 1;

            if (typeof input == 'string') {
                for (; i > -1; i--) {
                    hash += (hash << 5) + input.charCodeAt(i);
                }
            } else {
                for (; i > -1; i--) {
                    hash += (hash << 5) + input[i];
                }
            }
            var value = hash & 0x7FFFFFFF;
            var retValue = '';
            do {
                retValue += I64BIT_TABLE[value & 0x3F];
            } while (value >>= 6);
            return retValue;
        },


        //计算文件md5
        calMd5: function (file, onNotifyProgress,onNotifySuccess,onNotifyFail) {

            //大文件算md5 优化进度显示 md5计算占总进度的5%
            var progress = {
                file_hash: file.hash,
                total: file.size
            };

            var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                chunkSize = Content.CALMD5CHUNK * 1024 *1024, // read in chunks of 2MB
                chunks = Math.ceil(file.size / chunkSize),
                currentChunk = 0,
                spark = new SparkMD5.ArrayBuffer(),
                frOnload = function (e) {
                    spark.append(e.target.result); // append array buffer
                    currentChunk++;
                    if (currentChunk < chunks){

                        //不能算文件实际上传大小
                        progress.loaded = currentChunk * chunkSize * 0.1;
                        if (Content.getUploadStatus() === "stop") {
                            onNotifyFail("upload cancelled");
                            return;
                        }

                        if(typeof onNotifyProgress === "function"){
                            onNotifyProgress(progress);
                        }
                        loadNext();
                    }
                    else{
                        onNotifySuccess(spark.end());
                    }
                },
                frOnerror = function () {
                    throw new Error("\noops, something went wrong.");
                };

            function loadNext() {
                var fileReader = new FileReader();
                fileReader.onload = frOnload;
                fileReader.onerror = frOnerror;
                var start = currentChunk * chunkSize,
                    end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
                fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
            }

            loadNext();
        },


        /**
         * 检查是否为数字
         * @param  str
         * @return {Boolean} true：数字，false:<b>不是</b>数字;
         */
        isNum: function (str) {
            if (typeof(str) == "number") return true;
            var patt = new RegExp("^[0-9]+$");
            return patt.test(str);
        },

        /**
         * 检查字符不为空
         *
         * @param  str
         * @return {Boolean} <b>字符为空</b>返回true,否则为false;
         */
        isEmpty: function (str) {
            return !(typeof(str) === "string" && str !== "");
        },

        /**
         * 检查是否为对象
         *
         * @param  obj
         * @return {Boolean} <b>字符为空</b>返回true,否则为false;
         */
        isObject: function (obj) {
            return obj !== null && typeof(obj) === "object";
        },

        /**
         * 检查字符不为空(去除空格后)
         *
         * @param  str
         * @return {Boolean} <b>字符为空</b>返回true,否则为false;
         */
        isBlank: function (str) {
            return !(typeof(str) === "string" && str.trim() !== "");
        },


        /**
         * 检查字符不为空(去除空格后)
         *
         * @param  str
         * @return {Boolean} <b>字符为空</b>返回false,否则为true;
         */
        isNotBlank: function (str) {
            return typeof(str) === "string" && str.trim() !== "";
        },


        /**
         * 检查数值是否在给定范围以内,为空,不做检查<br>
         *
         * @param  str_num
         *
         * @return {Boolean} <b>小于最小数值或者大于最大数值</b>数字返回false 否则返回true;
         * @param min
         * @param max
         */
        isRangeNum: function (str_num, min, max) {
            // 检查是否为数字
            if (isNum(str_num)) {
                if (str_num >= min && str_num <= max)
                    return true;
            }
            return false;
        },

        /**
         * 检查字符串是否在给定长度范围以内(中文字符以2个字节计算),字符为空,不做检查<br>
         *
         * @param  str 检查的字符
         * @param  lessLen 应该大于或者等于的长度
         * @param  moreLen 应该小于或者等于的长度
         *
         * @return {Boolean} <b>小于最小长度或者大于最大长度</b>数字返回false;
         */
        isRange: function (str, lessLen, moreLen) {
            if (typeof(str) !== "string") return false;
            var strLen = str.length;
            if (lessLen != -1 && strLen < lessLen)
                return false;
            if (moreLen != -1 && strLen > moreLen)
                return false;

            return true;
        },

        /**
         * 检查字符串是否小于给定长度范围(中文字符以2个字节计算)<br>
         *
         * @param  str 字符串
         * @param  lessLen 小于或等于长度
         *
         * @return {Boolean} <b>小于给定长度</b>数字返回false;
         */
        isLess: function (str, lessLen) {
            return this.isRange(str, lessLen, -1);
        },

        /**
         * 检查字符串是否大于给定长度范围(中文字符以2个字节计算)<br>
         *
         * @param  str 字符串
         * @param  moreLen 小于或等于长度
         *
         * @return {Boolean} <b>大于给定长度</b>数字返回false;
         */
        isMore: function (str, moreLen) {
            return this.isRange(str, -1, moreLen);
        },

        //验证是否为md5码
        isMd5: function (str) {
            var patt = new RegExp("[0-9a-zA-Z]{32}");
            return patt.test(str);
        },

        isName: function (str) {
            var patt = new RegExp("^[^\\\\/:*?\"<>|]+$");
            return patt.test(str);
        },


        //验证字符是否只由字母、数字、破折号、下划线组成
        isDash: function (str) {
            var patt = new RegExp("^[\\w]+$");
            return patt.test(str);
        },

        //验证字符串是否是路径
        isPath: function (str) {
            var patt = new RegExp("^/|(/[^\\\\:*?\"<>|]+)+$");
            return patt.test(str);
        },

        //验证字符串是否是Uuid
        isUuid: function (str) {
            var patt = new RegExp("[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}");
            return patt.test(str);
        },

        //验证字符串是否是密码（由字母与数字组成，长度6-16）
        isPassword: function (str) {
            var patt = new RegExp("^[a-zA-Z0-9]{6,16}$");
            return patt.test(str);
        },

        //验证是否为空
        isNull: function (obj) {
            return obj === null;
        },

        addResult: function (resultInfo) {
            hasError = true;
            errorInfo.push(resultInfo);
        },

        valid: function (params) {
            for (var param in params) {
                switch (param.rule) {
                    case "string":
                        if (this.isBlank(param.value))
                            this.addResult(param.name + " Must be a non empty string");
                        break;
                    case "num":
                        if (!this.isNum(param.value))
                            this.addResult(param.name + " value:" + param.value + " Must be numeric");
                        break;
                    case "password":
                        if (!this.isPassword(param.value))
                            this.addResult(param.name + " value:" + param.value + " Must be composed of numbers and letters for 6-16 bits");
                        break;
                    case "uuid":
                        if (!this.isUuid(param.value))
                            this.addResult(param.name + " value:" + param.value + " Must be UUID");
                        break;
                    case "path":
                        if (!this.isPath(param.value))
                            this.addResult(param.name + " Must be path format");
                        break;
                    case "null":
                        if (this.isNull(param.value))
                            this.addResult(param.name + " As required");
                        break;
                }
            }
            if (hasError) {
                throw new Error("params error:" + errorInfo);
            }
        }
    };
}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/common/uploader',['../common/httpclient', '../common/content', '../common/utils'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('../common/httpclient'),
            require('../common/content'),
            require('../common/utils')
        );
    } else {
        root.CSUploader = factory(root.CSHttpClient, root.Content, root.CSUtils);
    }
}(this, function (CSHttpClient, Content, CSUtils) {

    //选择鉴权方式 token/session
    var selectAuthMode = function (uploadData, session, token, callback) {
        if (token) {
            var path;
            var dentryId;
            if (uploadData.path && uploadData.name) {
                path = uploadData.path + "/" + uploadData.name;
            } else {
                dentryId = uploadData.dentryId;
            }
            token.getToken(Content.TOKENTYPE.UPLOAD_NORMAL, path, dentryId, null, function (tokenInfo) {
                if (tokenInfo.token) {
                    var url = Content.HOST + Content.VERSION + "/upload?token=" + tokenInfo.token + "&policy=" + tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                    callback(url);
                } else {
                    callback(tokenInfo);
                }
            });
        } else {
            session.getSession(function (sessionValue) {
                var url = Content.HOST + Content.VERSION + "/upload?serviceName=" + uploadData.serviceName + "&session=" + sessionValue;
                callback(url);
            });
        }
    };

    //获取分块状态
    var uploadStatus = function (parentId, path, name, chunks, session, token, onNotifySuccess, onNotifyFail) {

        var param = "name=" + name + "&chunks=" + chunks;
        param += path ? "&path=" + encodeURIComponent(path) : "&parentId=" + parentId;

        if (token) {
            var uri = Content.VERSION + "/upload/actions/status?" + param;
            token.getToken(Content.TOKENTYPE.STATUS, path, parentId, param, function (tokenInfo) {
                if (tokenInfo.token) {
                    var url = Content.HOST + uri + "&token=" + tokenInfo.token + "&policy=" + tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                    CSHttpClient.doGetRequest(url, onNotifySuccess, onNotifyFail);
                } else {
                    onNotifyFail(tokenInfo);
                }
            });
        } else {
            session.getSession(function (session) {
                var url = Content.HOST + Content.VERSION + "/upload/actions/status?" + param + "&session=" + session;
                CSHttpClient.doGetRequest(url, onNotifySuccess, onNotifyFail);
            });
        }
    };

    //继续上传分块（支持断点续传）
    var uploadChunks = function (uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail) {

        var chunkSize = Content.getChunkSize() * 1024 * 1024;   //5M

        var chunk = uploadData.chunk;
        var chunks = uploadData.chunks;

        uploadData.size = file.size;

        //回调文件正在开始上传
        var progress = {
            file_hash: file.hash,
            loaded: chunk * chunkSize,
            total: file.size
        };
        onNotifyProgress(progress);

        //上传第N个分块
        var uploadNchunk = function (chunk) {
            var start = chunk * chunkSize;
            var end = chunk < chunks - 1 ? start + chunkSize : file.size;
            //设置缓存key的格式
            var cacheKey;
            if (uploadData.path && uploadData.name) {
                cacheKey = uploadData.path + "_" + uploadData.name + "_" + file.hash + "_" + chunks;
            } else {
                cacheKey = uploadData.dentryId + "_" + file.hash + "_" + chunks;
            }

            //分块上传第N块文件
            (function (chunk, start, end) {
                uploadData.chunk = chunk;
                uploadData.pos = chunk * chunkSize;
                var formData = CSUtils.objToFormdata(uploadData);
                formData.append("file", file.source.slice(start, end));

                //上传分块成功
                var uploadChunkSuccess = function (data) {
                    if (chunk < chunks - 1) {
                        //上传分块成功 更新缓存
                        Content.setStorage(cacheKey, String(chunk));
                        uploadNchunk(++chunk);
                    } else {
                        //上传文件成功 删除缓存
                        Content.setStorage(cacheKey, "");
                        onNotifySuccess(data);
                    }
                };

                //上传分块失败
                var uploadChunkFailed = function (data) {
                    //上传分块失败 记录当前成功上传的分块位置
                    if (chunk >= 1) {
                        Content.setStorage(cacheKey, chunk - 1);
                    }
                    onNotifyFail(data);
                };

                //获取进度
                var uploadProgress = function (progress) {
                    var realProgress = CSUtils.deepCopy(progress);
                    //进度事件
                    realProgress.loaded = chunk * chunkSize + realProgress.loaded;
                    realProgress.total = file.size;
                    onNotifyProgress(realProgress);
                };

                selectAuthMode(uploadData, session, token, function (url) {
                    //获取token或session失败
                    if (typeof url === "object") {
                        onNotifyFail(url);
                    } else {
                        CSHttpClient.doUploadRequest(url, "POST", {}, formData, uploadProgress, uploadChunkSuccess, uploadChunkFailed);
                    }
                });
            })(chunk, start, end);
        };
        uploadNchunk(chunk);
    };

    return {
        upload: function (file, uploadData, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            if (!file) {
                throw new Error("Please select file！");
            }
            //如果是通过pluploader选择的文件 会经过一层封装 file.getNative()获取文件实际内容
            /** @namespace file.getNative */
            if (typeof file.getNative === "function") {
                file.source = file.getNative();
            } else {
                file.source = file;
            }

            //用于上传文件夹时指定当前文件的父目录
            uploadData.path = file.path || uploadData.path;
            //一次性上传
            var chunkSize = Content.getChunkSize() * 1024 * 1024;
            if (file.size <= chunkSize) {
                var progress = {
                    file_hash: file.hash,
                    loaded: 0,
                    total: file.size
                };
                onNotifyProgress(progress);

                var formData = CSUtils.objToFormdata(uploadData);
                formData.append("file", file.source);
                selectAuthMode(uploadData, session, token, function (url) {
                    CSHttpClient.doUploadRequest(url, "POST", {}, formData, onNotifyProgress, onNotifySuccess, onNotifyFail);
                });
            } else {
                var chunks = Math.ceil(file.size / chunkSize);
                uploadData.chunks = chunks;

                //从cookie中读取
                var cacheKey;
                if (uploadData.path && uploadData.name) {
                    cacheKey = uploadData.path + "_" + uploadData.name + "_" + file.hash + "_" + chunks;
                } else {
                    cacheKey = uploadData.dentryId + "_" + file.hash + "_" + chunks;
                }
                var chunkCache = Content.getStorage(cacheKey);
                //断点续传
                if (!chunkCache) {
                    //覆盖上传没有parentId和path
                    /** @namespace uploadData.parentId */
                    if (uploadData.parentId || uploadData.path) {
                        uploadStatus(uploadData.parentId, uploadData.path, uploadData.name, chunks, session, token, function (data) {
                            uploadData.chunk = Object.getOwnPropertyNames(data).length - 1;
                            uploadChunks(uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail);
                        }, function () {
                            uploadData.chunk = 0;
                            uploadChunks(uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail);
                        });
                    } else {
                        uploadData.chunk = 0;
                        uploadChunks(uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail);
                    }
                } else {
                    uploadData.chunk = chunkCache;
                    uploadChunks(uploadData, file, session, token, onNotifyProgress, onNotifySuccess, onNotifyFail);
                }
            }
        }
    };
}));

/**
 * ceph s3 sdk
 * Created by Administrator on 2016/2/4.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/third-platform-sdk/ceph-s3-sdk', [
            '../common/content',
            '../common/httpclient'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('../common/content'),
            require('../common/httpclient')
        );
    } else {
        root.CephS3 = factory(root.Content, root.CSHttpClient);
    }
}(this, function (Content, CSHttpClient) {
    return {
        putObject: function (file, uploadData, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            /** @namespace uploadData.upload_url */
            var url = uploadData.upload_url;
            var headers = {};

            var contentType = file.type;
            if (!contentType) {
                contentType = "application/octet-stream";
            }
            headers.contentType = contentType;
            headers.Authorization = uploadData.upload_token;
            if (uploadData.nds_cb_url) {
                headers["nds-cb-url"] = uploadData.nds_cb_url;
            }
            headers["x-amz-date"] = uploadData.upload_date;
            CSHttpClient.doUploadRequest(url, "PUT", headers, file, onNotifyProgress, onNotifySuccess, onNotifyFail);
        },

        getTokenParams: function (type) {
            /*type：文件上传类型
             0 - 一次性上传
             1 - 初始化分块上传
             2 - 分块上传第N块文件
             3 - 完成分块上传*/
            type = parseInt(type);
            var map = {};
            map.xAmzDate = "1";
            switch (type) {
                case 2:
                    map.uploadId = 1;
                    map.objectName = 1;
                    map.chunkNum = 1;
                    break;
                case 3:
                    map.uploadId = 1;
                    map.objectName = 1;
                    break;
                default:
                    break;
            }
            return map;
        },

        initiateMultipartUpload: function (uploadData, onNotifySuccess) {
            var url = uploadData.upload_url;
            var headers = {};
            /** @namespace uploadData.upload_token */
            headers.Authorization = uploadData.upload_token;
            /** @namespace uploadData.upload_date */
            headers["x-amz-date"] = uploadData.upload_date;
            headers.contentType = uploadData.contentType;
            headers.dataType = "xml";
            var body = {};
            CSHttpClient.doPostRequest(url, body, headers, function (data) {
                onNotifySuccess(data.documentElement.childNodes);
            }, function (data) {
                throw new Error("initiateMultipartUpload failed! " + JSON.stringify(data));
            });
        },

        multipartUploadPartByStream: function (uploadData, uploadId, file, onNotifyProgress, onNotifySuccess) {
            /** @namespace uploadData.upload_url */
            var url = uploadData.upload_url;
            var headers = {};
            headers.Authorization = uploadData.upload_token;
            headers["x-amz-date"] = uploadData.upload_date;
            headers.contentType = Content.JSONTYPE;
            CSHttpClient.doUploadRequest(url, "PUT", headers, file, onNotifyProgress, function (data) {
                onNotifySuccess(data.etag);
            }, function (data) {
                onNotifySuccess(data.etag);
            });
        },

        completeMultipartUpload: function (uploadData, uploadId, etags, onNotifySuccess) {
            var url = uploadData.upload_url;
            var headers = {};
            headers.Authorization = uploadData.upload_token;
            headers["x-amz-date"] = uploadData.upload_date;
            if (uploadData.nds_cb_url) {
                headers["nds-cb-url"] = uploadData.nds_cb_url;
            }
            headers.contentType = Content.JSONTYPE;
            headers.dataType = "xml";
            var body = "<?xml version=\"1.0\"?><CompleteMultipartUpload>";
            for (var i = 1; i <= etags.length; i++) {
                body += "<Part><PartNumber>" + i + "</PartNumber><ETag>" + etags[i - 1] + "</ETag></Part>";
            }
            body += "</CompleteMultipartUpload>";
            CSHttpClient.doPostRequest(url, body, headers, onNotifySuccess, function (data) {
                onNotifySuccess(data);
            }, function (data) {
                throw new Error("completeMultipartUpload failed ! " + JSON.stringify(data));
            });
        }
    };
}));


/**
 * ceph s3 sdk adapter
 * Created by Administrator on 2016/4/6.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('./cssdk/third-platform-adapter/ceph-s3-adapter', [
            "../third-platform-sdk/ceph-s3-sdk",
            "../common/httpclient",
            "../common/content",
            "../common/utils"], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('../third-platform-sdk/ceph-s3-sdk'),
            require('../common/httpclient'),
            require('../common/content'),
            require('../common/utils')
        );
    } else {
        root.CephS3Adapter = factory(root.CephS3, root.CSHttpClient, root.Content, root.CSUtils);
    }
}(this, function (CephS3, CSHttpClient, Content, CSUtils) {

    var cacheKey = function (file, uploadData) {
        var key;
        if (uploadData.path && uploadData.name) {
            key = uploadData.path + "_" + uploadData.name + "_" + file.hash;
        } else {
            key = uploadData.dentryId + "_" + file.hash;
        }
        return key;
    };

    //更新目录项状态
    var valid = function (dentryId, path, token, session, onNotifySuccess, onNotifyFail) {
        if (CSUtils.isBlank(dentryId) && CSUtils.isBlank(path)) {
            throw new Error("dentryId or path must select one");
        }

        var params = "";
        if (dentryId) {
            params += "dentryId=" + dentryId;
        } else {
            params += "path=" + path;
        }
        if (token) {
            token.getToken(Content.TOKENTYPE.VALID, path, dentryId, params, function (tokenInfo) {
                if (tokenInfo.token) {
                    params = encodeURIComponent(params).replace(/%2F/g, "/").replace(/%3D/g, "=");
                    var url = Content.HOST + Content.VERSION + "/dentries/actions/valid?" + params + "&token=" + tokenInfo.token + "&policy=" + tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                    CSHttpClient.doPutRequest(url, JSON.stringify({}), onNotifySuccess, onNotifyFail);
                } else {
                    onNotifyFail(tokenInfo);
                }
            });
        } else {
            session.getSession(function (session) {
                params = encodeURIComponent(params).replace(/%2F/g, "/").replace(/%3D/g, "=");
                var url = Content.HOST + Content.VERSION + "/dentries/actions/valid?" + params + "&session=" + session;
                CSHttpClient.doPutRequest(url, JSON.stringify({}), onNotifySuccess, onNotifyFail);
            });
        }
    };

    //获取上传token
    var getUploadToken = function (file, dentry, tokenParams, token, session,onNotifyProgress,onNotifySuccess, onNotifyFail) {

        //进度回调方法兼容处理
        if(!onNotifyFail){
            onNotifyFail = onNotifySuccess;
            onNotifySuccess = onNotifyProgress;
            onNotifyProgress = null;
        }

        var doRequest = function (file, tokenParams, dentry, url) {
            dentry.tokenParams = JSON.stringify(tokenParams);
            if (file && file.path) {
                dentry.path = file.path;
            }

            var formData = CSUtils.objToFormdata(dentry);
            CSHttpClient.doUploadRequest(url, "POST", {}, formData, null, function (response) {
                dentry = {};
                /** @namespace response.upload_params */
                //秒传成功
                if (response.type === 2 && response.valid !== -1) {
                    delete response.upload_params;
                    onNotifySuccess(response);
                } else {
                    var uploadParams = response.upload_params;
                    uploadParams.path = response.path;
                    onNotifySuccess(uploadParams);
                }
            }, function (data) {
                onNotifyFail("Get uploadParameter falied!" + JSON.stringify(data));
            });
        };

        //没传file说明是上传第N分块，不需要设置md5 size 和contentType
        var requestPreparation = function (file, tokenParams, dentry, url) {
            if (file) {
                tokenParams.contentType = file.type;
                if (!tokenParams.contentType) {
                    tokenParams.contentType = "application/octet-stream";
                }
                CSUtils.calMd5(file.source,onNotifyProgress,function (md5) {
                    dentry.md5 = md5;
                    dentry.size = file.size || 0;
                    doRequest(file, tokenParams, dentry, url);
                },onNotifyFail);
            } else {
                //设置默认default
                tokenParams.contentType = Content.JSONTYPE;
                doRequest(file, tokenParams, dentry, url);
            }
        };
        if (token) {
            var path;
            var dentryId;
            if (dentry.path && dentry.name) {
                path = dentry.path + "/" + dentry.name;
            } else {
                dentryId = dentry.dentryId;
            }
            token.getToken(Content.TOKENTYPE.UPLOAD_DIRECT, path, dentryId, null, function (tokenInfo) {
                if (tokenInfo.token) {
                    var url = Content.HOST + Content.VERSION + "/upload/actions/direct?token=" + tokenInfo.token + "&policy=" +
                        tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                    requestPreparation(file, tokenParams, dentry, url);
                } else {
                    onNotifyFail(tokenInfo);
                }
            });
        } else {
            session.getSession(function (session) {
                var url = Content.HOST + Content.VERSION + "/upload/actions/direct?serviceName=" + dentry.serviceName + "&session=" + session;
                requestPreparation(file, tokenParams, dentry, url);
            });
        }
    };

    //解析xml
    var parseXmlNode = function (responseText, node) {

        for(var i = 0;i< responseText.length;i++){
            if(responseText[i].nodeName === node){
                return responseText[i].textContent;
            }
        }
        return "";
        //return responseText.slice(responseText.indexOf("<" + node + ">"), responseText.indexOf("</" + node + ">")).replace("<" + node + ">", "");
    };

    //初始化分块上传
    var initiateMultipartUpload = function (file, dentry, token, session,onNotifyProgress, onNotifySuccess, onNotifyFail) {
        var tokenParams = CephS3.getTokenParams(1);
        (function (file, dentry, tokenParams) {
            dentry.chunkType = 1;
            getUploadToken(file, dentry, tokenParams, token, session, onNotifyProgress, function (uploadParams) {
                /** @namespace uploadParams.dentry_id */
                if (uploadParams.dentry_id) {
                    onNotifySuccess(uploadParams);
                } else {
                    uploadParams.contentType = tokenParams.contentType;
                    CephS3.initiateMultipartUpload(uploadParams, function (responseText) {
                        var data = {};
                        data.UploadId = parseXmlNode(responseText, "UploadId");
                        data.objectName = parseXmlNode(responseText, "Key");
                        data.path = uploadParams.path;
                        onNotifySuccess(data);
                    }, onNotifyFail);
                }
            }, onNotifyFail);
        })(file, dentry, tokenParams);
    };

    //分块上传文件
    var multipartUpload = function (uploadId, objectName, file, dentry, etags, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail) {
        if (!etags) {
            etags = [];
        }
        var chunkSize = Content.getChunkSize() * 1024 * 1024;   //5M
        var chunks = Math.ceil(file.size / chunkSize);
        //计算需要上传的分块
        var chunkNumArr = [];

        if (etags && etags.length > 0) {
            if (etags.length === chunks) {
                onNotifySuccess(etags);
                return;
            }
            for (var i = 0; i < chunks; i++) {
                if (!etags[i]) {
                    chunkNumArr.push(i + 1);
                }
            }
        } else {
            for (var m = 1; m <= chunks; m++) {
                chunkNumArr.push(m);
            }
        }

        //文件大于5M 加上计算md5花费的进度
        var md5Cost = 0;
        var rate = 1;
        if(file.size > Content.CALMD5CHUNK * 1024 *1024){
            md5Cost = file.size * 0.1;
            rate = 0.9;
        }

        //回调文件正在开始上传
        var progress = {
            file_hash: file.hash,
            loaded: etags.length * chunkSize * rate + md5Cost,
            total: file.size
        };

        onNotifyProgress(progress);

        var cache = {};
        cache.UploadId = uploadId;
        cache.objectName = objectName;
        cache.etags = etags;
        cache.fullPath = dentry.fullPath;

        var n = 0;
        var uploadNChunk = function (n) {
            var chunkNum = chunkNumArr[n];
            var start = (chunkNum - 1) * chunkSize;
            var end = file.size;
            if (chunkNum !== chunks) {
                end = start + chunkSize;
            }
            //分块上传第N块文件
            (function (chunkNum, start, end) {
                var tokenParams = CephS3.getTokenParams(2);
                tokenParams.uploadId = uploadId;
                tokenParams.objectName = objectName;
                tokenParams.chunkNum = chunkNum;
                dentry.chunkType = 2;
                getUploadToken(null, dentry, tokenParams, token, session, function (uploadParams) {
                    var chunkContent = file.source.slice(start, end);
                    CephS3.multipartUploadPartByStream(uploadParams, uploadId, chunkContent, function (curProgress) {
                        progress = {
                            file_hash: file.hash,
                            loaded: (etags.length * chunkSize + curProgress.loaded) * rate  + md5Cost,
                            total: file.size
                        };
                        onNotifyProgress(progress);
                    }, function (etag) {
                        if (etag) {
                            etag = etag.substring(1, (etag.length - 1));
                            etags[chunkNum - 1] = etag;
                            Content.setStorage(cacheKey(file, dentry), JSON.stringify(cache));
                        } else {
                            onNotifyFail("upload part falid ! uploadId=" + uploadId + " partNumber=" + n);
                            return;
                        }
                        if (etags.length < chunks) {
                            uploadNChunk(++n);
                        } else {
                            onNotifySuccess(etags);
                        }
                    });
                }, onNotifyFail);
            })(chunkNum, start, end);
        };
        uploadNChunk(n);
    };

    //完成分块上传
    var completeMultipartUpload = function (uploadId, objectName, dentry, etags, token, session, onNotifySuccess, onNotifyFail) {
        var tokenParams = CephS3.getTokenParams(3);
        dentry.chunkType = 3;
        tokenParams.uploadId = uploadId;
        tokenParams.objectName = objectName;
        getUploadToken(null, dentry, tokenParams, token, session, function (uploadParams) {
            CephS3.completeMultipartUpload(uploadParams, uploadId, etags, onNotifySuccess);
        }, onNotifyFail);
    };

    ////更新目录项有效状态
    var updateValid = function (path, token, session, onNotifySuccess, onNotifyFail, file, onNotifyProgress) {
        valid(null, path, token, session, function (res) {
            onNotifySuccess(res);
            var progress = {
                loaded: file.size,
                total: file.size
            };
            onNotifyProgress(progress);
        }, function (res) {
            onNotifyFail("update dentry valid failed!" + JSON.stringify(res));
        });
    };

    var uploadFileByPart = function (file, dentry, cache, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail) {
        var retryTimes = Content.RETRYTIMES;
        var uploadPartStart = function (data) {
            var uploadId = data.UploadId;
            var objectName = data.objectName;
            var path = data.fullPath;

            //用于修改valid
            dentry.fullPath = path;
            multipartUpload(uploadId, objectName, file, dentry, data.etags, token, session, onNotifyProgress, function (etags) {
                for (var i = 0; i < etags.length; i++) {
                    if (!etags[i]) {
                        //失败重试 并且断点续传
                        if (retryTimes-- >= 0) {
                            uploadFileByPart(file, dentry, cache);
                        } else {
                            onNotifyFail("multipartUpload file failed!");
                        }
                    }
                }
                //完成分块上传
                completeMultipartUpload(uploadId, objectName, dentry, etags, token, session, function () {
                    //移除分块记录缓存
                    Content.setStorage(cacheKey(file, dentry), "");
                    //更新目录项有效状态
                    updateValid(path, token, session, onNotifySuccess, onNotifyFail, file, onNotifyProgress);
                }, onNotifyFail);
            }, onNotifyFail);
        };
        //断点续传
        if (cache) {
            var cacheData = JSON.parse(cache);
            uploadPartStart(cacheData);
        } else {
            //分块上传初始化
            initiateMultipartUpload(file, dentry, token, session,onNotifyProgress,function (uploadParams) {
                if (uploadParams.dentry_id) {
                    onNotifySuccess(uploadParams);
                    var progress = {
                        loaded: file.size,
                        total: file.size
                    };
                    onNotifyProgress(progress);
                } else {
                    uploadParams.fullPath = uploadParams.path;
                    uploadPartStart(uploadParams);
                }
            }, onNotifyFail);
        }
    };

    return {
        upload: function (file, dentry, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail) {
            if (!file) {
                throw new Error("Please select files！");
            }
            if (typeof file.getNative === "function") {
                file.source = file.getNative();
            } else {
                file.source = file;
            }
            //一次性上传
            if (file.size <= Content.getChunkSize() * 1024 * 1024) {
                var progress = {
                    file_hash: file.hash,
                    loaded: 0,
                    total: file.size
                };
                onNotifyProgress(progress);

                var tokenParams = CephS3.getTokenParams(0);
                getUploadToken(file, dentry, tokenParams, token, session, function (uploadParams) {
                    if (uploadParams.type === 2 && uploadParams.valid !== -1) {
                        //秒传成功
                        delete uploadParams.upload_params;
                        var progress = {
                            loaded: file.size,
                            total: file.size
                        };
                        onNotifyProgress(progress);
                        onNotifyProgress(progress);
                        onNotifySuccess(uploadParams);
                    } else {
                        CephS3.putObject(file.source, uploadParams, function (progress) {
                            //避免直接到100%
                            progress.loaded -= 1;
                            onNotifyProgress(progress);
                        }, function () {
                            updateValid(uploadParams.path, token, session, onNotifySuccess, onNotifyFail, file, onNotifyProgress);
                        }, onNotifyFail);
                    }
                }, onNotifyFail);
            } else {
                //根据文件名、文件大小、文件最后更新时间计算hash值
                var cache = Content.getStorage(cacheKey(file, dentry));
                uploadFileByPart(file, dentry, cache, token, session, onNotifyProgress, onNotifySuccess, onNotifyFail);
            }
        }
    };
}));

/**
 * 文件上传下载
 */
(function (root, factory) {

    var a = '../common/httpclient';
    var b = '../third-platform-adapter/ceph-s3-adapter';
    var c = '../common/utils';
    var d = '../common/content';
    var e = '../common/uploader';
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('./cssdk/api/cs-object', [a, b, c, d, e], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory(
            require(a), require(b), require(c), require(d), require(e)
        );
    } else {
        // 浏览器全局变量
        root.CSClient = factory(root.CSHttpClient, root.CephS3Adapter, root.CSUtils, root.Content, root.CSUploader);
    }
}(this, function (CSHttpClient, CephS3Adapter, CSUtils, Content, CSUploader) {
//标示当前是否有文件在上传
    var status = {
        WAITING: "waiting",
        UPLOADING: "uploading"
    };
    //上传任务列表
    var uploadTasks = [];
    var uploadStatus = status.WAITING;

    //添加上传任务时触发
    var taskAdded = function (newTask) {
        uploadTasks.push(newTask);
        /**
         * 任务完成后处理流程
         */
        var taskComplete = function () {
            //删除已完成任务
            uploadTasks.splice(0, 1);

            //判断任务是否已经全部完成
            if (uploadTasks.length > 0) {
                taskHandle(uploadTasks[0]);
            } else {
                uploadStatus = status.WAITING;
            }
        };

        var taskHandle = function (task) {
            (function (task) {
                var file = task.file;
                var uploadData = task.uploadData;
                var listenner = task.listenner;
                var token = task.token;
                var session = task.session;

                //标识正在上传的文件
                Content.uploadingFile = file;
                uploadStatus = "uploading";

                uploadFile(file, uploadData, listenner.onNotifyProgress, function (dentry) {
                    listenner.onNotifySuccess(dentry);
                    taskComplete();
                }, function (error) {
                    //用户主动终止，不回调失败信息
                    if (Content.getUploadStatus() !== "stop" || Content.getCancelCallback()) {
                        listenner.onNotifyFail(error);
                    }
                    Content.setUploadStatus("");
                    taskComplete(error);
                }, token, session);
            })(task);
        };
        //如果此时没有任务在处理 开始上传文件
        if (uploadStatus === status.WAITING) {
            taskHandle(uploadTasks[0]);
        }
    };

    //选择上传适配器
    var chooseAdapter = function (platform) {
        var adapter;
        switch (platform) {
            case "s3":
                adapter = CephS3Adapter;
                break;
            case "aws":
                break;
            case "aliyun":
                break;
            case "cs":
                adapter = CSUploader;
                break;
            default :
                throw new Error("platform invalid");
        }
        return adapter;
    };

    //获取服务信息
    var getServiceInfo = function (serviceName, onNotifySuccess) {
        if (!serviceName) {
            onNotifySuccess({});
            return;
        }
        var serviceCache = Content.getStorage(Content.ENV + "_" + serviceName, "session");
        if (!serviceCache) {
            var url = Content.HOST + Content.VERSION + "/services/serviceName/" + serviceName;
            CSHttpClient.doGetRequest(url, function (service) {
                //缓存服务信息
                var serviceCache = {};
                serviceCache.platform = service.platform;
                var expires = 86400;
                if (service.strategies) {
                    /** @namespace service.strategies.direct */
                    var directStrategy = service.strategies.direct;
                    if (directStrategy) {
                        //只缓存旁路策略
                        serviceCache.strategies = {};
                        serviceCache.strategies.direct = directStrategy;
                        /** @namespace directStrategy.expires */
                        expires = directStrategy.expires;
                    }
                }
                Content.setStorage(Content.ENV + "_" + serviceName, JSON.stringify(serviceCache), "session");
                onNotifySuccess(service);
            }, function () {
                onNotifySuccess({});
            });
        } else {
            onNotifySuccess(JSON.parse(serviceCache));
        }
    };


    var uploadFile = function (file, uploadData, onNotifyProgress, onNotifySuccess, onNotifyFail, token, session) {
        if (!file) {
            throw new Error("please select file!");
        }
        if (!session && !token) {
            throw new Error("token or session must select one");
        }
        //通过服务配置判断是否走普通上传还是旁路上传
        getServiceInfo(uploadData.serviceName, function (service) {
            var platform = "cs";
            if (service.strategies) {
                var direct = service.strategies.direct;
                /** @namespace direct.uploadDirect */
                if (direct && direct.uploadDirect && direct.uploadDirect.toString() === "1") {
                    platform = service.platform;
                }
            }
            //选择上传适配器
            var uploadAdapter = chooseAdapter(platform);
            uploadAdapter.upload(file, uploadData, token, session, function (progress) {
                progress.file_hash = file.hash;
                onNotifyProgress(progress);
            }, onNotifySuccess, onNotifyFail);
        });
    };

    return {

        /**
         * 尝试秒传
         * @param serviceName        服务名
         * @param md5                文件特征码
         * @param remoteDstPath      文件在服务器端的存放路径
         * @param scope              公开/私密
         * @param token              token鉴权模块
         * @param session            session鉴权模块
         * @param onNotifySuccess    成功回调
         * @param onNotifyFail       失败回调
         */
        tryQuickUploadByMd5: function (serviceName, md5, remoteDstPath, scope, token, session, onNotifySuccess, onNotifyFail) {
            if (!serviceName) {
                throw new Error("require serviceName");
            }

            if (!CSUtils.isPath(remoteDstPath)) {
                throw new Error("remoteDstPath is invalid");
            }
            var params = {};
            params.md5 = md5;
            var index = remoteDstPath.lastIndexOf("/");
            params.path = remoteDstPath.substring(0, index);
            params.name = remoteDstPath.substring(index + 1, remoteDstPath.length);
            params.scope = scope;

            if (token) {
                token.getToken(Content.TOKENTYPE.QUICK, remoteDstPath, null, null, function (tokenInfo) {
                    if (tokenInfo.token) {
                        var url = Content.HOST + Content.VERSION + "/dentries/actions/quick?token=" + tokenInfo.token + "&policy=" +
                            tokenInfo.policy + "&date=" + encodeURIComponent(tokenInfo.date_time);
                        CSHttpClient.doPostRequest(url, JSON.stringify(params), onNotifySuccess, onNotifyFail);
                    } else {
                        onNotifyFail(tokenInfo);
                    }
                });
            } else {
                session.getSession(function (session) {
                    var url = Content.HOST + Content.VERSION + "/dentries/actions/quick?serviceName=" + serviceName + "&session=" + session;
                    CSHttpClient.doPostRequest(url, JSON.stringify(params), onNotifySuccess, onNotifyFail);
                });
            }
        },


        /**
         * 文件上传
         * @param serviceName       服务名
         * @param file              文件内容
         * @param remotePath        服务器远端路径
         * @param scope             公开/私密
         * @param listenner         上传监听
         * @param token             token鉴权模块
         * @param session           session鉴权模块
         */
        upload: function (serviceName, file, remotePath, scope, listenner, token, session) {
            if (!serviceName) {
                throw new Error("require serviceName");
            }

            if (!remotePath) {
                throw new Error("require remotePath");
            }
            if (!CSUtils.isPath(remotePath)) {
                throw new Error(" remotePath is invalid");
            }

            //检查listenner模块是否正确
            if (typeof listenner === "object") {
                if (typeof listenner.onNotifySuccess !== "function") {
                    throw new Error("require success callback");
                }
                if (typeof listenner.onNotifyFail !== "function") {
                    throw new Error("require failure callback");
                }
                if (typeof listenner.onNotifyProgress !== "function") {
                    throw new Error("require progress callback");
                }
            } else {
                throw new Error("require listenner");
            }

            var uploadData = {};
            var index = remotePath.lastIndexOf("/");
            uploadData.path = remotePath.substring(0, index);
            uploadData.name = remotePath.substring(index + 1, remotePath.length);
            uploadData.scope = scope;
            uploadData.serviceName = serviceName;

            if (!CSUtils.isName(uploadData.name)) {
                throw new Error("name is invalid!");
            }

            //文件特征码 在进度展示和取消上传时起作用
            if(!file.hash){
                file.hash = CSUtils.hashCode(file);
            }

            var taskInfo = {
                file: file,
                uploadData: uploadData,
                listenner: listenner,
                token: token,
                session: session
            };
            //添加上传任务
            taskAdded(taskInfo);
        },


        /**
         * 文件覆盖上传
         * @param serviceName       服务名
         * @param file              文件内容
         * @param dentryId          被覆盖的文件id
         * @param scope             公开/私密
         * @param listenner         上传监听
         * @param token             token鉴权模块
         * @param session           session鉴权模块
         */
        uploadCover: function (serviceName, file, dentryId, scope, listenner, token, session) {
            if (!serviceName) {
                throw new Error("require serviceName");
            }

            if (!dentryId) {
                throw new Error("require dentryId");
            }
            if (!CSUtils.isUuid(dentryId)) {
                throw new Error(" dentryId is invalid");
            }

            //检查listenner模块是否正确
            if (typeof listenner === "object") {
                if (typeof listenner.onNotifySuccess !== "function") {
                    throw new Error("require success callback");
                }
                if (typeof listenner.onNotifyFail !== "function") {
                    throw new Error("require failure callback");
                }
                if (typeof listenner.onNotifyProgress !== "function") {
                    throw new Error("require progress callback");
                }
            } else {
                throw new Error("require listenner");
            }
            var uploadData = {};

            uploadData.dentryId = dentryId;
            uploadData.scope = scope;
            uploadData.serviceName = serviceName;

            file.hash = CSUtils.hashCode(file);
            var taskInfo = {
                file: file,
                uploadData: uploadData,
                listenner: listenner,
                token: token,
                session: session
            };
            taskAdded(taskInfo);
        },


        /**
         * 通过路径下载
         * @param serviceName      服务名
         * @param remotePath       服务器远端路径
         * @param size             缩略图尺寸
         * @param attachment       是否需要附件下载
         * @param name             指定附件下载时的名称
         * @param token            token鉴权模块
         * @param session          session鉴权模块
         */

        downloadByPath: function (serviceName, remotePath, size, attachment, name, token, session) {

            //name没传
            if (typeof session === "undefined") {
                session = token;
                token = name;
                name = null;
            }
            //attachment和name都没传
            if (typeof token === "undefined") {
                session = name;
                token = attachment;
                attachment = false;
                name = null;
            }

            if (!serviceName) {
                throw new Error("require serviceName");
            }

            if (!remotePath) {
                throw new Error("require remotePath");
            }
            if (!CSUtils.isPath(remotePath)) {
                throw new Error("remotePath is invalid");
            }
            if (size && Content.THUMB_SIZE.indexOf(parseInt(size)) === -1) {
                throw new Error("size is invalid");
            }
            var params = "serviceName=" + serviceName;
            if (size) {
                params += "&size=" + size;
            }
            var encodeParams = params;
            if (attachment && attachment === "true") {
                params += "&attachment=" + attachment;
                encodeParams = params;
                if (name) {
                    encodeParams += "&name=" + encodeURIComponent(name);
                    params += "&name=" + name;
                }
            }
            if (token) {
                token.getToken(Content.TOKENTYPE.DOWNLOAD_PATH, remotePath, null, params, function (tokenInfo) {
                    if (tokenInfo.token) {
                        var url = Content.HOST + Content.VERSION + "/download/actions/direct?path=" + encodeURIComponent(remotePath) + "&" + encodeParams + "&token=" +
                            tokenInfo.token + "&policy=" + tokenInfo.policy + "&expireAt=" + tokenInfo.expire_at;
                        window.open(Content.urlProcess(url));
                    } else {
                        throw new Error("get token error");
                    }
                });
            } else if (session) {
                session.getSession(function (session) {
                    var url = Content.HOST + Content.VERSION + "/download/actions/direct?path=" + encodeURIComponent(remotePath) + "&" + params + "&session=" + session;
                    window.open(Content.urlProcess(url));
                });
            } else {
                var url = Content.HOST + Content.VERSION + "/download/actions/direct?path=" + encodeURIComponent(remotePath) + "&" + params;
                window.open(Content.urlProcess(url));
            }
        },

        /**
         * 通过dentryId获取下载地址
         * @param serviceName      服务名
         * @param dentryId         下载的文件id
         * @param size             缩略图尺寸
         * @param attachment       是否需要附件下载
         * @param name             指定附件下载时的名称
         * @param token            token鉴权模块
         * @param session          session鉴权模块
         * @param callback         回调下载地址
         */
        getDownloadUrlByDentryId: function (serviceName, dentryId, size, attachment, name, token, session, callback) {

            //name没传
            if (typeof session === "function") {
                callback = session;
                session = token;
                token = name;
                name = null;
            }
            //attachment和name都没传
            if (typeof token === "function") {
                callback = token;
                session = name;
                token = attachment;
                attachment = false;
                name = null;
            }

            var result = {};

            if (!serviceName) {
                result.status = "failed";
                result.error = "require serviceName";
                callback(result);
                return;
            }

            if (!dentryId || !CSUtils.isUuid(dentryId)) {
                result.status = "failed";
                result.error = "dentryId is invalid";
                callback(result);
                return;
            }
            if (size && Content.THUMB_SIZE.indexOf(parseInt(size)) === -1) {
                result.status = "failed";
                result.error = "size is invalid";
                callback(result);
                return;
            }

            var params = "serviceName=" + serviceName;
            if (size) {
                params += "&size=" + size;
            }
            var encodeParams = params;
            if (attachment && attachment === "true") {
                params += "&attachment=" + attachment;
                encodeParams = params;
                if (name) {
                    encodeParams += "&name=" + encodeURIComponent(name);
                    params += "&name=" + name;
                }
            }
            if (token) {
                token.getToken(Content.TOKENTYPE.DOWNLOAD_ID, null, dentryId, params, function (tokenInfo) {
                    if (tokenInfo.token) {
                        var url = Content.HOST + Content.VERSION + "/download/actions/direct?dentryId=" + dentryId + "&" + encodeParams + "&token=" + tokenInfo.token + "&policy=" + tokenInfo.policy + "&expireAt=" + tokenInfo.expire_at;
                        result.status = "succeed";
                        result.url = Content.urlProcess(url);
                    } else {
                        result.status = "failed";
                        result.error = "get token error";
                    }
                    callback(result);
                });
            } else if (session) {
                session.getSession(function (session) {
                    var url = Content.HOST + Content.VERSION + "/download/actions/direct?dentryId=" + dentryId + "&session=" + session + "&" + params;
                    result.status = "succeed";
                    result.url = Content.urlProcess(url);
                    callback(result);
                });
            } else {
                var url = Content.HOST + Content.VERSION + "/download/actions/direct?dentryId=" + dentryId + "&" + params;
                result.status = "succeed";
                result.url = Content.urlProcess(url);
                callback(result);
            }
        },

        /**
         * 通过id下载
         * @param serviceName      服务名
         * @param dentryId         下载的文件id
         * @param size             缩略图尺寸
         * @param attachment       是否需要附件下载
         * @param name             指定附件下载时的名称
         * @param token            token鉴权模块
         * @param session          session鉴权模块
         */
        downloadById: function (serviceName, dentryId, size, attachment, name, token, session) {
            if (!serviceName) {
                throw new Error("require serviceName");
            }
            this.getDownloadUrlByDentryId(serviceName, dentryId, size, attachment, name, token, session, function (data) {
                window.open(Content.urlProcess(data.url));
            });
        },


        /**
         * 取消上传
         * @param file
         */
        stop: function (file) {
            if (!file) {
                return;
            }
            if (!uploadTasks || uploadTasks.length <= 0) {
                return;
            }
            var hash = file.hash;
            if(!hash){
                hash = CSUtils.hashCode(file);
            }

            //停止正在上传的文件
            if (Content.uploadingFile && hash === Content.uploadingFile.hash) {
                Content.setUploadStatus("stop");
                return;
            }
            //移除还没开始上传的文件
            for (var i = 0; i < uploadTasks.length; i++) {
                if (uploadTasks[i].file.hash == hash) {
                    uploadTasks.splice(i, 1);
                    break;
                }
            }
        }
    };
}));

























