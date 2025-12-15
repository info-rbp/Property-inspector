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
exports.AddressAutocompleteInput = void 0;
const react_2 = __importStar(require("react"));
const addressService_1 = require("../services/addressService");
const lucide_react_1 = require("lucide-react");
const AddressAutocompleteInput = ({ value, onChange, onSelect, placeholder = "Search address...", autoFocus = false }) => {
    const [suggestions, setSuggestions] = (0, react_2.useState)([]);
    const [showSuggestions, setShowSuggestions] = (0, react_2.useState)(false);
    const [isLoading, setIsLoading] = (0, react_2.useState)(false);
    const [error, setError] = (0, react_2.useState)(null);
    const containerRef = (0, react_2.useRef)(null);
    const ignoreSearchRef = (0, react_2.useRef)(false);
    (0, react_2.useEffect)(() => {
        if (ignoreSearchRef.current) {
            ignoreSearchRef.current = false;
            return;
        }
        const query = value.trim();
        if (query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            setError(null);
            try {
                const results = await (0, addressService_1.getAddressSuggestions)(query);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            }
            catch (e) {
                setSuggestions([]);
                setError("Could not fetch suggestions");
            }
            finally {
                setIsLoading(false);
            }
        }, 250);
        return () => clearTimeout(timeoutId);
    }, [value]);
    (0, react_2.useEffect)(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleSelect = (s) => {
        ignoreSearchRef.current = true;
        onChange(s.display_name);
        setShowSuggestions(false);
        onSelect(s);
    };
    return (<div className="relative w-full" ref={containerRef}>
      <div className="relative group z-20">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <lucide_react_1.Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
        </div>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} placeholder={placeholder} autoFocus={autoFocus} className={`block w-full pl-11 pr-10 py-4 bg-white border rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-sm transition-all text-base ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'}`}/>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
           {isLoading ? <lucide_react_1.Loader2 className="animate-spin text-blue-500" size={18}/> : <lucide_react_1.MapPin className="text-slate-300" size={18}/>}
        </div>
      </div>

      {error && (<div className="absolute top-full mt-2 w-full text-center text-xs text-red-500 flex items-center justify-center">
            <lucide_react_1.AlertTriangle size={12} className="mr-1"/> {error}
        </div>)}

      {showSuggestions && suggestions.length > 0 && (<div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((suggestion, index) => (<button key={index} onClick={() => handleSelect(suggestion)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start space-x-3 transition-colors border-b border-slate-50 last:border-0">
              <lucide_react_1.MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0"/>
              <span className="text-sm text-slate-700">{suggestion.display_name}</span>
            </button>))}
          <div className="bg-slate-50 px-4 py-2 text-[10px] text-slate-400 text-center uppercase tracking-wider">
            Powered by Google
          </div>
        </div>)}
    </div>);
};
exports.AddressAutocompleteInput = AddressAutocompleteInput;
