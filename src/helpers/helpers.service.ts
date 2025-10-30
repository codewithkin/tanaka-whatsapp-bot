import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HelpersService {
  constructor() {}

  // helper to generate a random id using uuid
  generateRandomId(): string {
    return uuidv4();
  }
}
