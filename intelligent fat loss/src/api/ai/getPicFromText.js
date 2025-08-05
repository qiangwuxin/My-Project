import axios from 'axios';

export const getPicFromText = async (text) => {
  try {
    const endpoint = '/arkapi/api/v3/images/generations';
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_ARK_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const requestBody = {
      model: 'doubao-1-5-pro-32k-250115',
      prompt: `请根据以下文本生成图片："${text}"`,
      response_format: 'url',
      size: '1024x1024',
      n: 1
    };

    const response = await axios.post(endpoint, requestBody, { headers });
    return response.data.data[0].url;
  } catch (error) {
    console.error('获取图片失败:', error);
    const errorMsg = error.response?.data?.error?.message || error.message;
    throw new Error(`生成图片失败: ${errorMsg}`);
  }
};

