/**
 * InfVoices 维度条件概率配置
 *
 * 定义维度之间的依赖关系，确保生成的角色在人口统计学上合理
 *
 * 数据来源说明：
 * ✓ 有依据：基于第七次全国人口普查（2020年）或国家统计局数据
 * ~ 部分依据：基于统计数据推算
 * ○ 估算：基于常识和行业经验估算
 */

// ============================================
// 维度生成顺序（按依赖关系排序）
// ============================================

/**
 * 维度生成顺序：
 * 1. 性别 - 独立维度
 * 2. 年龄段 - 独立维度
 * 3. 地区 - 独立维度
 * 4. 城市线级 - 依赖地区
 * 5. 学历 - 依赖年龄
 * 6. 职业 - 依赖年龄、学历
 * 7. 收入 - 依赖城市线级、学历、职业
 * 8. 家庭状态 - 依赖年龄
 */
export const dimensionGenerationOrder = [
  "gender",      // 独立
  "ageRange",    // 独立
  "region",      // 独立
  "cityTier",    // 可独立（已有地区匹配）
  "education",   // 依赖年龄
  "occupation",  // 依赖年龄、学历
  "incomeLevel", // 依赖城市、学历、职业
  "familyStatus", // 依赖年龄
] as const;

// ============================================
// 年龄 → 家庭状态 条件概率
// ============================================

/**
 * 年龄段对家庭状态的影响
 * 数据来源：~ 部分依据（基于民政部婚姻登记数据和人口普查推算）
 */
export const ageToFamilyStatus: Record<string, Record<string, number>> = {
  "18-24": {
    single: 0.75,        // 大部分未婚
    couple: 0.20,        // 有对象但未婚
    marriedNoKids: 0.04, // 极少数早婚
    marriedWithKids: 0.01, // 非常少
    emptyNest: 0,        // 不可能
  },
  "25-34": {
    single: 0.35,
    couple: 0.15,
    marriedNoKids: 0.15,
    marriedWithKids: 0.35,
    emptyNest: 0,
  },
  "35-44": {
    single: 0.08,
    couple: 0.02,
    marriedNoKids: 0.05,
    marriedWithKids: 0.82,
    emptyNest: 0.03,
  },
  "45-54": {
    single: 0.06,
    couple: 0,
    marriedNoKids: 0.04,
    marriedWithKids: 0.65,
    emptyNest: 0.25,
  },
  "55-64": {
    single: 0.08,
    couple: 0,
    marriedNoKids: 0.02,
    marriedWithKids: 0.30,
    emptyNest: 0.60,
  },
  "65+": {
    single: 0.15,        // 丧偶等
    couple: 0,
    marriedNoKids: 0,
    marriedWithKids: 0.10,
    emptyNest: 0.75,
  },
};

// ============================================
// 年龄 → 职业 条件概率
// ============================================

/**
 * 年龄段对职业的影响
 * 数据来源：~ 部分依据（基于劳动力调查数据推算）
 */
export const ageToOccupation: Record<string, Record<string, number>> = {
  "18-24": {
    internet: 0.08,
    finance: 0.02,
    education: 0.03,
    healthcare: 0.02,
    manufacturing: 0.12,
    service: 0.18,
    government: 0.02,
    freelance: 0.05,
    student: 0.45,      // 大部分是学生
    retired: 0,
  },
  "25-34": {
    internet: 0.15,
    finance: 0.08,
    education: 0.10,
    healthcare: 0.07,
    manufacturing: 0.18,
    service: 0.20,
    government: 0.08,
    freelance: 0.10,
    student: 0.04,      // 研究生等
    retired: 0,
  },
  "35-44": {
    internet: 0.12,
    finance: 0.07,
    education: 0.12,
    healthcare: 0.08,
    manufacturing: 0.18,
    service: 0.18,
    government: 0.12,
    freelance: 0.10,
    student: 0.01,
    retired: 0.02,
  },
  "45-54": {
    internet: 0.05,
    finance: 0.05,
    education: 0.10,
    healthcare: 0.08,
    manufacturing: 0.20,
    service: 0.18,
    government: 0.12,
    freelance: 0.08,
    student: 0,
    retired: 0.14,
  },
  "55-64": {
    internet: 0.02,
    finance: 0.02,
    education: 0.06,
    healthcare: 0.05,
    manufacturing: 0.12,
    service: 0.12,
    government: 0.08,
    freelance: 0.08,
    student: 0,
    retired: 0.45,
  },
  "65+": {
    internet: 0,
    finance: 0,
    education: 0.01,
    healthcare: 0.01,
    manufacturing: 0.02,
    service: 0.03,
    government: 0.01,
    freelance: 0.02,
    student: 0,
    retired: 0.90,
  },
};

// ============================================
// 年龄 → 学历 条件概率
// ============================================

/**
 * 年龄段对学历的影响
 * 数据来源：✓ 有依据（第七次人口普查各年龄段受教育程度数据）
 *
 * 说明：老年人受教育程度普遍较低是历史原因
 */
export const ageToEducation: Record<string, Record<string, number>> = {
  "18-24": {
    highSchoolOrBelow: 0.45, // 部分还在读高中或中专
    associate: 0.18,
    bachelor: 0.32,
    graduate: 0.05,
  },
  "25-34": {
    highSchoolOrBelow: 0.35,
    associate: 0.18,
    bachelor: 0.38,
    graduate: 0.09,
  },
  "35-44": {
    highSchoolOrBelow: 0.48,
    associate: 0.18,
    bachelor: 0.28,
    graduate: 0.06,
  },
  "45-54": {
    highSchoolOrBelow: 0.62,
    associate: 0.16,
    bachelor: 0.18,
    graduate: 0.04,
  },
  "55-64": {
    highSchoolOrBelow: 0.75,
    associate: 0.12,
    bachelor: 0.11,
    graduate: 0.02,
  },
  "65+": {
    highSchoolOrBelow: 0.88,
    associate: 0.06,
    bachelor: 0.05,
    graduate: 0.01,
  },
};

// ============================================
// 城市线级 → 收入 条件概率
// ============================================

/**
 * 城市线级对收入的影响
 * 数据来源：~ 部分依据（基于各城市平均工资数据推算）
 */
export const cityTierToIncome: Record<string, Record<string, number>> = {
  tier1: {
    low: 0.15,
    medium: 0.30,
    mediumHigh: 0.35,
    high: 0.20,
  },
  newTier1: {
    low: 0.25,
    medium: 0.35,
    mediumHigh: 0.28,
    high: 0.12,
  },
  tier2: {
    low: 0.35,
    medium: 0.38,
    mediumHigh: 0.20,
    high: 0.07,
  },
  tier3: {
    low: 0.48,
    medium: 0.35,
    mediumHigh: 0.13,
    high: 0.04,
  },
  tier4plus: {
    low: 0.60,
    medium: 0.30,
    mediumHigh: 0.08,
    high: 0.02,
  },
};

// ============================================
// 学历 → 职业 条件概率修正
// ============================================

/**
 * 学历对职业的影响（作为修正因子）
 * 数据来源：○ 估算（基于行业入职门槛常识）
 *
 * 用法：与年龄→职业的概率相乘后归一化
 */
export const educationOccupationModifier: Record<string, Record<string, number>> = {
  highSchoolOrBelow: {
    internet: 0.3,      // 门槛较高
    finance: 0.2,       // 门槛很高
    education: 0.3,     // 需要学历
    healthcare: 0.4,    // 部分岗位可以
    manufacturing: 1.2, // 主力
    service: 1.3,       // 主力
    government: 0.1,    // 几乎不可能
    freelance: 0.8,
    student: 0.5,
    retired: 1.0,
  },
  associate: {
    internet: 0.7,
    finance: 0.5,
    education: 0.8,
    healthcare: 0.9,
    manufacturing: 1.1,
    service: 1.0,
    government: 0.6,
    freelance: 1.0,
    student: 0.8,
    retired: 1.0,
  },
  bachelor: {
    internet: 1.3,
    finance: 1.2,
    education: 1.3,
    healthcare: 1.2,
    manufacturing: 0.8,
    service: 0.7,
    government: 1.3,
    freelance: 1.1,
    student: 1.2,
    retired: 1.0,
  },
  graduate: {
    internet: 1.5,
    finance: 1.5,
    education: 1.4,
    healthcare: 1.5,
    manufacturing: 0.6,
    service: 0.4,
    government: 1.4,
    freelance: 1.2,
    student: 1.5,  // 研究生
    retired: 1.0,
  },
};

// ============================================
// 职业 → 收入 条件概率修正
// ============================================

/**
 * 职业对收入的影响（作为修正因子）
 * 数据来源：~ 部分依据（基于行业薪资报告）
 */
export const occupationIncomeModifier: Record<string, Record<string, number>> = {
  internet: {
    low: 0.4,
    medium: 0.8,
    mediumHigh: 1.5,
    high: 2.0,
  },
  finance: {
    low: 0.3,
    medium: 0.7,
    mediumHigh: 1.5,
    high: 2.5,
  },
  education: {
    low: 0.6,
    medium: 1.2,
    mediumHigh: 1.0,
    high: 0.5,
  },
  healthcare: {
    low: 0.5,
    medium: 1.0,
    mediumHigh: 1.3,
    high: 1.2,
  },
  manufacturing: {
    low: 1.2,
    medium: 1.1,
    mediumHigh: 0.7,
    high: 0.3,
  },
  service: {
    low: 1.4,
    medium: 1.0,
    mediumHigh: 0.5,
    high: 0.2,
  },
  government: {
    low: 0.4,
    medium: 1.3,
    mediumHigh: 1.2,
    high: 0.4,
  },
  freelance: {
    low: 0.9,
    medium: 0.9,
    mediumHigh: 1.1,
    high: 1.3,
  },
  student: {
    low: 2.0,      // 学生基本无收入或低收入
    medium: 0.3,
    mediumHigh: 0.1,
    high: 0,
  },
  retired: {
    low: 1.5,
    medium: 0.9,
    mediumHigh: 0.4,
    high: 0.1,
  },
};

// ============================================
// 数据来源注释汇总
// ============================================

export const dataSourceNotes = {
  gender: {
    source: "第七次全国人口普查（2020年）",
    confidence: "high" as const,
    note: "男性51.24%，女性48.76%，直接采用普查数据",
  },
  ageRange: {
    source: "第七次全国人口普查（2020年）",
    confidence: "high" as const,
    note: "基于普查的各年龄段人口比例，18岁以下未纳入",
  },
  cityTier: {
    source: "国家统计局城镇化数据 + 第一财经城市分级",
    confidence: "medium" as const,
    note: "城市分级标准采用第一财经，人口分布为估算",
  },
  region: {
    source: "第七次全国人口普查（2020年）",
    confidence: "medium" as const,
    note: "按省份人口汇总到文化区域，存在边界模糊",
  },
  education: {
    source: "第七次全国人口普查（2020年）",
    confidence: "high" as const,
    note: "基于普查的受教育程度数据，按年龄段有条件分布",
  },
  incomeLevel: {
    source: "国家统计局居民收入数据 + 各城市平均工资",
    confidence: "medium" as const,
    note: "收入区间和分布为估算，按城市线级有条件分布",
  },
  occupation: {
    source: "国家统计局就业人员行业分布 + 估算",
    confidence: "low" as const,
    note: "行业分类有简化，按年龄和学历有条件分布",
  },
  familyStatus: {
    source: "民政部婚姻登记数据 + 估算",
    confidence: "medium" as const,
    note: "按年龄段有显著不同，基于登记数据推算",
  },
};

// ============================================
// 辅助函数
// ============================================

/**
 * 根据条件概率表选择一个值
 */
export function selectByConditionalProbability(
  probabilities: Record<string, number>,
  allowedValues?: string[]
): string {
  // 筛选允许的值
  let filteredProbs = probabilities;
  if (allowedValues && allowedValues.length > 0) {
    filteredProbs = {};
    for (const value of allowedValues) {
      if (probabilities[value] !== undefined) {
        filteredProbs[value] = probabilities[value];
      }
    }
  }

  // 归一化
  const entries = Object.entries(filteredProbs).filter(([_, p]) => p > 0);
  const total = entries.reduce((sum, [_, p]) => sum + p, 0);

  if (total === 0 || entries.length === 0) {
    // 回退到均匀分布
    const keys = allowedValues || Object.keys(probabilities);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  // 加权随机选择
  let random = Math.random() * total;
  for (const [value, prob] of entries) {
    random -= prob;
    if (random <= 0) {
      return value;
    }
  }

  return entries[entries.length - 1][0];
}

/**
 * 合并多个条件概率（相乘后归一化）
 */
export function combineConditionalProbabilities(
  ...probabilityMaps: Record<string, number>[]
): Record<string, number> {
  if (probabilityMaps.length === 0) return {};
  if (probabilityMaps.length === 1) return probabilityMaps[0];

  const combined: Record<string, number> = {};
  const allKeys = new Set<string>();

  for (const map of probabilityMaps) {
    Object.keys(map).forEach(k => allKeys.add(k));
  }

  for (const key of allKeys) {
    let product = 1;
    for (const map of probabilityMaps) {
      product *= map[key] ?? 0;
    }
    combined[key] = product;
  }

  // 归一化
  const total = Object.values(combined).reduce((sum, p) => sum + p, 0);
  if (total > 0) {
    for (const key of Object.keys(combined)) {
      combined[key] /= total;
    }
  }

  return combined;
}

/**
 * 计算角色的人群占比（基于联合概率）
 *
 * 由于维度间有条件依赖，精确计算联合概率较复杂
 * 这里提供一个近似估算
 */
export function estimatePopulationShare(
  selectedValues: Record<string, string>,
  baseProbabilities: Record<string, Record<string, number>>
): number {
  let share = 1;

  // 独立维度直接相乘
  const independentDims = ["gender", "ageRange", "region"];
  for (const dim of independentDims) {
    const value = selectedValues[dim];
    const probs = baseProbabilities[dim];
    if (probs && value) {
      share *= probs[value] || 0;
    }
  }

  // 条件维度使用条件概率
  const ageRange = selectedValues.ageRange;
  const cityTier = selectedValues.cityTier;
  const education = selectedValues.education;
  const occupation = selectedValues.occupation;

  // 城市线级
  if (selectedValues.cityTier && baseProbabilities.cityTier) {
    share *= baseProbabilities.cityTier[selectedValues.cityTier] || 0;
  }

  // 学历（条件于年龄）
  if (education && ageRange && ageToEducation[ageRange]) {
    share *= ageToEducation[ageRange][education] || 0;
  }

  // 职业（条件于年龄）
  if (occupation && ageRange && ageToOccupation[ageRange]) {
    share *= ageToOccupation[ageRange][occupation] || 0;
  }

  // 收入（条件于城市）
  if (selectedValues.incomeLevel && cityTier && cityTierToIncome[cityTier]) {
    share *= cityTierToIncome[cityTier][selectedValues.incomeLevel] || 0;
  }

  // 家庭状态（条件于年龄）
  if (selectedValues.familyStatus && ageRange && ageToFamilyStatus[ageRange]) {
    share *= ageToFamilyStatus[ageRange][selectedValues.familyStatus] || 0;
  }

  return share;
}

/**
 * 将人群占比格式化为可读字符串
 */
export function formatPopulationShare(share: number): string {
  if (share >= 0.01) {
    return `${(share * 100).toFixed(1)}%`;
  } else if (share >= 0.001) {
    return `${(share * 100).toFixed(2)}%`;
  } else if (share >= 0.0001) {
    return `约${Math.round(share * 10000)}/万`;
  } else {
    return `<0.01%`;
  }
}
