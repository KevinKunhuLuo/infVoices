/**
 * InfVoices 人口维度配置
 * 基于第七次全国人口普查数据（2020年）
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
// 城市示例数据（用于生成角色）
// ============================================

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
