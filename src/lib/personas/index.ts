// 维度配置导出
export {
  allDimensions,
  dimensionMap,
  ageRangeDimension,
  genderDimension,
  cityTierDimension,
  incomeLevelDimension,
  educationDimension,
  occupationDimension,
  familyStatusDimension,
  regionDimension,
  citiesByTier,
  type Dimension,
  type DimensionOption,
} from "./dimensions";

// 场景预设导出
export {
  audiencePresets,
  getPresetById,
  getPresetsByTag,
  getAllPresetTags,
  type AudiencePreset,
} from "./presets";

// 角色生成器导出
export {
  generatePersona,
  generatePersonas,
  calculateSampleSize,
} from "./generator";
