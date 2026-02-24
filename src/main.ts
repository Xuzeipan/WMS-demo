// import "~/styles/element/index.scss";

import ElementPlus from "element-plus";
// import all element css, uncommented next line
import "element-plus/dist/index.css";

// or use cdn, uncomment cdn link in `index.html`

import App from "./App.vue";
import router from "./router/index";

import "~/styles/index.scss";

import "uno.css";
// If you want to use ElMessage, import it.
import "element-plus/theme-chalk/src/message.scss";
import "element-plus/theme-chalk/src/message-box.scss";
import "element-plus/theme-chalk/src/overlay.scss"; // the modal class for message box

// if you do not need ssg:
import { createApp } from "vue";
import { createPinia } from "pinia";
import { ElMessage } from "element-plus";

const pinia = createPinia();
const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(ElementPlus);

// 全局挂载ElMessage
app.config.globalProperties.$message = ElMessage;

app.mount("#app");
