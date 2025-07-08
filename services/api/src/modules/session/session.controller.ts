import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { Session } from '@entities/session.entity';
import { ReqUser } from "@common/types/request";
import { CreateSessionDto } from "@modules/session/dto/create-session.dto";
import {SessionFiltersDto} from "@modules/session/dto/filter-session.dto";

@ApiTags('Sessions')
@Controller('sessions')
@ApiBearerAuth('JWT-auth')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // @Post()
  // async create(@Body() data: Partial<Session>) {
  //   const session = await this.sessionService.create(data);
  //   const { userId, ...rest } = session.toObject ? session.toObject() : session;
  //   return rest;
  // }
  //
  // @Get()
  // async findAll() {
  //   const sessions = await this.sessionService.findAll();
  //   return sessions.map(s => {
  //     const { userId, ...rest } = s.toObject ? s.toObject() : s;
  //     return rest;
  //   });
  // }
  //
  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   const session = await this.sessionService.findOne(id);
  //   const { userId, ...rest } = session.toObject ? session.toObject() : session;
  //   return rest;
  // }
  //
  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() data: Partial<Session>) {
  //   const session = await this.sessionService.update(id, data);
  //   const { userId, ...rest } = session.toObject ? session.toObject() : session;
  //   return rest;
  // }
  //
  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   await this.sessionService.remove(id);
  //   return { deleted: true };
  // }
  //
  // // Démarrer une session (utilise l'utilisateur authentifié)
  // @Post('start')
  // @UseGuards() // Remplace par ton guard JWT si besoin, ex: AuthGuard('jwt')
  // async startSession(@Body() body: { quizId: string }, @Req() req: Request) {
  //   // @ts-ignore
  //   const userId = req.user?.id || req.user?._id;
  //   return this.sessionService.startSession(body.quizId, userId);
  // }
  //
  // // Terminer une session
  // @Post('finish/:id')
  // async finishSession(
  //   @Param('id') id: string,
  //   @Body() body: { score: number; answers: { correct: boolean; a: string }[] },
  // ) {
  //   const session = await this.sessionService.finishSession(id, body.score, body.answers);
  //   const { userId, ...rest } = session.toObject ? session.toObject() : session;
  //   return rest;
  // }
}
