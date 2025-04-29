import { IsNumber} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSongDto } from './create-song.dto';

export class UpdateSongDto extends PartialType(CreateSongDto) {
    @ApiProperty({ required: true })
    @IsNumber()
    id: number;

}