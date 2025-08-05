import axios from 'axios';

export const analyzeFoodImage = async (file) => {
  const picPrompt = `
  请分析图片中的食物内容并返回以下JSON格式的数据：
  {
    "food_name": "食物名称",
    "calories": 卡路里数值
  }
  
  要求：
  1. 只返回JSON数据，不要包含任何其他文本
  2. 卡路里数值必须是整数
  3. 如果图片中没有食物或无法识别，返回：
     {"food_name": "未知食物", "calories": 0}
  `;

  try {
    if (!file) throw new Error('未选择文件');
    
    // 将图片转换为base64
    const imageData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });

    const endpoint = "https://api.moonshot.cn/v1/chat/completions";
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_KIMI_API_KEY}`,
      "Content-Type": "application/json",
    };

    const payload = {
      model: 'moonshot-v1-8k-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageData
              }
            },
            {
              type: 'text',
              text: picPrompt
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    };

    const response = await axios.post(endpoint, payload, { headers });
    
    // 从响应中提取JSON内容
    const responseText = response.data.choices[0]?.message?.content || '';
    
    // 尝试提取JSON部分
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('API响应中未找到JSON数据');
    }
    
    const jsonString = responseText.substring(jsonStart, jsonEnd);
    const foodData = JSON.parse(jsonString);
    
    // 返回精简数据，包含原始图片数据
    return {
      food_name: foodData.food_name || "未知食物",
      calories: foodData.calories || 0,
      imageData: imageData // 添加原始图片数据
    };
  } catch (error) {
    console.error('食物分析失败:', error);
    
    let errorMsg = '食物识别失败: ';
    if (error.response) {
      if (error.response.status === 401) {
        errorMsg = 'API密钥无效或过期';
      } else if (error.response.status === 429) {
        errorMsg = '请求过于频繁，请稍后再试';
      } else {
        errorMsg += error.response.data?.error?.message || 
                   `HTTP ${error.response.status}`;
      }
    } else if (error.message) {
      errorMsg += error.message;
    } else {
      errorMsg += '未知错误';
    }
    
    throw new Error(errorMsg);
  }
};

export const getCalories = (event) => {
  return new Promise(async (resolve, reject) => {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        reject(new Error('未选择文件'));
        return;
      }
      
      // 验证文件类型
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        reject(new Error('不支持的图片格式，请使用JPEG、PNG或WebP'));
        return;
      }
      
      // 验证文件大小 (最大5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('图片大小超过5MB限制'));
        return;
      }
      
      const foodData = await analyzeFoodImage(file);
      resolve(foodData);
      
      // 重置文件输入，允许重复选择同一文件
      event.target.value = '';
    } catch (error) {
      reject(error);
    }
  });
};