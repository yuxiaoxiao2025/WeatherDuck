import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并Tailwind CSS类名的工具函数
 * 使用clsx处理条件类名，使用tailwind-merge处理冲突的Tailwind类
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}