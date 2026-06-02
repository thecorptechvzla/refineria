"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldBarsModule = void 0;
const common_1 = require("@nestjs/common");
const gold_bars_controller_1 = require("./gold-bars.controller");
const gold_bars_service_1 = require("./gold-bars.service");
let GoldBarsModule = class GoldBarsModule {
};
exports.GoldBarsModule = GoldBarsModule;
exports.GoldBarsModule = GoldBarsModule = __decorate([
    (0, common_1.Module)({
        controllers: [gold_bars_controller_1.GoldBarsController],
        providers: [gold_bars_service_1.GoldBarsService],
    })
], GoldBarsModule);
//# sourceMappingURL=gold-bars.module.js.map