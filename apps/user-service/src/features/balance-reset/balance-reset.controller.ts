import { Controller, Post } from '@nestjs/common';
import { BalanceResetService } from './balance-reset.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';

@Controller('balance-reset')
export class BalanceResetController {
  constructor(private readonly balanceResetService: BalanceResetService) {}
  @Post()
  @Roles(RoleEnum.ADMIN)
  async resetBallance(): Promise<string> {
    return this.balanceResetService.resetBalance();
  }
}
