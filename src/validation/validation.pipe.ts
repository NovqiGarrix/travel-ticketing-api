import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ValidationException } from 'src/exceptions/validation.exception';
import { type ZodType } from 'zod';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new ValidationException(parsed.error);
    }

    return parsed.data;
  }
}
