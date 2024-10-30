import { IsNumber , IsString, Length} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSongDto } from './create-song.dto';

export class UpdateSongDto extends PartialType(CreateSongDto) {
    @ApiProperty({ required: true })
    @IsNumber()
    id: number;
    @ApiProperty({ required: false })
    @IsNumber()
    genre_id?: number
}