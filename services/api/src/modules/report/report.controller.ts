import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { GetReportsParams } from '../../domain/repositories/report.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { Request } from 'express';
import { AdminGuard } from '@common/guards/admin.guard';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async create(@Body() createReportDto: CreateReportDto, @Req() req: Request) {
    return this.reportService.create({
      ...createReportDto,
      reporterId: req.user.sub,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Get()
  @UseGuards(AdminGuard)
  async getReports(
    @Query('resolved') resolved?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const params: GetReportsParams = {
      resolved: resolved === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      sortBy,
      sortOrder,
    };

    const { reports, total } = await this.reportService.findAll(params);
    const totalPages = Math.ceil(total / params.limit);

    return {
      data: reports,
      total,
      page: params.page,
      totalPages,
      limit: params.limit,
    };
  }

  @Patch(':id/resolve')
  @UseGuards(AdminGuard)
  async resolveReport(@Param('id') id: string, @Req() req: Request) {
    return this.reportService.resolve(id, req.user.sub);
  }
}
