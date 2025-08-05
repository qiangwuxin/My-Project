import axios from 'axios';
import { getPicFromText } from './getPicFromText';

export const getCaloriesFromText = async (text) => {
  const userPrompt = `
  请分析以下食物描述，返回食物的名称和热量值：
  "${text}"

  要求：
  1. 只返回JSON格式的数据
  2. JSON结构如下：
  {
    "food_name": "识别出的食物名称",
    "calories": 热量数值
  }
  `;

  try {
    const endpoint = '/arkapi/api/v3/chat/completions'; 
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_BD_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const requestBody = {
      model: 'doubao-seed-1.6-250615',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt
            }
          ]
        }
      ]
    };

    const response = await axios.post(endpoint, requestBody, { headers });
    const aiContent = response.data.choices[0].message.content;
    const foodData = JSON.parse(aiContent);
    
    // 获取食物图片
    try {
      const imageUrl = await getPicFromText(foodData.food_name);
      return {
        ...foodData,
        imageUrl
      };
    } catch (imageError) {
      console.error('获取食物图片失败:', imageError);
      return foodData; // 即使图片获取失败也返回食物数据
    }
  } catch (error) {
    console.error('获取热量失败:', error);
    throw new Error('分析食物热量失败，请稍后重试');
  }
};