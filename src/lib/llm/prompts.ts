/**
 * InfVoices 提示词模板
 *
 * 用于生成基于角色的调研回答
 */

import type { Persona } from "@/lib/supabase";
import type { SurveyQuestion } from "@/lib/survey";

/**
 * 生成角色系统提示词
 */
export function generatePersonaSystemPrompt(persona: Persona): string {
  return `你是一个虚拟调研受访者，需要完全代入以下角色身份来回答问卷问题。

## 你的角色身份

**基本信息**
- 姓名：${persona.name}
- 性别：${persona.gender}
- 年龄段：${persona.ageRange}
- 所在城市：${persona.city || "未知"}（${persona.cityTier}）
- 地区：${persona.region}

**社会经济特征**
- 职业：${persona.occupation}
- 学历：${persona.education}
- 收入水平：${persona.incomeLevel}
- 家庭状态：${persona.familyStatus}

${persona.biography ? `**个人简介**\n${persona.biography}` : ""}

${persona.traits && persona.traits.length > 0 ? `**性格特点**\n${persona.traits.join("、")}` : ""}

## 回答要求

1. **完全代入角色**：你的所有回答必须符合上述角色的背景、价值观和生活经验
2. **真实自然**：回答应该像真实的人在回答问卷，有个人偏好和主观判断
3. **逻辑一致**：回答之间要保持逻辑一致性，符合角色设定
4. **适度详细**：开放题需要给出有意义的回答，但不需要过于冗长
5. **格式规范**：严格按照指定的 JSON 格式输出

## 输出格式

对于每道题目，你需要返回以下 JSON 格式的回答：

\`\`\`json
{
  "answers": [
    {
      "questionId": "题目ID",
      "questionType": "题型",
      "answer": "你的回答（格式根据题型而定）",
      "reasoning": "简短说明为什么这样回答（1-2句话）",
      "confidence": 0.8  // 0-1之间的置信度
    }
  ]
}
\`\`\`

### 不同题型的 answer 格式

- **单选题 (single_choice)**：选项的 value 值，如 "option_1"
- **多选题 (multiple_choice)**：选项 value 值的数组，如 ["option_1", "option_3"]
- **量表题 (scale)**：数字，如 4
- **开放文本 (open_text)**：文字回答字符串
- **图片对比 (image_compare)**：选中图片的标识，如 "image_0"。注意：你只能看到图片的文字描述，请根据描述做出符合你角色特征的选择
- **概念测试 (concept_test)**：各维度评分的对象，如 {"dim1": 4, "dim2": 3}`;
}

/**
 * 生成问卷问题提示词
 */
export function generateQuestionsPrompt(questions: SurveyQuestion[]): string {
  const questionsText = questions
    .map((q, index) => formatQuestion(q, index + 1))
    .join("\n\n");

  return `请以你的角色身份回答以下问卷问题：

${questionsText}

请按照系统提示中的 JSON 格式返回你的回答。确保回答的 questionId 与题目 ID 对应。`;
}

/**
 * 格式化单个问题
 */
function formatQuestion(question: SurveyQuestion, index: number): string {
  let text = `### 第 ${index} 题 (ID: ${question.id})
**类型**：${getQuestionTypeName(question.type)}
**题目**：${question.title}`;

  if (question.description) {
    text += `\n**说明**：${question.description}`;
  }

  if (question.required) {
    text += `\n**必答题**`;
  }

  // 根据题型添加选项/配置信息
  switch (question.type) {
    case "single_choice":
    case "multiple_choice":
      if (question.options && question.options.length > 0) {
        text += `\n**选项**：`;
        question.options.forEach((opt) => {
          text += `\n  - ${opt.value}: ${opt.label}`;
        });
      }
      break;

    case "scale":
      if (question.scaleConfig) {
        const { min, max, minLabel, maxLabel } = question.scaleConfig;
        text += `\n**评分范围**：${min} - ${max}`;
        if (minLabel) text += ` (${min}=${minLabel}`;
        if (maxLabel) text += `, ${max}=${maxLabel})`;
      }
      break;

    case "image_compare":
      if (question.images && question.images.length > 0) {
        text += `\n**图片选项**：`;
        question.images.forEach((img, i) => {
          text += `\n  - image_${i}: ${img.caption || `图片 ${i + 1}`}`;
        });
      }
      break;

    case "concept_test":
      if (question.conceptConfig) {
        if (question.conceptConfig.conceptDescription) {
          text += `\n**概念描述**：${question.conceptConfig.conceptDescription}`;
        }
        if (question.conceptConfig.dimensions.length > 0) {
          text += `\n**评估维度**：`;
          question.conceptConfig.dimensions.forEach((dim) => {
            const scale = dim.scaleConfig || { min: 1, max: 5 };
            text += `\n  - ${dim.id}: ${dim.name} (${scale.min}-${scale.max})`;
          });
        }
      }
      break;
  }

  return text;
}

/**
 * 获取题型中文名称
 */
function getQuestionTypeName(type: string): string {
  const names: Record<string, string> = {
    single_choice: "单选题",
    multiple_choice: "多选题",
    scale: "量表题",
    open_text: "开放文本",
    image_compare: "图片对比",
    concept_test: "概念测试",
  };
  return names[type] || type;
}

/**
 * 解析 LLM 响应中的 JSON
 */
export function parseAnswersFromResponse(response: string): {
  answers: Array<{
    questionId: string;
    questionType: string;
    answer: unknown;
    reasoning: string;
    confidence: number;
  }>;
} | null {
  try {
    // 尝试提取 JSON 块
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // 尝试直接解析
    const startIndex = response.indexOf("{");
    const endIndex = response.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonStr = response.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr);
    }

    return null;
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    return null;
  }
}

/**
 * 生成批量调研的完整提示词
 */
export function generateSurveyPrompt(
  persona: Persona,
  questions: SurveyQuestion[]
): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: generatePersonaSystemPrompt(persona),
    userPrompt: generateQuestionsPrompt(questions),
  };
}
