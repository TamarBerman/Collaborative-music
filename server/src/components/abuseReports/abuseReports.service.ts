import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AbuseReports } from '../../schemas/abuseReport.schema';

@Injectable()
export class AbuseReportsService {
    constructor(@InjectModel(AbuseReports.name) private abuseReportsModel: Model<AbuseReports>) { }

    async createReport(abuseReportDetails: any) {
        try {
            // אפשר לעשות שאם זה קיים- הוא יעדכן את הדיווח שיהיה לא כמות כמה דיווחו עליו
            const _report = await this.checkSongExistsInAbuseReports(abuseReportDetails.songId);
            // בדיקה אם השיר לא קיים ברשימה שחורה, וגם אם המשתמש לא עבר את מכסת הדיווחים לבנ"א
            if (!_report && this.checkAmountAbuseReportsForUser(abuseReportDetails.userId)) {
                const report = new this.abuseReportsModel({
                    userId: abuseReportDetails.userId,
                    songId: abuseReportDetails.songId,
                    reportDate: Date.now(),
                    // status: StatusEnum.OPEN,
                    amount: 0,
                });
                const savedReport = await report.save();
                return savedReport;
            }
            else if (!this.checkAmountAbuseReportsForUser(abuseReportDetails.userId))
                throw new Error('User has exceeded the maximum number of abuse reports (limit: 10)')
            // else if (_report)
            // {
            //     const report = await this.updateReportIncreace(abuseReportDetails);
            // }
            return _report;
        }
        catch (error) {
            throw (error);
        }
    }

    // האם השיר קיים כבר ברשימה שחורה
    async checkSongExistsInAbuseReports(songId: string) {
        const abuseReportsList = await this.abuseReportsModel.findOne({ songId: songId }) || null;
        return abuseReportsList;
    }

    // האם המשתמש עבר את מכסת הדיווחים
    async checkAmountAbuseReportsForUser(userId: string) {
        const abuseReportsList = await this.abuseReportsModel.find({ userId: userId }) || [];
        if (abuseReportsList.length > 10)
            return false;
        return true;
    }

    // כל השירים ברשימה שחורה
    async getAllAbuseReports() {
        return await this.abuseReportsModel.find().exec();
    }

    
}


