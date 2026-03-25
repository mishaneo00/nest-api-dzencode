import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  IsUrl,
} from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export class CreateCommentDto {
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(({ value }) => {
    return sanitizeHtml(value, {
      allowedTags: ['a', 'code', 'i', 'strong'],
      allowedAttributes: {
        a: ['href', 'title', 'target', 'name'],
      },
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', {
          rel: 'nofollow',
          target: '_blank',
        }),
      },
    });
  })
  text: string;

  @IsOptional()
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    { message: 'Введите корректный URL (например, https://example.com)' },
  )
  homepage?: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
