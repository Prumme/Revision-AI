import { NotFoundException } from '@nestjs/common';

export class SessionAccessDenied extends NotFoundException {
  constructor() {
    super('Session non trouvée');
  }
}
