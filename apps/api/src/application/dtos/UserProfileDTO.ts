export interface IUserProfileResponse {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string;
  tier: 'FREE' | 'PRO';
  createdAt: string;
}
