import axios from 'axios';

export const getSportPlan = async (userData) => {
  const userPrompt = `
  你是一位专业健身教练，请根据以下用户数据制定为期7天的健身计划：
  ${JSON.stringify(userData, null, 2)}

  要求：
  1. 只返回JSON格式的数据，不要包含任何额外文本
  2. 确保JSON格式正确：所有键名用双引号，字符串值用双引号
  3. 不要使用单引号或特殊符号
  4. 所有数值使用数字类型（不要加引号）
  5. 不要包含注释或解释

  返回JSON格式：
  {
    "plan": [
      {
        "day": "周一",
        "exercises": [
          {
            "name": "动作名称",
            "intensity": "强度描述",
            "sets_reps": "组数/次数",
            "duration": "持续时间",
            "calories": 估算卡路里
          }
        ]
      }
    ]
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
      ],
      max_tokens: 2000
    };

    const response = await axios.post(endpoint, requestBody, {
      headers,
      timeout: 120000
    });

    const aiContent = response.data.choices[0].message.content;
    
    // 清理和修复JSON内容
    let jsonContent = aiContent;
    
    // 尝试提取第一个{到最后一个}之间的内容
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
    }
    
    // 修复常见的JSON格式问题
    jsonContent = jsonContent
      .replace(/'/g, '"')  // 替换单引号为双引号
      .replace(/(\w+):/g, '"$1":')  // 确保键名有引号
      .replace(/,\s*}/g, '}')  // 移除尾随逗号
      .replace(/,\s*]/g, ']');  // 移除数组尾随逗号
    
    // 调试：打印清理前后的内容
    console.log('原始API响应:', aiContent);
    console.log('清理后JSON:', jsonContent);
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('获取健身计划失败:', error);
    
    // 如果是JSON解析错误，打印原始内容以便调试
    if (error instanceof SyntaxError) {
      console.error('JSON解析错误，原始内容:', aiContent);
      throw new Error('健身计划数据格式错误，请重试');
    }
    
    throw new Error('生成健身计划失败，请稍后重试');
  }
};