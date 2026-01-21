/**
 * InfVoices 人口维度配置
 *
 * 数据来源与可信度说明：
 * ✓ 高可信度：直接来源于第七次全国人口普查（2020年）
 * ~ 中等可信度：基于统计局数据推算
 * ○ 低可信度：基于行业经验估算
 *
 * 各维度数据来源：
 * - 性别分布：✓ 第七次全国人口普查（男51.24%，女48.76%）
 * - 年龄分布：✓ 第七次全国人口普查（按年龄段汇总，不含18岁以下）
 * - 城市线级：~ 国家统计局城镇化数据 + 第一财经城市分级标准
 * - 地区分布：~ 第七次全国人口普查按省份汇总到文化区域
 * - 学历分布：✓ 第七次全国人口普查受教育程度数据，按年龄有条件分布
 * - 收入分布：~ 国家统计局居民收入数据，按城市线级有条件分布
 * - 职业分布：○ 劳动力调查数据简化，按年龄和学历有条件分布
 * - 家庭状态：~ 民政部婚姻登记数据推算，按年龄有条件分布
 */

// ============================================
// 维度定义
// ============================================

export interface DimensionOption {
  value: string;
  label: string;
  weight: number; // 人口比例权重 (0-1)
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  options: DimensionOption[];
}

// ============================================
// 年龄段
// ============================================

export const ageRangeDimension: Dimension = {
  id: "ageRange",
  name: "年龄段",
  description: "按年龄段划分的人口分布",
  options: [
    { value: "18-24", label: "18-24岁", weight: 0.09 },
    { value: "25-34", label: "25-34岁", weight: 0.15 },
    { value: "35-44", label: "35-44岁", weight: 0.16 },
    { value: "45-54", label: "45-54岁", weight: 0.17 },
    { value: "55-64", label: "55-64岁", weight: 0.14 },
    { value: "65+", label: "65岁以上", weight: 0.14 },
  ],
};

// ============================================
// 性别
// ============================================

export const genderDimension: Dimension = {
  id: "gender",
  name: "性别",
  description: "性别分布",
  options: [
    { value: "male", label: "男", weight: 0.512 },
    { value: "female", label: "女", weight: 0.488 },
  ],
};

// ============================================
// 城市线级
// ============================================

export const cityTierDimension: Dimension = {
  id: "cityTier",
  name: "城市线级",
  description: "按城市发展水平划分",
  options: [
    { value: "tier1", label: "一线城市", weight: 0.06 },
    { value: "newTier1", label: "新一线城市", weight: 0.12 },
    { value: "tier2", label: "二线城市", weight: 0.15 },
    { value: "tier3", label: "三线城市", weight: 0.22 },
    { value: "tier4plus", label: "四五线及以下", weight: 0.45 },
  ],
};

// ============================================
// 收入水平
// ============================================

export const incomeLevelDimension: Dimension = {
  id: "incomeLevel",
  name: "收入水平",
  description: "月收入水平分布",
  options: [
    { value: "low", label: "低收入（<5000元）", weight: 0.42 },
    { value: "medium", label: "中等收入（5000-10000元）", weight: 0.32 },
    { value: "mediumHigh", label: "中高收入（10000-20000元）", weight: 0.18 },
    { value: "high", label: "高收入（>20000元）", weight: 0.08 },
  ],
};

// ============================================
// 学历
// ============================================

export const educationDimension: Dimension = {
  id: "education",
  name: "学历",
  description: "最高学历分布",
  options: [
    { value: "highSchoolOrBelow", label: "高中及以下", weight: 0.58 },
    { value: "associate", label: "大专", weight: 0.15 },
    { value: "bachelor", label: "本科", weight: 0.22 },
    { value: "graduate", label: "研究生及以上", weight: 0.05 },
  ],
};

// ============================================
// 职业类型
// ============================================

export const occupationDimension: Dimension = {
  id: "occupation",
  name: "职业类型",
  description: "主要职业类型分布",
  options: [
    { value: "internet", label: "互联网/IT", weight: 0.08 },
    { value: "finance", label: "金融", weight: 0.05 },
    { value: "education", label: "教育", weight: 0.08 },
    { value: "healthcare", label: "医疗健康", weight: 0.06 },
    { value: "manufacturing", label: "制造业", weight: 0.15 },
    { value: "service", label: "服务业", weight: 0.18 },
    { value: "government", label: "公务员/事业单位", weight: 0.08 },
    { value: "freelance", label: "自由职业", weight: 0.07 },
    { value: "student", label: "学生", weight: 0.12 },
    { value: "retired", label: "退休", weight: 0.13 },
  ],
};

// ============================================
// 家庭结构
// ============================================

export const familyStatusDimension: Dimension = {
  id: "familyStatus",
  name: "家庭结构",
  description: "家庭状态分布",
  options: [
    { value: "single", label: "单身", weight: 0.25 },
    { value: "couple", label: "情侣/新婚无孩", weight: 0.12 },
    { value: "marriedNoKids", label: "已婚无孩", weight: 0.08 },
    { value: "marriedWithKids", label: "已婚有孩", weight: 0.40 },
    { value: "emptyNest", label: "空巢/独居老人", weight: 0.15 },
  ],
};

// ============================================
// 地域文化圈
// ============================================

export const regionDimension: Dimension = {
  id: "region",
  name: "地域文化圈",
  description: "按地域文化特征划分",
  options: [
    { value: "beijing-tianjin-hebei", label: "京津冀", weight: 0.08 },
    { value: "yangtze-delta", label: "长三角", weight: 0.12 },
    { value: "pearl-delta", label: "珠三角", weight: 0.09 },
    { value: "sichuan-chongqing", label: "川渝", weight: 0.10 },
    { value: "central", label: "中原", weight: 0.18 },
    { value: "northeast", label: "东北", weight: 0.08 },
    { value: "northwest", label: "西北", weight: 0.07 },
    { value: "other", label: "其他地区", weight: 0.28 },
  ],
};

// ============================================
// 所有维度集合
// ============================================

export const allDimensions: Dimension[] = [
  ageRangeDimension,
  genderDimension,
  cityTierDimension,
  incomeLevelDimension,
  educationDimension,
  occupationDimension,
  familyStatusDimension,
  regionDimension,
];

// 维度 ID 到维度的映射
export const dimensionMap = new Map<string, Dimension>(
  allDimensions.map((d) => [d.id, d])
);

// ============================================
// 城市数据（按地区和线级组织）
// ============================================

// 城市到地区的映射
export interface CityInfo {
  name: string;
  tier: string;
  region: string;
}

// 按地区组织的城市数据
export const citiesByRegion: Record<string, CityInfo[]> = {
  "beijing-tianjin-hebei": [
    { name: "北京", tier: "tier1", region: "beijing-tianjin-hebei" },
    { name: "天津", tier: "newTier1", region: "beijing-tianjin-hebei" },
    { name: "石家庄", tier: "tier2", region: "beijing-tianjin-hebei" },
    { name: "保定", tier: "tier3", region: "beijing-tianjin-hebei" },
    { name: "邯郸", tier: "tier4plus", region: "beijing-tianjin-hebei" },
    { name: "唐山", tier: "tier3", region: "beijing-tianjin-hebei" },
    { name: "廊坊", tier: "tier4plus", region: "beijing-tianjin-hebei" },
  ],
  "yangtze-delta": [
    { name: "上海", tier: "tier1", region: "yangtze-delta" },
    { name: "杭州", tier: "newTier1", region: "yangtze-delta" },
    { name: "南京", tier: "newTier1", region: "yangtze-delta" },
    { name: "苏州", tier: "newTier1", region: "yangtze-delta" },
    { name: "宁波", tier: "newTier1", region: "yangtze-delta" },
    { name: "无锡", tier: "tier2", region: "yangtze-delta" },
    { name: "合肥", tier: "tier2", region: "yangtze-delta" },
    { name: "温州", tier: "tier2", region: "yangtze-delta" },
    { name: "金华", tier: "tier3", region: "yangtze-delta" },
    { name: "台州", tier: "tier3", region: "yangtze-delta" },
    { name: "绍兴", tier: "tier3", region: "yangtze-delta" },
    { name: "嘉兴", tier: "tier3", region: "yangtze-delta" },
    { name: "南通", tier: "tier3", region: "yangtze-delta" },
    { name: "扬州", tier: "tier3", region: "yangtze-delta" },
    { name: "徐州", tier: "tier3", region: "yangtze-delta" },
    { name: "盐城", tier: "tier4plus", region: "yangtze-delta" },
    { name: "芜湖", tier: "tier4plus", region: "yangtze-delta" },
  ],
  "pearl-delta": [
    { name: "广州", tier: "tier1", region: "pearl-delta" },
    { name: "深圳", tier: "tier1", region: "pearl-delta" },
    { name: "东莞", tier: "newTier1", region: "pearl-delta" },
    { name: "佛山", tier: "newTier1", region: "pearl-delta" },
    { name: "厦门", tier: "tier2", region: "pearl-delta" },
    { name: "福州", tier: "tier2", region: "pearl-delta" },
    { name: "泉州", tier: "tier2", region: "pearl-delta" },
    { name: "珠海", tier: "tier3", region: "pearl-delta" },
    { name: "惠州", tier: "tier3", region: "pearl-delta" },
    { name: "中山", tier: "tier3", region: "pearl-delta" },
    { name: "漳州", tier: "tier4plus", region: "pearl-delta" },
    { name: "湛江", tier: "tier4plus", region: "pearl-delta" },
  ],
  "sichuan-chongqing": [
    { name: "成都", tier: "newTier1", region: "sichuan-chongqing" },
    { name: "重庆", tier: "newTier1", region: "sichuan-chongqing" },
    { name: "贵阳", tier: "tier2", region: "sichuan-chongqing" },
    { name: "昆明", tier: "tier2", region: "sichuan-chongqing" },
    { name: "绵阳", tier: "tier3", region: "sichuan-chongqing" },
    { name: "宜宾", tier: "tier4plus", region: "sichuan-chongqing" },
    { name: "曲靖", tier: "tier4plus", region: "sichuan-chongqing" },
  ],
  central: [
    { name: "武汉", tier: "newTier1", region: "central" },
    { name: "郑州", tier: "newTier1", region: "central" },
    { name: "长沙", tier: "newTier1", region: "central" },
    { name: "南昌", tier: "tier2", region: "central" },
    { name: "济南", tier: "tier2", region: "central" },
    { name: "太原", tier: "tier3", region: "central" },
    { name: "洛阳", tier: "tier4plus", region: "central" },
    { name: "襄阳", tier: "tier4plus", region: "central" },
    { name: "宜昌", tier: "tier4plus", region: "central" },
    { name: "赣州", tier: "tier4plus", region: "central" },
    { name: "衡阳", tier: "tier4plus", region: "central" },
  ],
  northeast: [
    { name: "沈阳", tier: "newTier1", region: "northeast" },
    { name: "大连", tier: "tier2", region: "northeast" },
    { name: "哈尔滨", tier: "tier2", region: "northeast" },
    { name: "长春", tier: "tier2", region: "northeast" },
    { name: "鞍山", tier: "tier4plus", region: "northeast" },
    { name: "吉林", tier: "tier4plus", region: "northeast" },
  ],
  northwest: [
    { name: "西安", tier: "newTier1", region: "northwest" },
    { name: "兰州", tier: "tier3", region: "northwest" },
    { name: "西宁", tier: "tier4plus", region: "northwest" },
    { name: "银川", tier: "tier4plus", region: "northwest" },
    { name: "乌鲁木齐", tier: "tier3", region: "northwest" },
  ],
  other: [
    { name: "青岛", tier: "newTier1", region: "other" },
    { name: "南宁", tier: "tier2", region: "other" },
    { name: "海口", tier: "tier3", region: "other" },
    { name: "烟台", tier: "tier3", region: "other" },
    { name: "潍坊", tier: "tier3", region: "other" },
    { name: "桂林", tier: "tier4plus", region: "other" },
    { name: "三亚", tier: "tier4plus", region: "other" },
  ],
};

// 兼容旧代码的城市列表（按线级）
export const citiesByTier: Record<string, string[]> = {
  tier1: ["北京", "上海", "广州", "深圳"],
  newTier1: [
    "成都", "杭州", "武汉", "西安", "苏州", "南京",
    "重庆", "天津", "郑州", "长沙", "东莞", "佛山",
    "宁波", "青岛", "沈阳",
  ],
  tier2: [
    "无锡", "合肥", "昆明", "大连", "厦门", "济南",
    "福州", "哈尔滨", "温州", "石家庄", "南宁", "长春",
    "泉州", "贵阳", "南昌",
  ],
  tier3: [
    "珠海", "惠州", "海口", "金华", "中山", "保定",
    "台州", "绍兴", "烟台", "嘉兴", "太原", "徐州",
    "潍坊", "南通", "扬州",
  ],
  tier4plus: [
    "洛阳", "襄阳", "盐城", "芜湖", "漳州", "湛江",
    "宜昌", "邯郸", "赣州", "衡阳", "桂林", "曲靖",
  ],
};

/**
 * 根据地区和城市线级获取匹配的城市
 * @param allowFallback 是否允许fallback到其他线级（当明确筛选城市线级时应设为false）
 */
export function getCitiesByRegionAndTier(region: string, cityTier: string, allowFallback: boolean = true): CityInfo[] {
  const regionCities = citiesByRegion[region] || citiesByRegion.other;
  const matchingCities = regionCities.filter(city => city.tier === cityTier);

  // 如果不允许fallback或者找到了匹配的城市，直接返回
  if (!allowFallback || matchingCities.length > 0) {
    return matchingCities;
  }

  // 如果该地区没有对应线级的城市，返回相近线级的城市
  // 按优先级尝试相近的线级
  const tierPriority: Record<string, string[]> = {
    tier1: ["newTier1", "tier2", "tier3", "tier4plus"],
    newTier1: ["tier1", "tier2", "tier3", "tier4plus"],
    tier2: ["newTier1", "tier3", "tier1", "tier4plus"],
    tier3: ["tier2", "tier4plus", "newTier1", "tier1"],
    tier4plus: ["tier3", "tier2", "newTier1", "tier1"],
  };

  for (const fallbackTier of tierPriority[cityTier] || []) {
    const fallbackCities = regionCities.filter(city => city.tier === fallbackTier);
    if (fallbackCities.length > 0) {
      return fallbackCities;
    }
  }

  // 如果都没有，返回该地区的所有城市
  return regionCities;
}

/**
 * 获取拥有指定城市线级的地区列表
 */
export function getRegionsWithCityTier(cityTier: string): string[] {
  const regions: string[] = [];
  for (const [region, cities] of Object.entries(citiesByRegion)) {
    if (cities.some(city => city.tier === cityTier)) {
      regions.push(region);
    }
  }
  return regions;
}

// ============================================
// 中文姓名生成数据
// ============================================

export const surnames = [
  "王", "李", "张", "刘", "陈", "杨", "黄", "赵", "吴", "周",
  "徐", "孙", "马", "朱", "胡", "郭", "何", "高", "林", "罗",
  "郑", "梁", "谢", "宋", "唐", "许", "韩", "冯", "邓", "曹",
];

export const maleNames = [
  "伟", "强", "磊", "军", "勇", "杰", "涛", "明", "超", "华",
  "浩", "鹏", "宇", "翔", "辉", "斌", "健", "俊", "波", "亮",
  "志强", "建国", "志明", "文杰", "建华", "国强", "志伟", "海涛",
];

export const femaleNames = [
  "芳", "娟", "敏", "静", "丽", "燕", "艳", "霞", "玲", "萍",
  "红", "梅", "娜", "婷", "莉", "琳", "雪", "颖", "倩", "怡",
  "晓燕", "小红", "丽华", "秀英", "晓丽", "玉兰", "淑芬", "美玲",
];
