import { DatabaseService } from "src/database/database.service";
import { SongService } from "./song.service";
import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException, NotFoundException } from "@nestjs/common";



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
});
