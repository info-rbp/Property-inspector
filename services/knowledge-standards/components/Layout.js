"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
const react_2 = __importDefault(require("react"));
const Navigation_1 = require("./Navigation");
const Layout = ({ children, currentView, onChangeView, title, actions }) => {
    return (<div className="min-h-screen bg-slate-50 pl-64">
      <Navigation_1.Navigation currentView={currentView} onChangeView={onChangeView}/>
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">Versioned Standards Management</p>
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </header>

      <main className="p-8">
        {children}
      </main>
    </div>);
};
exports.Layout = Layout;
