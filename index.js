//@ts-check
'use strict';

const http = require('http');
const https = require('https');


const make_http_request = () => {
    return {

    }
}

const make_https_request = () => {
    return {

    }
}

const make_get = async (requestOptions) => {
    const status = 200;
    const headers = {};
    const body = Buffer.alloc(42);

    return [null, status, headers, body];
}

const make_head = async (requestOptions) => {
    const status = 200;
    const headers = {};
    const body = Buffer.alloc(42);

    return [null, status, headers, body];
}


const make_post = async (requestOptions) => {
    const status = 200;
    const headers = {};
    const body = Buffer.alloc(42);

    return [null, status, headers, body];
}

const make_put = async (requestOptions) => {
    const status = 200;
    const headers = {};
    const body = Buffer.alloc(42);

    return [null, status, headers, body];
}


const make_delete = async (requestOptions) => {
    const status = 200;
    const headers = {};
    const body = Buffer.alloc(42);

    return [null, status, headers, body];
}


const make_patch = async (requestOptions) => {
    const status = 200;
    const headers = {};
    const body = Buffer.alloc(42);

    return [null, status, headers, body];
}


module.exports.make_http_request = make_http_request;
module.exports.make_https_request = make_https_request;

module.exports.make_get = make_get;
module.exports.make_head = make_head;
module.exports.make_post = make_post;
module.exports.make_put = make_put;
module.exports.make_delete = make_delete;
module.exports.make_patch = make_patch;
