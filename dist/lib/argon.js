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
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const argon2_1 = require("argon2");
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, argon2_1.hash)(password);
});
exports.hashPassword = hashPassword;
const comparePassword = (password, hash) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, argon2_1.verify)(hash, password);
});
exports.comparePassword = comparePassword;
