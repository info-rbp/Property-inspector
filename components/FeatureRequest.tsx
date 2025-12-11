import React from 'react';
import { Lightbulb, Send, MessageSquarePlus } from 'lucide-react';

const FeatureRequest: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Request a Feature</h1>
        <p className="text-gray-500 mt-2">Have an idea to improve the platform? Let us know!</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <form className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feature Title</label>
                <input 
                    type="text" 
                    placeholder="e.g. Dark Mode Support" 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                    placeholder="Describe functionality you'd like to see..." 
                    className="w-full h-32 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Be as specific as possible about how this would help your workflow.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option>General Improvement</option>
                        <option>New Report Type</option>
                        <option>AI Capabilities</option>
                        <option>User Interface</option>
                        <option>Bug Fix</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option>Low - Nice to have</option>
                        <option>Medium - Important</option>
                        <option>High - Critical</option>
                    </select>
                </div>
            </div>

            <div className="pt-4">
                <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
                    <Send size={20} /> Submit Request
                </button>
            </div>
        </form>
      </div>
      
      <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <MessageSquarePlus size={16} />
              We review all requests weekly. Thank you for your feedback!
          </p>
      </div>
    </div>
  );
};

export default FeatureRequest;