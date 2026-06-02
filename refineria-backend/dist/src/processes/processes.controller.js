"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const processes_service_1 = require("./processes.service");
const create_process_dto_1 = require("./dto/create-process.dto");
const update_process_dto_1 = require("./dto/update-process.dto");
const create_lot_dto_1 = require("./dto/create-lot.dto");
let ProcessesController = class ProcessesController {
    processesService;
    constructor(processesService) {
        this.processesService = processesService;
    }
    create(dto) {
        return this.processesService.create(dto);
    }
    findAll() {
        return this.processesService.findAll();
    }
    findById(id) {
        return this.processesService.findById(id);
    }
    update(id, dto) {
        return this.processesService.update(id, dto);
    }
    addLot(id, dto) {
        return this.processesService.addLot(id, dto);
    }
    remove(id) {
        return this.processesService.remove(id);
    }
};
exports.ProcessesController = ProcessesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_process_dto_1.CreateProcessDto]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_process_dto_1.UpdateProcessDto]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/lots'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_lot_dto_1.CreateLotDto]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "addLot", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcessesController.prototype, "remove", null);
exports.ProcessesController = ProcessesController = __decorate([
    (0, common_1.Controller)('processes'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [processes_service_1.ProcessesService])
], ProcessesController);
//# sourceMappingURL=processes.controller.js.map