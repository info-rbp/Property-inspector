"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = __importStar(require("react"));
const Dashboard_1 = require("./views/Dashboard");
const StandardsManager_1 = require("./views/StandardsManager");
const Simulator_1 = require("./views/Simulator");
const types_1 = require("./types");
function App() {
    const [currentView, setCurrentView] = (0, react_1.useState)('dashboard');
    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard_1.Dashboard onChangeView={setCurrentView}/>;
            case 'defects':
                return <StandardsManager_1.StandardsManager type={types_1.StandardType.DEFECT} title="Defect Taxonomy" currentView={currentView} onChangeView={setCurrentView}/>;
            case 'severity':
                return <StandardsManager_1.StandardsManager type={types_1.StandardType.SEVERITY} title="Severity Rules" currentView={currentView} onChangeView={setCurrentView}/>;
            case 'rooms':
                return <StandardsManager_1.StandardsManager type={types_1.StandardType.ROOM} title="Room Standards" currentView={currentView} onChangeView={setCurrentView}/>;
            case 'phrasing':
                return <StandardsManager_1.StandardsManager type={types_1.StandardType.PHRASING} title="Approved Phrasing" currentView={currentView} onChangeView={setCurrentView}/>;
            case 'guardrails':
                return <StandardsManager_1.StandardsManager type={types_1.StandardType.GUARDRAIL} title="Analysis Guardrails" currentView={currentView} onChangeView={setCurrentView}/>;
            case 'simulator':
                return <Simulator_1.Simulator onChangeView={setCurrentView}/>;
            default:
                return <Dashboard_1.Dashboard onChangeView={setCurrentView}/>;
        }
    };
    return (<div className="text-slate-800 font-sans">
            {renderView()}
        </div>);
}
