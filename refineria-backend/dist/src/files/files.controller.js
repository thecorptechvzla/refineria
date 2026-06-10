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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const passport_1 = require("@nestjs/passport");
const files_service_1 = require("./files.service");
const processes_service_1 = require("../processes/processes.service");
let FilesController = class FilesController {
    filesService;
    processesService;
    constructor(filesService, processesService) {
        this.filesService = filesService;
        this.processesService = processesService;
    }
    async uploadActas(id, files) {
        const fileRecepcion = files.actaRecepcion?.[0];
        const fileFundicion = files.actaFundicion?.[0];
        const fileConformidad = files.actaConformidad?.[0];
        if (!fileRecepcion || !fileFundicion || !fileConformidad) {
            throw new common_1.BadRequestException('Debe adjuntar las 3 actas: Recepción, Fundición y Conformidad');
        }
        for (const file of [fileRecepcion, fileFundicion, fileConformidad]) {
            if (file.size > 10 * 1024 * 1024) {
                throw new common_1.BadRequestException(`El archivo ${file.originalname} excede el tamaño máximo de 10MB`);
            }
        }
        const [pathRecepcion, pathFundicion, pathConformidad] = await Promise.all([
            this.filesService.saveActa(id, 'recepcion', fileRecepcion),
            this.filesService.saveActa(id, 'fundicion', fileFundicion),
            this.filesService.saveActa(id, 'conformidad', fileConformidad),
        ]);
        return this.processesService.closeWithActas(id, {
            actaRecepcion: pathRecepcion,
            actaFundicion: pathFundicion,
            actaConformidad: pathConformidad,
        });
    }
    async getActa(id, type, res) {
        const process = await this.processesService.findById(id);
        const fieldMap = {
            recepcion: 'actaRecepcion',
            fundicion: 'actaFundicion',
            conformidad: 'actaConformidad',
        };
        const field = fieldMap[type];
        if (!field) {
            throw new common_1.NotFoundException('Tipo de acta inválido');
        }
        const url = process[field];
        if (!url) {
            throw new common_1.NotFoundException('Acta no encontrada');
        }
        await this.filesService.streamActa(url, res);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)(':id/actas'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'actaRecepcion', maxCount: 1 },
        { name: 'actaFundicion', maxCount: 1 },
        { name: 'actaConformidad', maxCount: 1 },
    ], { limits: { fileSize: 10 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadActas", null);
__decorate([
    (0, common_1.Get)(':id/actas/:type'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getActa", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('processes'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [files_service_1.FilesService,
        processes_service_1.ProcessesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map