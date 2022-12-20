import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from "openai";
import * as storyJson from './assets/TextStore.json';
import { ethers } from 'ethers';

// const completions = new Completions({
//   apiKey: 'your-api-key',
// });
const STORYSTORE_ADDRESS = "";
const EXAMPLE_STORY = "Once upon a time, there was a great peanut warior. He was the best in the land, and no one could beat him. One day, he was challenged by a drone. The peanut warrior was not afraid, and he took out his sword. He was ready to fight, but the drone was too fast. It shot him with a peanut, and he was knocked out,When he woke up, he was in a hospital,The doctors told him that he was allergic to peanuts, and he would never be able to eat them again,The peanut warrior was sad, but he made the decision to never eat peanuts again, and he found a remedy for his allergy,He was able to continue his life, and he was happy,The End. The peanut warrior was sad, but he made the decision to never eat peanuts again, and he found a remedy for his allergy. He was able to continue his life, and he was happy.";
const NETWORK = "goerli";

@Injectable()
export class AppService {
  
  configuration: Configuration;
  openai: OpenAIApi;
  story: string = 'Once upon a time, there was a';
  temperature: number = 0.6;

  network = NETWORK;
  provider: ethers.providers.BaseProvider;
  storyContract: ethers.Contract = null;

  constructor(private configService: ConfigService) {
    this.configuration = new Configuration({
      apiKey: this.configService.get<string>('OPENAI_APIKEY'),
    });
    
    this.openai = new OpenAIApi(this.configuration);

    this.provider = ethers.getDefaultProvider(this.network );
    if (STORYSTORE_ADDRESS) {
      this.storyContract = new ethers.Contract(STORYSTORE_ADDRESS, storyJson.abi, this.provider);
    }
  }

  async getNetwork(): Promise<string> {
    return this.network;
  }

  async getStoryStoreContractAddress(): Promise<string> {
    return STORYSTORE_ADDRESS;
  }

  async appendToStory(
    keywordsString: string,
  ): Promise<string> {
    // Use the OpenAI completions API to generate a sentence or two based on the prompt and optional parameters

    const sentences = this.story.split('. ');
    const lastSentences = sentences.slice(-20);

    let keywords = keywordsString.split(',');
    let maxLength = Math.min(keywords.length, 3);
    let keywordPrompt = '';
    for (let i = 0; i < maxLength; i++) {
      let key = keywords[i].replace(" ","");
      console.log(key);
      if (key.split(' ').length <= 1 && key.length < 20) {
        let seperator = i < maxLength-1 ? ',' : ':';
        keywordPrompt += ` "${key}"${seperator}`;
        
      }
    }
    let prompt = `continue the below story using these keywords: ${keywordPrompt} \n ${lastSentences}`;
    console.log(prompt);
    const temperature = this.temperature;
    const model = 'text-davinci-002';
    
    const response = await this.openai.createCompletion({
      prompt,
      max_tokens: 64,
      temperature,
      model,
    });

    const generatedText = response.data.choices[0].text;
    let updatedStory = `${this.story} ${generatedText}`;
    updatedStory = updatedStory.replace(/\s{2,}/g, ' ');  // remove extra spaces
    this.story = updatedStory;
    return updatedStory;
  }

  getStory(): string {
    return this.story;
  }
  
  getExampleStory(): string {
    return EXAMPLE_STORY;
  }

}
