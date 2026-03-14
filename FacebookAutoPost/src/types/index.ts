export interface FacebookGroup {
  id: string;
  name: string;
  picture?: string;
  selected: boolean;
}

export interface PostContent {
  text: string;
  image?: string;
  video?: string;
}

export interface PostSettings {
  delay: number;
  selectedGroups: FacebookGroup[];
  content: PostContent;
}

export interface UserSession {
  accessToken: string;
  userId: string;
  name: string;
}
