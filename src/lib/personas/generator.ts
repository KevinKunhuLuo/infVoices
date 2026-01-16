/**
 * InfVoices 角色生成器
 * 根据配置的维度和权重生成虚拟角色
 */

import type { Persona, DimensionConfig, WeightConfig } from "@/lib/supabase";
import {
  allDimensions,
  dimensionMap,
  citiesByTier,
  getCitiesByRegionAndTier,
  surnames,
  maleNames,
  femaleNames,
  type DimensionOption,
  type CityInfo,
} from "./dimensions";

// ============================================
// 随机数工具
// ============================================

/**
 * 生成指定范围内的随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机选择一个元素
 */
function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * 根据权重随机选择
 */
function weightedRandomChoice(options: DimensionOption[]): DimensionOption {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let random = Math.random() * totalWeight;

  for (const option of options) {
    random -= option.weight;
    if (random <= 0) {
      return option;
    }
  }

  return options[options.length - 1];
}

// ============================================
// 角色属性生成
// ============================================

/**
 * 生成中文姓名
 */
function generateName(gender: string): string {
  const surname = randomChoice(surnames);
  const names = gender === "male" ? maleNames : femaleNames;
  const givenName = randomChoice(names);
  return surname + givenName;
}

/**
 * 根据年龄段生成具体年龄
 */
function generateAge(ageRange: string): number {
  const ranges: Record<string, [number, number]> = {
    "18-24": [18, 24],
    "25-34": [25, 34],
    "35-44": [35, 44],
    "45-54": [45, 54],
    "55-64": [55, 64],
    "65+": [65, 80],
  };
  const [min, max] = ranges[ageRange] || [25, 35];
  return randomInt(min, max);
}

/**
 * 根据地区和城市线级生成具体城市
 * 确保城市与地区匹配
 */
function generateCity(region: string, cityTier: string): string {
  const matchingCities = getCitiesByRegionAndTier(region, cityTier);
  if (matchingCities.length > 0) {
    return randomChoice(matchingCities).name;
  }
  // 最终fallback到旧逻辑
  const cities = citiesByTier[cityTier] || citiesByTier.tier3;
  return randomChoice(cities);
}

/**
 * 根据收入水平生成具体收入
 */
function generateIncome(incomeLevel: string): number {
  const ranges: Record<string, [number, number]> = {
    low: [2000, 5000],
    medium: [5000, 10000],
    mediumHigh: [10000, 20000],
    high: [20000, 50000],
  };
  const [min, max] = ranges[incomeLevel] || [5000, 10000];
  return Math.round(randomInt(min, max) / 100) * 100; // 取整到百
}

/**
 * 生成人设描述
 */
function generateBiography(persona: Partial<Persona> & { age?: number }): string {
  const templates = [
    `在${persona.city}工作的${persona.occupation}，${persona.familyStatus}，周末喜欢${getHobby()}`,
    `${persona.age}岁的${persona.occupation}，生活在${persona.city}，对${getInterest()}比较关注`,
    `一位来自${persona.region}的${persona.occupation}，${persona.familyStatus}，注重${getLifestyle()}`,
  ];
  return randomChoice(templates);
}

function getHobby(): string {
  const hobbies = [
    "刷短视频", "网购", "追剧", "打游戏", "健身",
    "旅游", "看书", "摄影", "美食", "户外运动",
  ];
  return randomChoice(hobbies);
}

function getInterest(): string {
  const interests = [
    "性价比", "品质生活", "健康养生", "子女教育",
    "职业发展", "理财投资", "时尚潮流", "科技数码",
  ];
  return randomChoice(interests);
}

function getLifestyle(): string {
  const lifestyles = [
    "生活品质", "工作效率", "家庭和睦", "个人成长",
    "身体健康", "社交关系", "精神富足", "财务自由",
  ];
  return randomChoice(lifestyles);
}

// ============================================
// 维度值到标签的映射
// ============================================

const labelMap: Record<string, Record<string, string>> = {
  ageRange: {
    "18-24": "18-24岁",
    "25-34": "25-34岁",
    "35-44": "35-44岁",
    "45-54": "45-54岁",
    "55-64": "55-64岁",
    "65+": "65岁以上",
  },
  gender: {
    male: "男",
    female: "女",
  },
  cityTier: {
    tier1: "一线城市",
    newTier1: "新一线城市",
    tier2: "二线城市",
    tier3: "三线城市",
    tier4plus: "四五线城市",
  },
  incomeLevel: {
    low: "低收入",
    medium: "中等收入",
    mediumHigh: "中高收入",
    high: "高收入",
  },
  education: {
    highSchoolOrBelow: "高中及以下",
    associate: "大专",
    bachelor: "本科",
    graduate: "研究生+",
  },
  occupation: {
    internet: "互联网",
    finance: "金融",
    education: "教育",
    healthcare: "医疗",
    manufacturing: "制造业",
    service: "服务业",
    government: "公务员",
    freelance: "自由职业",
    student: "学生",
    retired: "退休",
  },
  familyStatus: {
    single: "单身",
    couple: "情侣",
    marriedNoKids: "已婚无孩",
    marriedWithKids: "已婚有孩",
    emptyNest: "空巢",
  },
  region: {
    "beijing-tianjin-hebei": "京津冀",
    "yangtze-delta": "长三角",
    "pearl-delta": "珠三角",
    "sichuan-chongqing": "川渝",
    central: "中原",
    northeast: "东北",
    northwest: "西北",
    other: "其他地区",
  },
};

function getLabel(dimensionId: string, value: string): string {
  return labelMap[dimensionId]?.[value] || value;
}

// ============================================
// 核心生成函数
// ============================================

/**
 * 根据配置生成单个角色
 */
export function generatePersona(
  dimensionConfig: DimensionConfig = {},
  weightConfig: WeightConfig = {}
): Persona {
  const selectedValues: Record<string, string> = {};

  // 遍历所有维度，根据配置选择值
  for (const dimension of allDimensions) {
    const dimId = dimension.id;
    const allowedValues = (dimensionConfig as Record<string, string[]>)[dimId];
    const customWeights = weightConfig[dimId];

    // 筛选可用选项
    let options = dimension.options;
    if (allowedValues && allowedValues.length > 0) {
      options = options.filter((opt) => allowedValues.includes(opt.value));
    }

    // 应用自定义权重
    if (customWeights) {
      options = options.map((opt) => ({
        ...opt,
        weight: customWeights[opt.value] ?? opt.weight,
      }));
    }

    // 权重选择
    const selected = weightedRandomChoice(options);
    selectedValues[dimId] = selected.value;
  }

  // 构建角色对象
  const age = generateAge(selectedValues.ageRange);
  const city = generateCity(selectedValues.region, selectedValues.cityTier);
  const income = generateIncome(selectedValues.incomeLevel);

  const persona: Persona = {
    id: crypto.randomUUID(),
    name: generateName(selectedValues.gender),
    ageRange: getLabel("ageRange", selectedValues.ageRange),
    gender: getLabel("gender", selectedValues.gender),
    cityTier: getLabel("cityTier", selectedValues.cityTier),
    city,
    incomeLevel: getLabel("incomeLevel", selectedValues.incomeLevel),
    education: getLabel("education", selectedValues.education),
    occupation: getLabel("occupation", selectedValues.occupation),
    familyStatus: getLabel("familyStatus", selectedValues.familyStatus),
    region: getLabel("region", selectedValues.region),
  };

  // 添加额外属性
  (persona as Persona & { age: number; monthlyIncome: number }).age = age;
  (persona as Persona & { age: number; monthlyIncome: number }).monthlyIncome = income;

  // 生成人设描述
  persona.biography = generateBiography({
    ...persona,
    age,
  } as Partial<Persona>);

  // 生成特点标签
  persona.traits = generateTraits(selectedValues);

  return persona;
}

/**
 * 生成特点标签
 */
function generateTraits(values: Record<string, string>): string[] {
  const traits: string[] = [];

  // 根据年龄添加标签
  if (values.ageRange === "18-24") {
    traits.push("Z世代");
  } else if (values.ageRange === "25-34") {
    traits.push("千禧一代");
  } else if (values.ageRange === "65+") {
    traits.push("银发一族");
  }

  // 根据城市添加标签
  if (values.cityTier === "tier1") {
    traits.push("都市精英");
  } else if (values.cityTier === "tier4plus") {
    traits.push("小镇居民");
  }

  // 根据家庭状态添加标签
  if (values.familyStatus === "marriedWithKids") {
    traits.push("家有子女");
  } else if (values.familyStatus === "single") {
    traits.push("单身贵族");
  }

  // 根据收入添加标签
  if (values.incomeLevel === "high") {
    traits.push("高消费力");
  } else if (values.incomeLevel === "low") {
    traits.push("价格敏感");
  }

  // 随机添加一些通用标签
  const commonTraits = [
    "理性消费", "冲动购买", "品牌忠诚", "尝鲜一族",
    "口碑依赖", "颜值控", "实用主义", "社交达人",
  ];
  traits.push(randomChoice(commonTraits));

  return traits.slice(0, 4); // 最多4个标签
}

/**
 * 批量生成角色
 */
export function generatePersonas(
  count: number,
  dimensionConfig: DimensionConfig = {},
  weightConfig: WeightConfig = {}
): Persona[] {
  const personas: Persona[] = [];
  for (let i = 0; i < count; i++) {
    personas.push(generatePersona(dimensionConfig, weightConfig));
  }
  return personas;
}

/**
 * 根据置信度计算所需样本量
 * @param confidenceLevel 置信度 (0.90, 0.95, 0.99)
 * @param marginOfError 误差范围 (0.01 - 0.10)
 * @returns 所需样本量
 */
export function calculateSampleSize(
  confidenceLevel: number = 0.95,
  marginOfError: number = 0.05
): number {
  // Z-score 对应表
  const zScores: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };

  const z = zScores[confidenceLevel] || 1.96;
  const p = 0.5; // 最大方差情况

  // 样本量公式: n = (Z^2 * p * (1-p)) / E^2
  const n = (z * z * p * (1 - p)) / (marginOfError * marginOfError);

  return Math.ceil(n);
}
