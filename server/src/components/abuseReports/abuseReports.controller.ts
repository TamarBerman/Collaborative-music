import { Controller, Post, Get, Patch, UseGuards, Body, Res, HttpStatus, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { Public } from '../auth/decorators/public.decorator';
import { AbuseReportsService } from './abuseReports.service';
import { AuthService } from "../auth/auth.service";


@Controller('abuse-reports')
export class AbuseReportsController {
    constructor(private abuseReportsService: AbuseReportsService, private authService: AuthService) { }

    @UseGuards(AuthGuard)
    @Post('/create')
    async createAbuseReport(@Req() request, @Body() details: any, @Res() response) {
        try {
            // מציאת ID של המשתמש מהREQUEST 
            const user_id = this.authService.getUserIdFromToken(request);
            // Add user_id to the details object
            const abuseReportDetails = details.details;
            abuseReportDetails.userId = user_id;
            const ret = await this.abuseReportsService.createReport(abuseReportDetails);
            response.status(HttpStatus.ACCEPTED).json(ret);
        }
        catch (error) {
            response.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }

    @Public()
    @Post('/get_all')
    async getAllAbuseReports() {
        return;
    }

    @UseGuards(AdminGuard)
    @Post('/update')
    async updateAbuseReport() {

        return;
    }
}
