"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack || err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json(Object.assign({ status: 'error', message: err.message || 'Internal Server Error' }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
