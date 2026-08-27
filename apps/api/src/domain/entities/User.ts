export interface IUserSettings {
  preferredTheme: string;
  defaultCardStyle: string;
  languageSorting: string;
  defaultCardVisibility: {
    profile: boolean;
    stats: boolean;
    languages: boolean;
    streak: boolean;
    trophies: boolean;
    topContributed: boolean;
  };
}

export interface IUserProps {
  id: string;
  githubId: string;
  username: string;
  email: string | null;
  avatarUrl: string;
  tier: 'FREE' | 'PRO';
  createdAt: Date;
  updatedAt: Date;
  settings?: IUserSettings;
  githubAccessToken?: string;
}

export class User {
  private constructor(private readonly props: IUserProps) {}

  public static create(props: IUserProps): User {
    return new User(props);
  }

  private readonly defaultSettings: IUserSettings = {
    preferredTheme: 'dark',
    defaultCardStyle: 'classic',
    languageSorting: 'size',
    defaultCardVisibility: {
      profile: true,
      stats: true,
      languages: true,
      streak: true,
      trophies: true,
      topContributed: true,
    },
  };

  public get id(): string {
    return this.props.id;
  }
  public get githubId(): string {
    return this.props.githubId;
  }
  public get username(): string {
    return this.props.username;
  }
  public get email(): string | null {
    return this.props.email;
  }
  public get avatarUrl(): string {
    return this.props.avatarUrl;
  }
  public get tier(): 'FREE' | 'PRO' {
    return this.props.tier;
  }
  public get createdAt(): Date {
    return this.props.createdAt;
  }
  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
  public get settings(): IUserSettings {
    return this.props.settings ?? { ...this.defaultSettings };
  }

  public get githubAccessToken(): string | undefined {
    return this.props.githubAccessToken;
  }

  public get hasGithubAccessToken(): boolean {
    return Boolean(this.props.githubAccessToken);
  }

  public updateGithubAccessToken(token: string): void {
    this.props.githubAccessToken = token;
    this.props.updatedAt = new Date();
  }

  public clearGithubAccessToken(): void {
    delete this.props.githubAccessToken;
    this.props.updatedAt = new Date();
  }

  public updateSettings(settings: Partial<IUserSettings>): void {
    const currentSettings = this.props.settings ?? { ...this.defaultSettings };

    this.props.settings = {
      ...currentSettings,
      ...settings,
      defaultCardVisibility: {
        ...currentSettings.defaultCardVisibility,
        ...(settings.defaultCardVisibility ?? {}),
      },
    };
    this.props.updatedAt = new Date();
  }

  public upgradeToPro(): void {
    this.props.tier = 'PRO';
    this.props.updatedAt = new Date();
  }

  public downgradeToFree(): void {
    this.props.tier = 'FREE';
    this.props.updatedAt = new Date();
  }

  public toJSON(): IUserProps {
    return {
      id: this.props.id,
      githubId: this.props.githubId,
      username: this.props.username,
      email: this.props.email,
      avatarUrl: this.props.avatarUrl,
      tier: this.props.tier,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      settings: this.settings,
    };
  }
}
