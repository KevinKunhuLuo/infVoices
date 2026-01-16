/**
 * InfVoices Motion System
 * Framer Motion 动效预设配置
 */

import { type Variants, type Transition } from "framer-motion";

// ============================================
// Timing Curves
// ============================================

export const easings = {
  // 默认缓动 - 平滑自然
  default: [0.25, 0.1, 0.25, 1],
  // 强调入场
  easeOut: [0, 0, 0.2, 1],
  // 强调出场
  easeIn: [0.4, 0, 1, 1],
  // 弹性效果
  spring: [0.175, 0.885, 0.32, 1.275],
  // 柔和弹性
  softSpring: [0.34, 1.56, 0.64, 1],
} as const;

// ============================================
// Duration Tokens
// ============================================

export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

// ============================================
// Transition Presets
// ============================================

export const transitions = {
  default: {
    duration: durations.normal,
    ease: easings.default,
  } as Transition,

  fast: {
    duration: durations.fast,
    ease: easings.default,
  } as Transition,

  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30,
  } as Transition,

  springBouncy: {
    type: "spring",
    stiffness: 300,
    damping: 20,
  } as Transition,

  springGentle: {
    type: "spring",
    stiffness: 200,
    damping: 25,
  } as Transition,
} as const;

// ============================================
// Animation Variants
// ============================================

/**
 * 淡入动画
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

/**
 * 从下方淡入滑入
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: transitions.fast,
  },
};

/**
 * 从上方淡入滑入
 */
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

/**
 * 从左侧淡入滑入
 */
export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: transitions.fast,
  },
};

/**
 * 从右侧淡入滑入
 */
export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: transitions.fast,
  },
};

/**
 * 缩放淡入
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: transitions.fast,
  },
};

/**
 * 弹出效果（用于 Modal、Popover）
 */
export const popIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * 卡片悬浮效果
 */
export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: transitions.springGentle,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: transitions.springBouncy,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

/**
 * 按钮悬浮效果
 */
export const buttonHover: Variants = {
  rest: {
    scale: 1,
    transition: transitions.fast,
  },
  hover: {
    scale: 1.02,
    transition: transitions.springBouncy,
  },
  tap: {
    scale: 0.96,
    transition: { duration: 0.1 },
  },
};

/**
 * 列表项交错动画容器
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * 列表项动画
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
};

/**
 * 页面切换动画
 */
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.3,
      ease: easings.easeIn,
    },
  },
};

/**
 * 脉冲动画（用于加载状态）
 */
export const pulse: Variants = {
  rest: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * 涟漪扩散动画（InfVoices 特色）
 */
export const rippleExpand: Variants = {
  hidden: {
    scale: 0,
    opacity: 0.6,
  },
  visible: {
    scale: 2.5,
    opacity: 0,
    transition: {
      duration: 1,
      ease: easings.easeOut,
    },
  },
};

/**
 * 声波动画（InfVoices 特色）
 */
export const soundWave: Variants = {
  rest: {
    scaleY: 0.3,
  },
  active: {
    scaleY: [0.3, 1, 0.5, 0.8, 0.3],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================
// Utility Functions
// ============================================

/**
 * 创建交错动画延迟
 */
export function staggerDelay(index: number, baseDelay = 0.05): number {
  return index * baseDelay;
}

/**
 * 创建带延迟的 transition
 */
export function withDelay(transition: Transition, delay: number): Transition {
  return { ...transition, delay };
}
