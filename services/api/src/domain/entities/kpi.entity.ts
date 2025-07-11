import {ApiProperty} from '@nestjs/swagger';

export class Kpi {
    @ApiProperty({description: 'ID du quiz'})
    quizId: string;

    @ApiProperty({description: 'Score moyen des sessions terminées'})
    averageScore: number;

    @ApiProperty({description: 'Nombre total de sessions terminées'})
    totalSessions: number;

    @ApiProperty({description: 'Durée totale des sessions terminées en secondes'})
    totalDuration: number;

    @ApiProperty({description: 'Durée moyenne des sessions terminées en secondes'})
    averageDuration: number;
}

