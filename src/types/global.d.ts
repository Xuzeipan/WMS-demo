import 'vue';

declare module 'vue' {
  interface ComponentCustomProperties {
    $message: typeof import('element-plus')['ElMessage'];
  }
}
