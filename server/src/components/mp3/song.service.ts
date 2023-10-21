import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Song } from '../../schemas/song.schema';
import * as mongoose from 'mongoose';
import { parseBuffer } from 'music-metadata';
import * as mm from 'music-metadata/lib/core';
import { AbuseReportsService } from '../abuseReports/abuseReports.service';


@Injectable()
export class SongService {
  constructor(@InjectModel(Song.name) private songModel: Model<Song>
    // ,private abuseReportsService: AbuseReportsService,
  ) { }
  // Upload 
  async uploadFile(userId: string,
    files: { image?: Express.Multer.File[], file?: Express.Multer.File[] },
    song_details: any
  ): Promise<Song> {
    // try {
      // Access the uploaded files
      const imageFile = files.image ? files.image[0] : null;
      const audioFile = files.file ? files.file[0] : null;

      const metadata = await mm.parseBuffer(audioFile.buffer, 'audio/mp3');
      const { song_name, rate, singer, description, permission } = song_details;
      console.log(metadata.common.picture?metadata.common.picture[0].data:null);
      console.log(imageFile.buffer);

      const uploadedSong = {
        name: song_name,
        data: audioFile.buffer,
        rate: rate,
        permission: permission,
        imageData: metadata.common.picture?metadata.common.picture[0].data: imageFile.buffer,
        mimetype: audioFile.mimetype,
        mimetypeImage: metadata.common.picture?metadata.common.picture[0].format:  imageFile.mimetype,
        uploadDate: new Date,
        like: 0,
        userIdUpload: userId,
        artists: metadata.common.artists || singer==""?['anonym']:[singer],//מפה מטהדתה
        album: metadata.common.album,
        duration: metadata.format.duration,
        title: metadata.common.title || song_name || 'לא ידוע',
        language: metadata.common.language,
        website: metadata.common.website,
        genre: metadata.common.genre,
        comment: metadata.common.comment,
        year: metadata.common.year || (new Date()).getFullYear(),
        description: metadata.common.description || description
      }
      const newSong = new this.songModel(uploadedSong);

      if (await this.checkIfSongExists(newSong))
        throw new ConflictException('Song exists');
      //  בדיקה האם השיר קיים במאגר
      // const newSong = new this.songModel(uploadedSong);
      const savedSong = await newSong.save();
      return savedSong;
    // }
    //  catch (error) {
    //   console.log(error);
    //   throw new Error(error);
    // }
  }

  async checkIfSongExists(uploadedSong: any) {
    const { duration, year, artists, album, name } = uploadedSong;

    // Check for songs with the same duration
    const songsWithSameDuration = await this.songModel.find({ duration: duration });

    if (songsWithSameDuration.length === 0) {
      console.log("no duration")
      return false;
    }

    // Check for songs with the same year
    const songsWithSameYear = songsWithSameDuration.filter(song => song.year === year);

    if (songsWithSameYear.length === 0) {
      console.log("no year")

      return false;
    }

    // Check for songs with the same artists
    const songsWithSameArtists = songsWithSameYear.filter(song => song.artists[0] === artists[0]);

    if (songsWithSameArtists.length === 0) {
      console.log("no artists")

      return false;
    }

    // Check for songs with the same album
    const songsWithSameAlbum = songsWithSameArtists.filter(song => song.album === album);

    if (songsWithSameAlbum.length === 0) {
      console.log("no albume")

      return false;
    }

    // Check for songs with the same name
    const songsWithSameName = songsWithSameAlbum.filter(song => song.name === name);

    return songsWithSameName.length > 0;
  }


  // find 1 song 
  async findSong(songId: string): Promise<Song> {

    const song_id = new mongoose.Types.ObjectId(songId);
    const song = await this.songModel.findById(song_id);
    if (!song) {
      throw new NotFoundException('Song not found');
    }
    return song;
  }

  // delete song 
  async deleteSong(songId: string) {
    const song_id = new mongoose.Types.ObjectId(songId);
    const deletedSong = await this.songModel.findByIdAndDelete(song_id);
    if (!deletedSong) {
      throw new NotFoundException('Song not found');
    }
    return deletedSong;
  }
  // get songs..............
  async findById(fileId: string) {
    return await this.songModel.findById(fileId).exec();
  }

  // get all songs INFO
  async findAll(): Promise<Song[]> {
    return await this.songModel.find().exec();
  }

  async getSongs(search: string, limit: number, offset: number, filter: any): Promise<Song[]> {
    if (search)
      return this.getSongsSearch(search, limit, offset, filter)
    else
      return this.getAllSongs(limit, offset, filter)
  }
  async getAllSongs(limit: number, offset: number, filter: any): Promise<Song[]> {
    if (filter != undefined && filter.select) {
      return this.findSomeWithSort(limit, offset, filter.select)
    }
    else
      return this.findSome(limit, offset);
  }
  async getSongsSearch(search: string, limit: number, offset: number, filter: any): Promise<Song[]> {
    console.log("filter in sevice: ", filter)
    if (filter != undefined && filter.select) {
      return this.searchSomeWithSort(search, limit, offset, filter ? filter.select : "name");
    }
    else
      return this.searchSome(search, limit, offset);
  }
  // get songs for playlist searches for documents where the _id field matches any of the values provided in the ids array
  async getSongsByIds(limit: number, offset: number, ids: string[]): Promise<Song[]> {
    try {
      return this.songModel
        .find({ _id: { $in: ids } })
        .limit(limit)
        .skip(offset)
        .exec();
    } catch (error) {
      console.error('Error in getSongsByIds:', error);
      throw new Error('Error retrieving songs by IDs');
    }
  }

  async searchSome(search: string, limit: number, offset: number): Promise<Song[]> {
    const result = await this.songModel.find({
      $or: [
        { name: { $regex: new RegExp(search, 'i') } },
        { singerName: { $regex: new RegExp(search, 'i') } }
      ]
    })
      .limit(limit).skip(offset).exec();
    return result;
  }

  async searchSomeWithSort(search: string, limit: number, offset: number, sort: string): Promise<Song[]> {
    const according = sort;
    const sortQuery = {};
    sortQuery[according] = 1;
    const result = await this.songModel.find({
      $or: [
        { name: { $regex: new RegExp(search, 'i') } },
        { singerName: { $regex: new RegExp(search, 'i') } }
      ]
    })
      .sort(sortQuery)
      .limit(limit).skip(offset).exec();
    return result;
  }

  async findSome(limit: number, offset: number): Promise<Song[]> {
    try {
      const songs = await this.songModel.find()
        .limit(limit)    // Limit the number of documents returned
        .skip(offset).exec();   // Skip the specified number of documents
      return songs;
    } catch (error) {
      // Handle any errors that occur during the database operation
      throw new Error('Error retrieving songs: ' + error);
    }
  }
  async findSomeWithSort(limit: number, offset: number, sort: string): Promise<Song[]> {
    try {
      console.log("service sort: ", sort);
      const according = sort;
      const sortQuery = {};
      sortQuery[according] = 1;
      const songs = await this.songModel.find()
        .sort(sortQuery)
        .limit(limit)    // Limit the number of documents returned
        .skip(offset).exec();   // Skip the specified number of documents
      return songs;

    } catch (error) {
      // Handle any errors that occur during the database operation
      throw new Error('Error retrieving songs: ' + error);
    }
  }

  async getLength(): Promise<number> {
    const len = (await this.songModel.find()).length;
    return len;
  }

  async getLengthSearch(search: string): Promise<number> {
    const len = (await this.songModel.find({
      $or: [
        { name: { $regex: new RegExp(search, 'i') } },
        { singerName: { $regex: new RegExp(search, 'i') } }
      ]
    })).length;
    return len;
  }

  // filtering & sorting 
  async filterAndSortSongs(songs: Song[], minRate: number): Promise<Song[]> {
    const filteredSongs = songs.filter((song) => {
      // Filter songs based on the rate condition
      return song.rate >= minRate;
    });
    return filteredSongs;
  }

  async sortByRate(songs: Song[]): Promise<Song[]> {
    const sortedSongs = songs.sort((a, b) => {
      // Sort songs by rate in descending order
      return b.rate - a.rate;
    });
    return sortedSongs;
  }

  async findOne(id: string): Promise<Song> {
    const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
    return await this.songModel.findById(objectId).exec();
  }

  async getFileByName(name: string) {
    return await this.songModel.findOne({ name: name }).exec();
  }
  // add like
  async addLike(song_id: any) {
    const songId = new mongoose.Types.ObjectId(song_id);
    const c = await this.songModel.updateOne({ _id: songId }, { $inc: { like: 1 } })//, { new: true }
    return c;
  }
  // remove like
  async removeLike(song_id: any) {
    const songId = new mongoose.Types.ObjectId(song_id);
    const c = await this.songModel.updateOne({ _id: songId }, { $inc: { like: -1 } })//, { new: true }
    return c;
  }

  // get like count
  async getLikeCount(songId: string) {
    const song_id = new mongoose.Types.ObjectId(songId);
    const song = await this.songModel.findById(song_id);
    if (!song) {
      throw new NotFoundException('Song not found');
    }
    return song.like; // Return the like count for the song
  }

  // רשימת דיווחים
  async getAllAbuseReports() {

    // const abuseReports = await this.abuseReportsService.getAllAbuseReports();
    // const abuseReportsList=[];
    // abuseReports.forEach(report => {
    //   abuseReportsList.push(report.songId);
    // })
    // console.log(abuseReportsList);
    // return abuseReportsList;
  }

}

// async uploadFile(file: Express.Multer.File, song_details: any): Promise<Song> {
//   const { buffer, mimetype } = file;
//   const { song_name, rate, singer, description, permission } = song_details;
//   const newFile = new this.songModel({
//     name: song_name,
//     data: buffer,
//     singerName: singer,
//     description: description,
//     rate: rate,
//     permission: permission,
//     mimetype: mimetype,
//     uploadDate: new Date,
//   });
//   return newFile.save();
// }

// async uploadFiles(files: Array<Express.Multer.File>, details: any) {
//   const imageFile = files.find(file => file.fieldname === 'image');
//   const mp3File = files.find(file => file.fieldname === 'file');
//   // Handle image and mp3 files as per your requirements
//   // Access additional details
//   const { song_details } = details;
//   const { rate, song_name, permission, description, singer } = song_details;
//   // Process the details and files accordingly
//   // Return the response or perform additional operations
// }

// async searchWithInclusionCondition(keyword: string): Promise<Song[]> {
//   const result = await this.songModel.find({
//     $or: [
//       { name: { $regex: new RegExp(keyword, 'i') } },
//       { singerName: { $regex: new RegExp(keyword, 'i') } }
//     ]
//   }).exec();

//   return result;
// }