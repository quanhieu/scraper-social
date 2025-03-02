import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import Strategy from 'passport-headerapikey';

@Injectable()
export class HeaderApiKeyStrategy extends PassportStrategy(
  Strategy as any,
  'api-key',
) {
  constructor(private readonly configService: ConfigService) {
    super({ header: 'X-API-KEY', prefix: '' }, true, (apiKey, done) => {
      this.validate(apiKey, done);
    });
  }

  public validate = (
    apiKey: string,
    done: (error: Error | null, data: boolean | null) => void,
  ) => {
    if (this.configService.get<string>('API_KEY') === apiKey) {
      done(null, true);
      return;
    }
    done(new UnauthorizedException(), null);
  };
}
