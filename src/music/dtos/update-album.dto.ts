import { IsNumber , IsString, Length} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAlbumDto } from './create-album.dto';

export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {
    @ApiProperty({ required: true })
    @IsNumber()
    id: number;
}