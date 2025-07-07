import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class QuizFilterDto {
    @ApiProperty({ required: false, description: 'Recherche par titre' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false, description: 'Filtrer par catégorie' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({ required: false, description: 'Filtrer par visibilité' })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}
