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
    const { song_name, rate, singer, description, permission, category } = song_details;
    console.log(metadata.common.picture ? metadata.common.picture[0].data : null);
    console.log(imageFile.buffer);

    const uploadedSong = {
      name: song_name,
      data: audioFile.buffer,
      rate: rate,
      permission: permission,
      imageData: metadata.common.picture ? metadata.common.picture[0].data : imageFile.buffer,
      mimetype: audioFile.mimetype,
      mimetypeImage: metadata.common.picture ? metadata.common.picture[0].format : imageFile.mimetype,
      uploadDate: new Date,
      like: 0,
      userIdUpload: userId,
      artists: metadata.common.artists || singer == "" ? ['anonym'] : [singer],//מפה מטהדתה
      album: metadata.common.album,
      duration: metadata.format.duration,
      title: metadata.common.title || song_name || 'לא ידוע',
      language: metadata.common.language,
      website: metadata.common.website,
      genre: metadata.common.genre,
      comment: metadata.common.comment,
      year: metadata.common.year || (new Date()).getFullYear(),
      description: metadata.common.description || description,
      category: category || ['other']
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

  // האם שיר קיים
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

  // שלב 1 
  // קבלת הערכים וניווט לפי- רגיל / חיפוש
  async getSongs(search: string, limit: number, offset: number, filter: any, sort: string): Promise<Song[]> {
    if (search)
      return this.getSongsSearch(search, limit, offset, filter)
    else
      return this.getAllSongs(limit, offset, filter, sort)
  }
  // שלב 2 - רגיל
  // ניווט למקרה של סינון ו או או מיון
  async getAllSongs(limit: number, offset: number, filter: any, sort: string): Promise<Song[]> {
    console.log(filter);
    if (filter && !(sort || sort != ""))
      return this.findSomeWithFilter(limit, offset, filter); // שירים עם מיון ללא סינון=
    else if (!filter && sort && sort != "")
      return this.findSomeWithSort(limit, offset, sort); // שירים עם מיון ללא סינון=
    else if (filter && sort && sort != "")
      return this.findSomeWithSortAndFilter(limit, offset, sort, filter);//שירים עם מיון + סינון 
    else
      return this.findSome(limit, offset);    // חיפוש ללא סינון וללא מיון

  }
  // ניהול מיון
  manageSorts(sort: string) {
    console.log("service sort: ", sort);
    const collectionSort = sort == "artists" ? "artists[0]" : sort == "popular" ? "like" : sort;
    const according = collectionSort;
    const sortQuery = {};
    const accordingNum = sort == "popular" || sort == "rate" || sort == "year" ? -1 : 1;
    sortQuery[according] = accordingNum;
    return sortQuery;
  }

  // ניהול סינון
  manageFilters(filter: any) {
    const filterQuery: any = {};
    if (filter?.dateRange) {
      // Define a filter for the song's year
      const yearFilter = {
        year: {
          $gte: filter.dateRange.begin, // Greater than or equal to filter.date.begin
          $lte: filter.dateRange.end,   // Less than or equal to filter.date.end
        },
      };
      Object.assign(filterQuery, yearFilter);
    }
    if (filter?.categorySelect && filter.categorySelect.length > 0) {
      filterQuery.category = {
        // $in: filter.categorySelect,
        // בדיקה האם קיימת לפחות קטגוריה אחת תואמת 
        $elemMatch: {
          $in: filter.categorySelect,
        },
      };
    }
    return filterQuery;
  }

  // אורך עם סינון | בלי הגבלה.
  async getFilteredLength(offset: number, filterQuery: any): Promise<number> {
    let songs: any;
    if (offset <= 0) {
      songs = await this.songModel.find(filterQuery).exec();
    }
    return songs.length || null;
  }

  // אורך כללי | בלי הגבלה.
  async getGeneralLength(offset: number): Promise<number> {
    let len: number = null;
    if (offset <= 0) {
      len = (await this.songModel.find()).length;
    }
    return len;
  }

  // שירים ללא סינון וללא מיון
  async findSome(limit: number, offset: number): Promise<any> {
    try {
      const songs = await this.songModel.find()
        .limit(limit)    // Limit the number of documents returned
        .skip(offset).exec();   // Skip the specified number of documents
      const songListLength = await this.getGeneralLength(offset);
      return { songs: songs, songListLength: songListLength };
    } catch (error) {
      // Handle any errors that occur during the database operation
      throw new Error('Error retrieving songs: ' + error);
    }
  }

  // (שירים עם מיון (ללא סינון
  async findSomeWithSort(limit: number, offset: number, sort: string): Promise<any> {
    try {
      const sortQuery = this.manageSorts(sort);
      const songs = await this.songModel.find()
        .sort(sortQuery)
        .limit(limit)    // Limit the number of documents returned
        .skip(offset).exec();   // Skip the specified number of documents
      songs.forEach(song => {
        console.log(`rate: ${song.rate}, like: ${song.like}, year: ${song.year}, artists: ${song.artists[0]}`);
      });
      const songListLength = await this.getGeneralLength(offset);
      return { songs: songs, songListLength: songListLength };
    } catch (error) {
      // Handle any errors that occur during the database operation
      throw new Error('Error retrieving songs: ' + error);
    }
  }


  // שירים עם מיון + סינון
  async findSomeWithSortAndFilter(limit: number, offset: number, sort: string, filter: any): Promise<any> {
    try {
      const sortQuery = this.manageSorts(sort);
      const filterQuery = this.manageFilters(filter);
      console.log(filterQuery);
      const songs = await this.songModel.find(filterQuery)
        .sort(sortQuery)
        .limit(limit)
        .skip(offset).exec();
      songs.forEach(song => {
        console.log(`rate: ${song.rate}, like: ${song.like}, year: ${song.year}, artists: ${song.artists[0]}`);
      });
      const songListLength = await this.getFilteredLength(offset, filterQuery);
      return { songs: songs, songListLength: songListLength };
    } catch (error) {
      // Handle any errors that occur during the database operation
      throw new Error('Error retrieving songs: ' + error);
    }
  }

  // שירים עם סינון (ללא מיון)
  async findSomeWithFilter(limit: number, offset: number, filter: any): Promise<any> {
    try {
      const filterQuery = this.manageFilters(filter);
      console.log(filterQuery);
      const songs = await this.songModel.find(filterQuery)
        .limit(limit)
        .skip(offset).exec();
      songs.forEach(song => {
        console.log(`rate: ${song.rate}, like: ${song.like}, year: ${song.year}, artists: ${song.artists[0]}`);
      });
      const songListLength = await this.getFilteredLength(offset, filterQuery);
      return { songs: songs, songListLength: songListLength };
      // return songs;
    } catch (error) {
      // Handle any errors that occur during the database operation
      throw new Error('Error retrieving songs: ' + error);
    }
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

  async getSongsSearch(search: string, limit: number, offset: number, filter: any): Promise<Song[]> {
    console.log("filter in sevice: ", filter)
    if (filter != undefined && filter.select) {
      return this.searchSomeWithSort(search, limit, offset, filter ? filter.select : "name");
    }
    else
      return this.searchSome(search, limit, offset);
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


  // getLength - רגיל
  async getLength(): Promise<number> {
    const len = (await this.songModel.find()).length;
    return len;
  }
  // getLengthSearch - חיפוש
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

  // find one song by id
  async findOne(id: string): Promise<Song> {
    const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
    return await this.songModel.findById(objectId).exec();
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