// 添加必要的类型声明
declare module 'js-yaml' {
  export function dump(obj: any, options?: any): string;
  export function load(str: string, options?: any): any;
}
