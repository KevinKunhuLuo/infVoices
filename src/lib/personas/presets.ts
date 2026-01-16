/**
 * InfVoices 场景预设
 * 预定义的人群筛选配置，方便快速选择目标受众
 */

import type { DimensionConfig, WeightConfig } from "@/lib/supabase";

export interface AudiencePreset {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  dimensions: DimensionConfig;
  weights?: WeightConfig;
  tags: string[];
}

// ============================================
// 场景预设列表
// ============================================

export const audiencePresets: AudiencePreset[] = [
  // 全国代表性样本
  {
    id: "national-representative",
    name: "全国代表性样本",
    description: "按全国人口比例分布的代表性样本，适合全国性调研",
    icon: "Globe",
    dimensions: {}, // 空配置表示使用全部默认权重
    tags: ["全国", "代表性", "基础"],
  },

  // 一线城市年轻白领
  {
    id: "tier1-young-professional",
    name: "一线城市年轻白领",
    description: "25-34岁，一线城市，本科以上学历，互联网/金融行业",
    icon: "Building2",
    dimensions: {
      ageRange: ["25-34"],
      cityTier: ["tier1"],
      education: ["bachelor", "graduate"],
      occupation: ["internet", "finance"],
    },
    tags: ["一线", "年轻", "高收入"],
  },

  // 新一线城市新中产
  {
    id: "new-tier1-middle-class",
    name: "新一线城市新中产",
    description: "30-45岁，新一线城市，已婚有孩，中高收入",
    icon: "Home",
    dimensions: {
      ageRange: ["25-34", "35-44"],
      cityTier: ["newTier1"],
      familyStatus: ["marriedWithKids"],
      incomeLevel: ["mediumHigh", "high"],
    },
    tags: ["新一线", "家庭", "消费升级"],
  },

  // 下沉市场年轻妈妈
  {
    id: "lower-tier-young-mom",
    name: "下沉市场年轻妈妈",
    description: "25-35岁女性，三四线城市，已婚有孩",
    icon: "Baby",
    dimensions: {
      ageRange: ["25-34"],
      gender: ["female"],
      cityTier: ["tier3", "tier4plus"],
      familyStatus: ["marriedWithKids"],
    },
    tags: ["下沉市场", "母婴", "女性"],
  },

  // Z世代大学生
  {
    id: "gen-z-student",
    name: "Z世代大学生",
    description: "18-24岁学生群体，覆盖各线城市",
    icon: "GraduationCap",
    dimensions: {
      ageRange: ["18-24"],
      occupation: ["student"],
    },
    tags: ["Z世代", "学生", "年轻"],
  },

  // 银发族
  {
    id: "silver-generation",
    name: "银发一族",
    description: "55岁以上，已退休或空巢老人",
    icon: "Heart",
    dimensions: {
      ageRange: ["55-64", "65+"],
      familyStatus: ["emptyNest"],
      occupation: ["retired"],
    },
    tags: ["银发", "老年", "退休"],
  },

  // 高端消费人群
  {
    id: "high-end-consumer",
    name: "高端消费人群",
    description: "高收入、高学历，一二线城市精英",
    icon: "Crown",
    dimensions: {
      incomeLevel: ["high"],
      education: ["bachelor", "graduate"],
      cityTier: ["tier1", "newTier1", "tier2"],
    },
    tags: ["高端", "精英", "奢侈品"],
  },

  // 小镇青年
  {
    id: "small-town-youth",
    name: "小镇青年",
    description: "18-30岁，四五线城市及县城青年",
    icon: "MapPin",
    dimensions: {
      ageRange: ["18-24", "25-34"],
      cityTier: ["tier4plus"],
    },
    tags: ["小镇", "青年", "下沉"],
  },

  // 职场新人
  {
    id: "career-starter",
    name: "职场新人",
    description: "25-30岁，刚入职场的年轻人",
    icon: "Briefcase",
    dimensions: {
      ageRange: ["25-34"],
      familyStatus: ["single", "couple"],
    },
    weights: {
      ageRange: { "25-34": 0.8 },
    },
    tags: ["职场", "新人", "单身"],
  },

  // 互联网从业者
  {
    id: "internet-worker",
    name: "互联网从业者",
    description: "互联网/IT行业从业人员",
    icon: "Laptop",
    dimensions: {
      occupation: ["internet"],
      cityTier: ["tier1", "newTier1"],
    },
    tags: ["互联网", "科技", "IT"],
  },

  // 教育决策者
  {
    id: "education-decision-maker",
    name: "教育决策者",
    description: "有学龄子女的家长，关注教育",
    icon: "BookOpen",
    dimensions: {
      ageRange: ["25-34", "35-44"],
      familyStatus: ["marriedWithKids"],
    },
    tags: ["教育", "家长", "K12"],
  },

  // 健康关注人群
  {
    id: "health-conscious",
    name: "健康关注人群",
    description: "35岁以上，关注健康和养生",
    icon: "Activity",
    dimensions: {
      ageRange: ["35-44", "45-54", "55-64"],
    },
    tags: ["健康", "养生", "中年"],
  },
];

// ============================================
// 辅助函数
// ============================================

/**
 * 根据 ID 获取预设
 */
export function getPresetById(id: string): AudiencePreset | undefined {
  return audiencePresets.find((p) => p.id === id);
}

/**
 * 按标签筛选预设
 */
export function getPresetsByTag(tag: string): AudiencePreset[] {
  return audiencePresets.filter((p) => p.tags.includes(tag));
}

/**
 * 获取所有标签
 */
export function getAllPresetTags(): string[] {
  const tags = new Set<string>();
  audiencePresets.forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}
