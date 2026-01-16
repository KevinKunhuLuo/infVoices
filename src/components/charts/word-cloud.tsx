"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordCloudItem {
  text: string;
  count: number;
}

interface WordCloudProps {
  data: WordCloudItem[];
  maxWords?: number;
  className?: string;
  colorScheme?: "primary" | "gradient" | "neutral";
}

// 颜色方案
const COLOR_SCHEMES = {
  primary: [
    "text-primary",
    "text-primary/90",
    "text-primary/80",
    "text-primary/70",
    "text-primary/60",
  ],
  gradient: [
    "text-violet-500",
    "text-blue-500",
    "text-cyan-500",
    "text-emerald-500",
    "text-amber-500",
  ],
  neutral: [
    "text-foreground",
    "text-foreground/90",
    "text-foreground/80",
    "text-foreground/70",
    "text-foreground/60",
  ],
};

export function WordCloud({
  data,
  maxWords = 30,
  className,
  colorScheme = "primary",
}: WordCloudProps) {
  // 处理数据，计算字体大小
  const processedData = useMemo(() => {
    if (data.length === 0) return [];

    // 按频率排序并限制数量
    const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, maxWords);

    if (sorted.length === 0) return [];

    // 计算最大和最小频率
    const maxCount = sorted[0].count;
    const minCount = sorted[sorted.length - 1].count;
    const range = maxCount - minCount || 1;

    // 字体大小范围 (rem)
    const minSize = 0.75;
    const maxSize = 2.5;

    // 计算每个词的大小和颜色
    return sorted.map((item, index) => {
      const normalizedCount = (item.count - minCount) / range;
      const size = minSize + normalizedCount * (maxSize - minSize);
      const colorIndex = Math.min(
        Math.floor((1 - normalizedCount) * COLOR_SCHEMES[colorScheme].length),
        COLOR_SCHEMES[colorScheme].length - 1
      );

      return {
        ...item,
        size,
        colorClass: COLOR_SCHEMES[colorScheme][colorIndex],
        delay: index * 0.02,
      };
    });
  }, [data, maxWords, colorScheme]);

  // 打乱顺序以获得更好的视觉效果
  const shuffledData = useMemo(() => {
    const arr = [...processedData];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [processedData]);

  if (shuffledData.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[200px] text-muted-foreground", className)}>
        暂无数据
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 p-4 min-h-[200px]",
        className
      )}
    >
      {shuffledData.map((word, index) => (
        <motion.span
          key={word.text}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: word.delay,
            type: "spring",
            stiffness: 200,
          }}
          className={cn(
            "inline-block font-medium hover:scale-110 transition-transform cursor-default",
            word.colorClass
          )}
          style={{ fontSize: `${word.size}rem` }}
          title={`${word.text}: ${word.count}次`}
        >
          {word.text}
        </motion.span>
      ))}
    </div>
  );
}

// 从文本中提取词云数据
export function extractWordsFromTexts(texts: string[], minLength = 2): WordCloudItem[] {
  const wordCounts: Record<string, number> = {};

  texts.forEach((text) => {
    if (!text) return;

    // 中文分词（简单按字符分割，提取连续中文）+ 英文单词
    const words = text.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g) || [];

    words.forEach((word) => {
      if (word.length >= minLength) {
        const lowerWord = word.toLowerCase();
        wordCounts[lowerWord] = (wordCounts[lowerWord] || 0) + 1;
      }
    });
  });

  // 过滤停用词
  const stopWords = new Set([
    "的", "了", "是", "在", "和", "有", "我", "他", "她", "它",
    "这", "那", "就", "也", "不", "都", "很", "但", "还", "又",
    "被", "把", "将", "与", "或", "及", "等", "中", "为", "以",
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "can", "must",
    "and", "or", "but", "if", "then", "else", "when", "where",
    "what", "which", "who", "whom", "this", "that", "these",
    "those", "it", "its", "of", "to", "for", "with", "on", "at",
    "by", "from", "as", "into", "through", "during", "before",
    "after", "above", "below", "between", "under", "again",
  ]);

  return Object.entries(wordCounts)
    .filter(([word]) => !stopWords.has(word))
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count);
}
