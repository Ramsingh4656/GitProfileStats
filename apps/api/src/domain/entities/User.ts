export interface IUserProps {
  id: string;
  githubId: string;
  username: string;
  email: string | null;
  avatarUrl: string;
  tier: 'FREE' | 'PRO';
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: IUserProps) {}

  public static create(props: IUserProps): User {
    return new User(props);
  }

  public get id(): string { return this.props.id; }
  public get githubId(): string { return this.props.githubId; }
  public get username(): string { return this.props.username; }
  public get email(): string | null { return this.props.email; }
  public get avatarUrl(): string { return this.props.avatarUrl; }
  public get tier(): 'FREE' | 'PRO' { return this.props.tier; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  public upgradeToPro(): void {
    this.props.tier = 'PRO';
    this.props.updatedAt = new Date();
  }

  public downgradeToFree(): void {
    this.props.tier = 'FREE';
    this.props.updatedAt = new Date();
  }

  public toJSON(): IUserProps {
    return { ...this.props };
  }
}
