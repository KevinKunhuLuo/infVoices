"use client";

import { motion } from "framer-motion";
import {
  CircleDot,
  CheckSquare,
  SlidersHorizontal,
  Text,
  Images,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { QuestionType } from "@/lib/survey";
import { questionTypeConfigs } from "@/lib/survey";

interface QuestionTypePickerProps {
  onSelect: (type: QuestionType) => void;
}

const iconMap = {
  "circle-dot": CircleDot,
  "check-square": CheckSquare,
  "sliders-horizontal": SlidersHorizontal,
  text: Text,
  images: Images,
  lightbulb: Lightbulb,
};

export function QuestionTypePicker({ onSelect }: QuestionTypePickerProps) {
  const types = Object.values(questionTypeConfigs);

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {types.map((config) => {
        const Icon = iconMap[config.icon as keyof typeof iconMap];

        return (
          <motion.div key={config.type} variants={staggerItem}>
            <Card
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
                "border-2 border-transparent hover:border-primary/30"
              )}
              onClick={() => onSelect(config.type)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      config.color
                    )}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">{config.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
