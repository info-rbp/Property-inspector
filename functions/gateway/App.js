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
const react_2 = __importStar(require("react"));
const AdminLayout_1 = require("./components/AdminLayout");
const ServiceGrid_1 = require("./components/ServiceGrid");
const TestRunner_1 = require("./components/TestRunner");
const OpsPanel_1 = require("./components/OpsPanel");
function App() {
    const [view, setView] = (0, react_2.useState)('dashboard');
    const [selectedService, setSelectedService] = (0, react_2.useState)(null);
    const handleNavigate = (newView) => {
        setView(newView);
        setSelectedService(null);
    };
    const renderContent = () => {
        switch (view) {
            case 'dashboard':
                return <ServiceGrid_1.ServiceGrid onSelectService={(name) => { console.log('Selected', name); }}/>;
            case 'tests':
                return <TestRunner_1.TestRunner />;
            case 'tenants':
            case 'ops':
                return <OpsPanel_1.OpsPanel />;
            default:
                return <ServiceGrid_1.ServiceGrid onSelectService={() => { }}/>;
        }
    };
    return (<AdminLayout_1.AdminLayout currentView={view} onNavigate={handleNavigate}>
      {renderContent()}
    </AdminLayout_1.AdminLayout>);
}
