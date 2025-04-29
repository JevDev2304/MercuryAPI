import { DatabaseService } from "../../database/database.service";
import { SongService } from "./song.service";
import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException, MethodNotAllowedException, NotFoundException } from "@nestjs/common";



describe('SongService', () => {
    let service: SongService;
    let databaseService: DatabaseService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
            SongService,
          {
            provide: DatabaseService,
            useValue: {
              executeTransaction: jest.fn().mockImplementation((query, params) => (
                {
                    success: true,
                    data: [
                      {
                        song_id: params[0],
                        playlist_id:params[1]
                      }
                    ]
                  }
              )),
            },
          },
        ],
      }).compile();
      service = module.get<SongService>(SongService);
      databaseService = module.get<DatabaseService>(DatabaseService);

});
beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runAllTimers();
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.resetModules();

  });
     describe ('Add song to Playlist', () => {
        it('C19 It should return a JSON with { success: true, song_id: <song_id>, playlist_id: <playlist_id> } ', async () => {
          const song_id : number  = 6431498;
          const playlist_id : number = 1835742;
      
          const result = await service.addSongToPlaylist(song_id,playlist_id);
          expect(result.success).toBe(true);
          expect(result.data).toHaveLength(1);
          expect(result.data[0]).toMatchObject({
                song_id: 6431498,
                playlist_id: 1835742  
          });
        }
      

      );

      it('C20 It should return a NotFoundException(404) because the song_id or playlist_id does  not exist on database ', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
          code: '23503'
      });
        const song_id : number  = 6431498;
        const playlist_id : number = 1835742;
    
        await expect(service.addSongToPlaylist(song_id,playlist_id)).rejects.toThrow(NotFoundException);

      }
    

    );

    it('C21 It should return an InternalServerErrorException due an unknown error', async () => {
      databaseService.executeTransaction = jest.fn().mockRejectedValue({
    });
      const song_id : number  = 6431498;
      const playlist_id : number = 1835742;
  
      await expect(service.addSongToPlaylist(song_id,playlist_id)).rejects.toThrow(InternalServerErrorException);

    }
  

  );
        
    });
    describe ('Find song using Id', () => {
      it('C27 It should return a song given an Id', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [{
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          }]
        });
      
        const songId = 6431498;
        const result = await service.findSongById(songId);
        expect(result).toEqual({
          id: 6431498,
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        });
      });


      it('C28 It should return a Not Found Exception because does not exist a song with this id', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [
          ]
        });
      
        const songId = 6431498;
        await expect(service.findSongById(songId)).rejects.toThrow(NotFoundException);
      });

      it('C29 It should return Method not Allowed Exception because exist more than one song with this id', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [
            {
              id: 6431498,
              genre_id: 13,
              name: "tetris",
              lyrics: "letra",
              created_at: "2024-11-12",
              image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
              mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
              time: "1m 23s"
            },
            {
              id: 6431498,
              genre_id: 13,
              name: "tetris",
              lyrics: "letra",
              created_at: "2024-11-12",
              image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
              mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
              time: "1m 23s"
            }
          ]
        });
      
        const songId = 6431498;
        await expect(service.findSongById(songId)).rejects.toThrow(MethodNotAllowedException);
      });

      it('C30 It should return Internal Server Exception because the databaseService Throw an unknown error', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        const songId = 6431498;
        await expect(service.findSongById(songId)).rejects.toThrow(InternalServerErrorException);
      });
    });
    describe ('FindSongByGenreId', () => {
      it('C31 It should return songs of a given genre by Id', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [{
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          },
          {
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          }]
        });
      
        const genreId = 6431498;
        const result = await service.findSongsByGenreId(genreId);
        expect(result).toEqual([{
          id: 6431498,
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        },
        {
          id: 6431498,
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        }]);
        
      });
      it('C32 It should return Internal Server Exception because the databaseService Throw an unknown error', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        const genreId = 6431498;
        await expect(service.findSongsByGenreId(genreId)).rejects.toThrow(InternalServerErrorException);
      });

    });
    describe ('FindSongsforSearchEngine', () => {
      it('C33 It should return songs of related with a name', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [{
            id: 6431499,
            genre_id: 13,
            name: "tetris 1",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          },
          {
            id: 6431498,
            genre_id: 13,
            name: "tetris 2",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          }]
        });
      
        const word = 'tetris';
        const result = await service.findSongsforSearchEngine(word);
        expect(result).toEqual([{
          id: 6431499,
          genre_id: 13,
          name: "tetris 1",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        },
        {
          id: 6431498,
          genre_id: 13,
          name: "tetris 2",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        }]);
        
      });
      it('C34 It should return Internal Server Exception because the databaseService Throw an unknown error', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        const word = 'DUCK DUCK';
        await expect(service.findSongsforSearchEngine(word)).rejects.toThrow(InternalServerErrorException);
      });


    });
    describe('GetRandomSongs', () => {
      it('C35 It should return  random songs', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [{
            id: 6431498,
            genre_id: 13,
            name: "tetris 1",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          },
          {
            id: 643149866,
            genre_id: 13,
            name: "La gasolina",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          }]
        });
      
        const limit_songs = 2;
        const result = await service.getRandomSongs(limit_songs);
        expect(result).toEqual( [{
          id: 6431498,
          genre_id: 13,
          name: "tetris 1",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        },
        {
          id: 643149866,
          genre_id: 13,
          name: "La gasolina",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        }]);
        
      });
      it('C36 It should return Internal Server Exception because the databaseService Throw an unknown error', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        const limit_songs = 3;
        await expect(service.getRandomSongs(limit_songs)).rejects.toThrow(InternalServerErrorException);
      });

      it('C37 It should return Method Not Allowed because the number of songs is less than 0', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        const limit_songs = -10;
        await expect(service.getRandomSongs(limit_songs)).rejects.toThrow(MethodNotAllowedException);
      });
      it('C38 It should return Method Not Allowed because the number of songs is greater than Number.MAX_VALUE', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({});
      
        const limit_songs =  Number.MAX_VALUE + 1;
        await expect(service.getRandomSongs(limit_songs)).rejects.toThrow(MethodNotAllowedException);
      });
    });
    describe('DeleteSong', () => {
      it('C39 It should throw NotFoundException if the song does not exist', async () => {
        jest.spyOn(service, 'findSongById').mockResolvedValue(null);
        let song_id = 4;
        await expect(service.deleteSong(song_id)).rejects.toThrow(NotFoundException);
      });

      it('C40 It should return a deleted song given an Id', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [{
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          }]
        });
      
        const songId = 6431498;
        const result = await service.deleteSong(songId);
        expect(result).toEqual({
          success: true,
          data: [{
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          }]
        });
      });


      it('C41 It should return Internal Server Exception because the databaseService Throw an unknown error', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        const song_id = 3;
        await expect(service.deleteSong(song_id)).rejects.toThrow(InternalServerErrorException);
      });

    });
    describe('FindSongsFromPlaylist', () => {

      it('C42 It should return songs of a given playlist by Id', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [{
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          },
          {
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          }]
        });
      
        const playlistId = 6431498;
        const result = await service.findSongsFromPlaylist(playlistId);
        expect(result).toEqual([{
          id: 6431498,
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        },
        {
          id: 6431498,
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        }]);
        
      });
      it('C43 It should return Internal Server Exception because the databaseService Throw an unknown error', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        const playlistId = 6431498;
        await expect(service.findSongsFromPlaylist(playlistId)).rejects.toThrow(InternalServerErrorException);
      });

    });
    describe('FindSongsFromAlbum',() => {
      it('C44 It should return songs of a given album by Id', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [{
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          },
          {
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          }]
        });
      
        const albumId = 6431498;
        const result = await service.findSongsFromAlbum(albumId);
        expect(result).toEqual([{
          id: 6431498,
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        },
        {
          id: 6431498,
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        }]);
        
      });
      it('C45 It should return Internal Server Exception because the databaseService Throw an unknown error', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        const albumId = 6431498;
        await expect(service.findSongsFromAlbum(albumId)).rejects.toThrow(InternalServerErrorException);
      });

    });
    describe('Top20Songs',() => {
      it('C46 It should return top 20 songs', async () => {
        const songsArray = Array.from({ length: 20 }, (_, index) => ({
          id: 6431498 + index, 
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        }));
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: songsArray
        });
      
        const result = await service.top20Songs();
        expect(result).toEqual(songsArray);
        
      });
      it('C47 It should return Internal Server Exception because the databaseService Throw an unknown error', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        await expect(service.top20Songs()).rejects.toThrow(InternalServerErrorException);
      });

    });
    describe('FindSongsFromArtist', () => {
      it('C48 It should return songs of a given artist by Id', async () => {
        databaseService.executeTransaction = jest.fn().mockResolvedValue({
          success: true,
          data: [{
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          },
          {
            id: 6431498,
            genre_id: 13,
            name: "tetris",
            lyrics: "letra",
            created_at: "2024-11-12",
            image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
            mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
            time: "1m 23s"
          }]
        });
      
        const artistId = 4;
        const result = await service.findSongsFromArtist(artistId);
        expect(result).toEqual([{
          id: 6431498,
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        },
        {
          id: 6431498,
          genre_id: 13,
          name: "tetris",
          lyrics: "letra",
          created_at: "2024-11-12",
          image: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/images/cd4ca9d2-bb46-4129-b106-d7fee38f4790/tetris.jpeg",
          mp3: "https://qgjoyydixskkohmjmcme.supabase.co/storage/v1/object/public/Songs/audios/cd4ca9d2-bb46-4129-b106-d7fee38f4790/Tetris.mp3",
          time: "1m 23s"
        }]);
        
      });
      it('C49 It should return Internal Server Exception because the databaseService Throw an unknown error', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue({
        });
      
        const albumId = 4;
        await expect(service.findSongsFromArtist(albumId)).rejects.toThrow(InternalServerErrorException);
      });
    });

    describe('CreateSong', ()=> {} );
    describe('ReplaySong', () => {});
    describe('AddSongToArtist', () => {});
    describe('DeleteSongFromArtist', () => {});
    describe('DeleteSongFromPlaylist', () => {});
    describe('AddSongToAlbum',() => {});
    describe('DeleteSongFromAlbum',() => {});
    describe('UpdateSong', () => {});
    
    
    
    

    







    

});