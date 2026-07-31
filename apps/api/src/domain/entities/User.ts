export interface IUserSettings {
  preferredTheme: string;
  defaultCardStyle: string;
  languageSorting: string;
  defaultCardVisibility: {
    profile: boolean;
    stats: boolean;
    languages: boolean;
    streak: boolean;
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
      ...this.props,
      settings: this.settings,
    };
  }
}
