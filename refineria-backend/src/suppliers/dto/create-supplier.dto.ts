import { IsString, Matches, MinLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @Matches(/^[JVEGP]-\d{8,9}-\d$/, {
    message: 'El RIF debe tener el formato J-12345678-9 (letra, 8-9 dígitos, dígito verificador)',
  })
  rif: string;

  @IsString()
  contactInfo: string;
}
