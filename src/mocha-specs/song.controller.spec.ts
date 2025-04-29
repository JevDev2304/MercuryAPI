import { SongController } from '../music/controllers/song.controller';
import { SongService } from '../music/services/song.service';
import { CreateSongDto } from '../music/dtos/create-song.dto';
import { UpdateSongDto } from '../music/dtos/update-song.dto';

const { expect } = require('chai');
import * as sinon from 'sinon';

describe('SongController', () => {
  let controller: SongController;
  let songService: sinon.SinonStubbedInstance<SongService>;

  beforeEach(() => {
    songService = sinon.createStubInstance(SongService);
    controller = new SongController(songService);
  });
  afterEach(() => {
    sinon.restore();
  });

  describe('createSong', () => {
    it('01 - should create a song and return the result', async () => {
      // Arrange
      const dto: CreateSongDto = {
        genre_id: 1,
        name: 'Test Song',
        lyrics: 'These are the lyrics',
        time: '03:45',
        image: 'https://example.com/image.jpg',
        mp3: 'https://example.com/song.mp3',
      };

      const expectedResponse = {
        success: true,
        data: { id: 1, ...dto },
      };

      songService.createSong.resolves(expectedResponse);

      // Act
      const result = await controller.createSong(dto);

      // Assert
      expect(result).to.deep.equal(expectedResponse);
      expect(songService.createSong.calledOnceWithExactly(dto)).to.be.true;
    });

    it('02 - should return an error if dto is missing required fields', async () => {
      // Arrange
      const dto = {
        genre_id: 1,
        name: '', // invalid
        lyrics: 'Lyrics',
        time: '03:00',
        image: '',
        mp3: ''
      } as CreateSongDto;

      const expectedError = {
        success: false,
        message: 'Invalid data'
      };

      songService.createSong.rejects(new Error('Invalid data'));

      // Act
      try {
        await controller.createSong(dto);
      } catch (error) {
        // Assert
        expect(error.message).to.equal(expectedError.message);
      }
    });

    it('03 - should return an error if genre_id is negative', async () => {
      // Arrange
      const dto = {
        genre_id: -5,
        name: 'Bad Genre',
        lyrics: 'Bad',
        time: '03:00',
        image: 'https://example.com/img.jpg',
        mp3: 'https://example.com/bad.mp3',
      };

      songService.createSong.rejects(new Error('Invalid genre_id'));

      // Act
      try {
        await controller.createSong(dto);
      } catch (error) {
        // Assert
        expect(error.message).to.equal('Invalid genre_id');
        expect(songService.createSong.calledOnceWithExactly(dto)).to.be.true;
      }
    });

    it('04 - should handle exceptions thrown by the service', async () => {
      // Arrange
      const dto: CreateSongDto = {
        genre_id: 1,
        name: 'Error Song',
        lyrics: 'Lyrics',
        time: '03:45',
        image: 'https://example.com/img.jpg',
        mp3: 'https://example.com/song.mp3',
      };

      songService.createSong.rejects(new Error('Unexpected error'));

      // Act
      try {
        await controller.createSong(dto);
      } catch (error) {
        // Assert
        expect(error.message).to.equal('Unexpected error');
      }
    });

    it('05 - should reject if service returns null', async () => {
      // Arrange
      const dto: CreateSongDto = {
        genre_id: 1,
        name: 'Null Song',
        lyrics: 'Lyrics',
        time: '02:00',
        image: 'https://example.com/image.jpg',
        mp3: 'https://example.com/song.mp3',
      };

      songService.createSong.resolves(null as any);

      // Act
      const result = await controller.createSong(dto);

      // Assert
      expect(result).to.be.null;
    }
);

    
    
  });

  describe('addSongToPlaylist', () => {
    it('06 - should add song to playlist successfully', async () => {
      // Arrange
      const expected = { success: true, data: { song: '1', playlist: '2' } };
      songService.addSongToPlaylist.resolves(expected);
  
      // Act
      const result = await controller.addSongToPlaylist('1', '2');
  
      // Assert
      expect(result).to.deep.equal(expected);
    });
  
    it('07 - should handle service throwing error', async () => {
      // Arrange
      const error = new Error('Failed to add');
      songService.addSongToPlaylist.rejects(error);
  
      // Act & Assert
      try {
        await controller.addSongToPlaylist('1', '2');
        throw new Error('This line should not be reached');
      } catch (e) {
        expect(e.message).to.equal('Failed to add');
      }
    });
  
  });
  describe('deleteSong', () => {
    it('08 - should delete song and return confirmation', async () => {
      songService.deleteSong.resolves('deleted');
      const result = await controller.deleteSong('12');
      expect(result).to.equal('deleted');
    });
  
    it('09 - should throw error if deletion fails', async () => {
      songService.deleteSong.rejects(new Error('Delete failed'));
      try {
        await controller.deleteSong('99');
      } catch (e) {
        expect(e.message).to.equal('Delete failed');
      }
    });
  
    it('10 - should handle invalid song id', async () => {
      songService.deleteSong.rejects(new Error('Invalid ID'));
      try {
        await controller.deleteSong('bad-id');
      } catch (e) {
        expect(e.message).to.equal('Invalid ID');
      }
    });
  });

  describe('updateSong', () => {
    it('11 - should update song successfully', async () => {
      // Arrange
      const dto: UpdateSongDto = {
        id: 1,
        name: 'Updated Song',
        // genre_id: 2,
        // lyrics: 'Updated lyrics',
        // time: '04:00',
        // image: 'https://example.com/img.jpg',
        // mp3: 'https://example.com/song.mp3',
      };
      const expected = { success: true, data: dto };
      songService.updateSong.resolves(expected);
  
      // Act
      const result = await controller.updateSong(dto);
  
      // Assert
      expect(result).to.deep.equal(expected);
      expect(songService.updateSong.calledOnceWithExactly(dto)).to.be.true;
    });
  
    it('12 - should throw error if update fails', async () => {
      // Arrange
      const dto: UpdateSongDto = { id: 1 };
      const error = new Error('Update failed');
      songService.updateSong.rejects(error);
  
      // Act & Assert
      try {
        await controller.updateSong(dto);
        throw new Error('This line should not be reached');
      } catch (e) {
        expect(e.message).to.equal('Update failed');
        expect(songService.updateSong.calledOnceWithExactly(dto)).to.be.true;
      }
    });
  
    it('13 - should return null if service returns null', async () => {
      // Arrange
      const dto: UpdateSongDto = { id: 2, name: 'Null Song' };
      songService.updateSong.resolves(null as any);
  
      // Act
      const result = await controller.updateSong(dto);
  
      // Assert
      expect(result).to.be.null;
      expect(songService.updateSong.calledOnceWithExactly(dto)).to.be.true;
    });
  });
  describe('getSongsByWord', () => {
    it('14 - should return a list of matching songs', async () => {
      // Arrange
      const word = 'love';
      const expected = [{ id: 1, title: 'Love Song' }];
      songService.findSongsforSearchEngine.resolves(expected);
  
      // Act
      const result = await controller.getSongsByWord(word);
  
      // Assert
      expect(result).to.deep.equal(expected);
      expect(songService.findSongsforSearchEngine.calledOnceWithExactly(word)).to.be.true;
    });
  
    it('15 - should return an empty array if no songs match', async () => {
      // Arrange
      const word = 'nomatch';
      songService.findSongsforSearchEngine.resolves([]);
  
      // Act
      const result = await controller.getSongsByWord(word);
  
      // Assert
      expect(result).to.deep.equal([]);
    });
  
    it('16 - should throw an error if the service fails', async () => {
      // Arrange
      const word = 'error';
      const error = new Error('Service failed');
      songService.findSongsforSearchEngine.rejects(error);
  
      // Act & Assert
      try {
        await controller.getSongsByWord(word);
        throw new Error('This line should not be reached');
      } catch (e) {
        expect(e).to.equal(error);
      }
    });
  
    it('17 - should handle empty string as search term', async () => {
      // Arrange
      const word = '';
      const expected = [];
      songService.findSongsforSearchEngine.resolves(expected);
  
      // Act
      const result = await controller.getSongsByWord(word);
  
      // Assert
      expect(result).to.deep.equal(expected);
    });
  
    it('18 - should accept special characters in the search term', async () => {
      // Arrange
      const word = 'rock&roll';
      const expected = [{ id: 2, title: 'Rock & Roll' }];
      songService.findSongsforSearchEngine.resolves(expected);
  
      // Act
      const result = await controller.getSongsByWord(word);
  
      // Assert
      expect(result).to.deep.equal(expected);
    });
  
    it('19 - should return null if service returns null', async () => {
      // Arrange
      const word = 'nullcase';
      songService.findSongsforSearchEngine.resolves(null as any);
  
      // Act
      const result = await controller.getSongsByWord(word);
  
      // Assert
      expect(result).to.be.null;
    });
  });

  describe('getRandomSongs', () => {
    it('20 - should return random songs successfully', async () => {
      // Arrange
      const n = '5'; // El número de canciones a obtener
      const expected = [
        { id: 1, title: 'Random Song 1' },
        { id: 2, title: 'Random Song 2' },
        { id: 3, title: 'Random Song 3' },
        { id: 4, title: 'Random Song 4' },
        { id: 5, title: 'Random Song 5' },
      ];
      songService.getRandomSongs.resolves(expected);
  
      // Act
      const result = await controller.getRandomSongs(n);
  
      // Assert
      expect(result).to.deep.equal(expected);
      expect(songService.getRandomSongs.calledOnceWithExactly(5)).to.be.true;
    });
  
    it('21 - should return an empty array if n is 0', async () => {
      // Arrange
      const n = '0';
      const expected = [];
      songService.getRandomSongs.resolves(expected);
  
      // Act
      const result = await controller.getRandomSongs(n);
  
      // Assert
      expect(result).to.deep.equal(expected);
      expect(songService.getRandomSongs.calledOnceWithExactly(0)).to.be.true;
    });
  
    it('22 - should throw an error if service fails', async () => {
      // Arrange
      const n = '3';
      const error = new Error('Service failed');
      songService.getRandomSongs.rejects(error);
  
      // Act & Assert
      try {
        await controller.getRandomSongs(n);
        throw new Error('This line should not be reached');
      } catch (e) {
        expect(e).to.equal(error);
      }
    });
  
    it('23 - should handle invalid n (not a number)', async () => {
      // Arrange
      const n = 'invalid';
      const errorMessage = 'Invalid number format';
      songService.getRandomSongs.rejects(new Error(errorMessage));
  
      // Act & Assert
      try {
        await controller.getRandomSongs(n);
        throw new Error('This line should not be reached');
      } catch (e) {
        expect(e.message).to.equal(errorMessage);
      }
    });
  });

  describe('getTop20Songs', () => {
    it('24 - should return the top 20 songs successfully', async () => {
      // Arrange
      const top20Songs = [];
      for (let i = 1; i <= 20; i++) {
        top20Songs.push({
          id: i,
          genre_id: i,
          name: `Song ${i}`,
          lyrics: `Lyrics ${i}`,
          time: '03:00',
          image: `https://example.com/image${i}.jpg`,
          mp3: `https://example.com/song${i}.mp3`,
        });
      }
  
      const expectedResponse = { success: true, data: top20Songs };
  
      songService.top20Songs.resolves(expectedResponse);
  
      // Act
      const result = await controller.getTop20Songs();
  
      // Assert
      expect(result).to.deep.equal(expectedResponse);
      expect(songService.top20Songs.calledOnce).to.be.true;
    });
  
    it('25 - should return empty array if no top 20 songs are found', async () => {
      // Arrange
      const expectedResponse = { success: true, data: [] };
  
      songService.top20Songs.resolves(expectedResponse);
  
      // Act
      const result = await controller.getTop20Songs();
  
      // Assert
      expect(result).to.deep.equal(expectedResponse);
      expect(songService.top20Songs.calledOnce).to.be.true;
    });
  
    it('26 - should handle service throwing an error', async () => {
      // Arrange
      const error = new Error('Failed to get top 20 songs');
      songService.top20Songs.rejects(error);
  
      // Act & Assert
      try {
        await controller.getTop20Songs();
        throw new Error('This line should not be reached');
      } catch (e) {
        expect(e.message).to.equal('Failed to get top 20 songs');
      }
    });
  
    it('27 - should handle service returning null', async () => {
      // Arrange
      const expectedResponse = { success: false, message: 'No songs found' };
  
      songService.top20Songs.resolves(null);
  
      // Act
      const result = await controller.getTop20Songs();
  
      // Assert
      expect(result).to.deep.equal(expectedResponse);
      expect(songService.top20Songs.calledOnce).to.be.true;
    });
  });
  
  
  


  
  
  

  
});
