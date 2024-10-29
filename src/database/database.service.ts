import { DataSource } from 'typeorm';
import { Injectable, ConflictException, InternalServerErrorException, BadRequestException} from '@nestjs/common';


@Injectable()
export class DatabaseService {
  constructor(private dataSource: DataSource) {}

  async executeTransaction(query: string, params: any[] = []) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.query(query, params);
      await queryRunner.commitTransaction();
      return { success: true, data: result };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error.code
    } finally {
      await queryRunner.release();
    }
}
}
