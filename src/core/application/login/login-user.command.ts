export class LoginUserCommand {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {}
}

export class UserDataCommand {
  constructor(
    readonly id: string,
    readonly email: string,
  ) {}
}
