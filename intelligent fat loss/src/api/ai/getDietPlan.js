import axios from 'axios';

export const getDietPlan = async (userData) => {
  const systemPrompt = `
你是一位专业的营养师。请根据用户数据，制订一个为期7天的饮食计划（周一至周日）。
用户数据：
${JSON.stringify(userData, null, 2)}

要求：
1. 严格使用以下JSON格式返回：
{
  "plan": [
    {
      "day": "周一",
      "diet": {
        "max-calorie": 2000,
        "carbohydrate intake": 250,
        "protein intake": 120,
        "fat intake": 60,
        "sugar intake": 30,
        "Breakfast suggestions": "一份燕麦粥（50g燕麦），一杯牛奶（200ml），一个苹果",
        "Lunch suggestions": "鸡胸肉150g，糙米饭100g，蔬菜沙拉200g",
        "Dinner suggestions": "三文鱼100g，红薯150g，西兰花100g"
      }
    }
  ]
}
2. 数值使用数字类型，字段名务必与格式一致
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
          content: '你是一位专业营养师，需要根据用户数据生成精确的饮食计划'
        },
        {
          role: 'user',
          content: systemPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    };

    const response = await axios.post(endpoint, requestBody, { headers });
    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('API请求失败:', error);
    throw new Error(`饮食计划生成失败: ${error.message}`);
  }
};

