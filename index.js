//@ts-check
'use strict';

const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({ keepAlive: true, maxTotalSockets: 128 });
const httpsAgent = new https.Agent({ keepAlive: true, maxTotalSockets: 128 });

const HTTP_METHODS = ['GET', 'POST', 'HEAD', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'];


const make_raw_request = (rockiOptions, nodeOptions) => new Promise(resolve => {
    let resolved = false;

    if (rockiOptions.setContentLengthFromBuffer && (rockiOptions.buffer instanceof Buffer)) {
        nodeOptions.headers['content-length'] = rockiOptions.buffer.byteLength;
    } // if

    const req = rockiOptions.requestFunction(nodeOptions);

    req.on('error', (err) => {
        console.log('req on error');
        if (resolved) {
            return;
        }
        resolved = true;

        resolve([err, null, null, null]);
    });
    req.on('abort', (err) => {
        console.log('req.on abort');
        console.log(err);
    });

    req.on('timeout', (err) => {
        console.log('req.on timeout');
        const error = new Error('request timed out');
        error.code = 'ETIMEDOUT';
        req.destroy(error); // emits event 'error'
    });
    req.on('response', (res) => {
        const contentLength = Number(res.headers['content-length']);

        let buf = null;
        let bufferOffset = 0;

        if (contentLength) {
            buf = Buffer.alloc(contentLength);
        } else {
            buf = Buffer.alloc(0);
        }

        res.on('error', (err) => {
            console.log(err);
            if (resolved) {
                return;
            }
            resolved = true;

            resolve([err, null, null, null]);
        });
        res.on('aborted', (err) => {
            console.log('res.on aborted');
            console.log(err);
        });

        res.on('data', (data) => {
            if (contentLength) {
                data.copy(buf, bufferOffset);
                bufferOffset += data.length;
            }
            else {
                buf = Buffer.concat([buf, data]);
            }
        });

        res.on('end', () => {
            if (resolved) {
                return;
            }
            resolved = true;

            resolve([null, res.statusCode, res.headers, buf])
        });

        if (rockiOptions?.responseTimeout) {
            res.setTimeout(rockiOptions.responseTimeout);
        }

    });

    if (rockiOptions?.requestTimeout) {
        req.setTimeout(rockiOptions.requestTimeout);
    }

    if (rockiOptions?.buffer) {
        req.write(rockiOptions.buffer);
        req.end();
    }
    else if (rockiOptions?.stream?.pipe) {
        rockiOptions.stream.pipe(req);
    }
    else if (rockiOptions?.externalWrite) {
        rockiOptions.externalWrite(req, rockiOptions, nodeOptions, resolve);
    }
    else {
        req.end();
    }
});

const defaultRockiHttpOptions = {
    setContentLengthFromBuffer: true,
    requestFunction: http.request
}
const defaultRockiHttpsOptions = {
    setContentLengthFromBuffer: true,
    requestFunction: https.request
}
const defaultNodeHttpOptions = {
    agent: httpAgent
}
const defaultNodeHttpsOptions = {
    agent: httpsAgent
}

/**
 * 
 * @param {Object} nodeOptions 
 * @param {Object} rockiOptions 
 * @returns {{get: Function, post: Function, head: Function,
 * patch: Function, put: Function, delete: Function, options: Function }}
 */
const make_http_request = (nodeOptions = { headers: {} }, rockiOptions = {}) => {
    const baseRockiOptions = { ...defaultRockiHttpOptions, ...rockiOptions };

    const baseHeaderOptions = { ...nodeOptions.headers };
    const baseNodeOptions = { ...defaultNodeHttpOptions, ...nodeOptions };

    const calls = { // ts-check happy
        get() { }, post() { }, head() { }, patch() { }, put() { }, delete() { }, options() { }
    };

    for (const method of HTTP_METHODS) {
        calls[method.toLowerCase()] = (nodeOptionsPerCall = { headers: {} }, rockiOptionsPerCall) => {
            const finalCallHeaderOptions = { ...baseHeaderOptions, ...nodeOptionsPerCall.headers };
            const finalCallNodeOptions = { ...baseNodeOptions, ...nodeOptionsPerCall };
            finalCallNodeOptions.headers = finalCallHeaderOptions;
            finalCallNodeOptions.method = method;

            const finalCallRockiOptions = { ...baseRockiOptions, ...rockiOptionsPerCall };

            return make_raw_request(finalCallRockiOptions, finalCallNodeOptions);
        }
    }

    return calls;
}

/**
 * 
 * @param {Object} nodeOptions 
 * @param {Object} rockiOptions 
 * @returns {{get: Function, post: Function, head: Function,
 * patch: Function, put: Function, delete: Function, options: Function }}
 */
const make_https_request = (nodeOptions = { headers: {} }, rockiOptions = {}) => {
    const baseRockiOptions = { ...defaultRockiHttpsOptions, ...rockiOptions };

    const baseHeaderOptions = { ...nodeOptions.headers };
    const baseNodeOptions = { ...defaultNodeHttpsOptions, ...nodeOptions };

    const calls = { // ts-check happy
        get() { }, post() { }, head() { }, patch() { }, put() { }, delete() { }, options() { }
    };

    for (const method of HTTP_METHODS) {
        calls[method.toLowerCase()] = (nodeOptionsPerCall = { headers: {} }, rockiOptionsPerCall) => {
            const finalCallHeaderOptions = { ...baseHeaderOptions, ...nodeOptionsPerCall.headers };
            const finalCallNodeOptions = { ...baseNodeOptions, ...nodeOptionsPerCall };
            finalCallNodeOptions.headers = finalCallHeaderOptions;
            finalCallNodeOptions.method = method;

            const finalCallRockiOptions = { ...baseRockiOptions, ...rockiOptionsPerCall };

            return make_raw_request(finalCallRockiOptions, finalCallNodeOptions);
        }
    }

    return calls;
}

module.exports.make_http_request = make_http_request;
module.exports.make_https_request = make_https_request;
