import { BadRequestException } from '@nestjs/common';

export class SessionAlreadyFinishedException extends BadRequestException {
  constructor() {
    super('Impossible de modifier une session terminée');
  }
}

