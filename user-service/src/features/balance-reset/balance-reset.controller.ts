import { Body, Controller, Post } from '@nestjs/common';
import { BalanceResetService } from './balance-reset.service';

@Controller('balance-reset')
export class BalanceResetController {
  constructor(private readonly balanceResetService: BalanceResetService) {}
  @Post()
  async resetBallance(): Promise<string> {
    return this.balanceResetService.resetBalance();
  }
}
