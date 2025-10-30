import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/helpers/helpers.module';

@Module({
  imports: [HelpersModule],
})
export class AgentsModule {}
