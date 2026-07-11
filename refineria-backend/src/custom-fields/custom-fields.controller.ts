import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomFieldsService } from './custom-fields.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('custom-fields')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CustomFieldsController {
  constructor(private readonly service: CustomFieldsService) {}

  @Get(':tableName')
  @Roles(Role.SUPERADMIN)
  getDefinitions(@Param('tableName') tableName: string) {
    return this.service.getDefinitions(tableName);
  }

  @Post(':tableName')
  @Roles(Role.SUPERADMIN)
  createDefinition(
    @Param('tableName') tableName: string,
    @Body()
    body: {
      fieldName: string;
      fieldType: string;
      required?: boolean;
      options?: string;
    },
  ) {
    return this.service.createDefinition({ ...body, tableName });
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  deleteDefinition(@Param('id') id: string) {
    return this.service.deleteDefinition(id);
  }

  @Get(':tableName/records/:recordId')
  @Roles(Role.SUPERADMIN)
  getValues(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
  ) {
    return this.service.getValues(tableName, recordId);
  }

  @Post(':tableName/records/:recordId')
  @Roles(Role.SUPERADMIN)
  setValues(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
    @Body() body: { fields: Record<string, string> },
  ) {
    return this.service.setValues(tableName, recordId, body.fields);
  }
}
