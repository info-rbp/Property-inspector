"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDisplay = void 0;
const react_2 = __importDefault(require("react"));
const JsonDisplay = ({ data, title, height = 'h-96' }) => {
    return (<div className="flex flex-col h-full">
      {title && (<div className="bg-slate-800 text-slate-300 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-t-md border-b border-slate-700 flex justify-between items-center">
          <span>{title}</span>
          <span className="text-slate-500">JSON</span>
        </div>)}
      <div className={`bg-slate-900 p-4 overflow-auto custom-scrollbar ${title ? 'rounded-b-md' : 'rounded-md'} ${height}`}>
        <pre className="font-mono text-sm text-blue-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>);
};
exports.JsonDisplay = JsonDisplay;
