import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Song } from '../../schemas/song.schema';

@Injectable()
export class SongService {
  constructor(@InjectModel(Song.name) private songModel: Model<Song>) { }

  async uploadFile(
    files: { image?: Express.Multer.File[], file?: Express.Multer.File[] },
    song_details: any
  ): Promise<Song> {
    try {
      // Access the uploaded files
      const imageFile = files.image ? files.image[0] : null;
      const audioFile = files.file ? files.file[0] : null;
      const { song_name, rate, singer, description, permission } = song_details;
      const newSong = new this.songModel({
        name: song_name,
        data: audioFile.buffer,
        singerName: singer,
        description: description,
        rate: rate,
        permission: permission,
        imageData: imageFile.buffer,
        mimetype: audioFile.mimetype,
        mimetypeImage: imageFile.mimetype,
        uploadDate: new Date,
      });
      const savedSong = await newSong.save();
      return savedSong;
    } catch (error) {
      throw new Error('Failed to upload files.');
    }
  }

  async findById(fileId: string) {
    return await this.songModel.findById(fileId).exec();
  }

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