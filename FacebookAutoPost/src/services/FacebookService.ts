import { UserSession } from '../types';

const FB_APP_ID = 'YOUR_FB_APP_ID';
const REDIRECT_URI = 'https://auth.expo.io/@your-username/facebookautopost';

export const FacebookService = {
  async login(): Promise<UserSession | null> {
    try {
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=public_profile,groups_access_member_info`;
      
      return null;
    } catch (error) {
      console.error('Facebook login error:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
  },

  async getGroups(accessToken: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me/groups?fields=id,name,picture&limit=100&access_token=${accessToken}`
      );
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  },

  async postToGroup(
    groupId: string,
    accessToken: string,
    message: string,
    imageUri?: string,
    videoUri?: string
  ): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('message', message);

      if (imageUri) {
        const imageInfo = await this.getFileInfo(imageUri);
        formData.append('source', {
          uri: imageUri,
          type: imageInfo.type,
          name: imageInfo.name,
        } as any);
      }

      if (videoUri) {
        const videoInfo = await this.getFileInfo(videoUri);
        formData.append('source', {
          uri: videoUri,
          type: videoInfo.type,
          name: videoInfo.name,
        } as any);
      }

      const endpoint = imageUri || videoUri
        ? `https://graph.facebook.com/${groupId}/photos`
        : `https://graph.facebook.com/${groupId}/feed`;

      const response = await fetch(`${endpoint}?access_token=${accessToken}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return !!result.id;
    } catch (error) {
      console.error('Error posting to group:', error);
      return false;
    }
  },

  async getFileInfo(uri: string): Promise<{ type: string; name: string }> {
    const extension = uri.split('.').pop()?.toLowerCase() || '';
    const isVideo = ['mp4', 'mov', 'avi'].includes(extension);
    
    return {
      type: isVideo ? 'video/mp4' : 'image/jpeg',
      name: `file.${extension}`,
    };
  },
};
