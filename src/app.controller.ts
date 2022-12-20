import { Controller, Get } from '@nestjs/common';
import { Body, Post } from '@nestjs/common/decorators';
import { AppService } from './app.service';


export class appendToStoryDto {
  keywords: string;
  // model: string;
  // temperature: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("story")
  getStory(): string {
    return this.appService.getStory();
  }

  @Get("story-example")
  getStoryExample(): string {
    return this.appService.getExampleStory();
  }

  @Post('append')
  appendToStory(@Body() body: appendToStoryDto): Promise<string> {
    return this.appService.appendToStory(body.keywords);
  }
}
