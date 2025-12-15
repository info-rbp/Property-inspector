"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_2 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const App_1 = __importDefault(require("./App"));
const store_1 = require("./state/store");
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}
const root = client_1.default.createRoot(rootElement);
root.render(<react_2.default.StrictMode>
    <store_1.StoreProvider>
      <App_1.default />
    </store_1.StoreProvider>
  </react_2.default.StrictMode>);
