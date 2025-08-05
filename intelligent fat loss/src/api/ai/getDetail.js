import axios from 'axios';

export const getDetail = async (actionName) => {
  const prompts = `
  你是一位专业的健身教练，可以根据用户提供的动作，提供该动作的动作详细信息。
  用户动作：${actionName}

  要求：
  1. 严格使用以下JSON格式返回：
  {
    "action_name": "动作名称",
    "description": "做该动作的动作详细细节描述",
    "muscles": "主要锻炼的肌肉群",
    "difficulty": "难度级别（初级/中级/高级）",
    "equipment": "所需器械",
    "common_mistakes": "常见错误",
    "safety_tips": "安全提示"
  }
  2. 描述要详细专业，包含动作步骤、呼吸方法、注意事项等
  3. 不要输出多余的解释说明
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
          role: 'system',
          content: '你是一位健身教练，需要根据动作名称提供该动作的详细信息和指导'
        },
        {
          role: 'user',
          content: prompts
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    const response = await axios.post(endpoint, requestBody, { headers });
    const content = response.data.choices[0].message.content;
    
    // 添加JSON解析错误处理
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('动作详情JSON解析错误:', content);
      throw new Error('动作详情数据格式错误');
    }
  } catch (error) {
    console.error('获取动作详情失败:', error);
    throw new Error(`动作详情生成失败: ${error.message}`);
  }
};