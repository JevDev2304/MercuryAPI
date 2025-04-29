import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Método original que ejecuta la transacción y sí guarda en la BD.
   */
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
      throw error.code;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Método que **nunca guarda en la BD**, pero retorna lo que **hubiera devuelto**.
   */
  
}
