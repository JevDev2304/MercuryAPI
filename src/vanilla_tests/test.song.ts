import { strict as assert } from 'assert';
import { DatabaseService} from '../database/database.service';
import { SongService } from '../music/services/song.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

class SongServiceTest {
  private service: SongService;
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService({} as any);
    this.service = new SongService(this.databaseService);
  }

  async runTests() {
    await this.testAddSongToPlaylist();
    await this.testSongNotFound();
    await this.testUnknownError();
  }

  async testAddSongToPlaylist() {
    this.databaseService.executeTransaction = (query, params) => {
      return Promise.resolve({
        success: true,
        data: [{ song_id: params[0], playlist_id: params[1] }],
      });
    };

    const song_id = 6431498;
    const playlist_id = 1835742;
    const result = await this.service.addSongToPlaylist(song_id, playlist_id);

    assert.equal(result.success, true);
    assert.equal(result.data.length, 1);
    assert.deepEqual(result.data[0], { song_id, playlist_id });

    console.log('✅ testAddSongToPlaylist passed');
  }

  async testSongNotFound() {
    this.databaseService.executeTransaction = () => Promise.reject({ code: '23503' });

    try {
      await this.service.addSongToPlaylist(6431498, 1835742);
      assert.fail('Expected NotFoundException to be thrown');
    } catch (error) {
      assert.ok(error instanceof NotFoundException);
    }

    console.log('✅ testSongNotFound passed');
  }

  async testUnknownError() {
    this.databaseService.executeTransaction = () => Promise.reject({});

    try {
      await this.service.addSongToPlaylist(6431498, 1835742);
      assert.fail('Expected InternalServerErrorException to be thrown');
    } catch (error) {
      assert.ok(error instanceof InternalServerErrorException);
    }

    console.log('✅ testUnknownError passed');
  }
}

// Ejecutar las pruebas
const testSuite = new SongServiceTest();
testSuite.runTests();
