import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-blue-500 rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-300">KodzenIdiaa</span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Yapay zeka destekli iddaa tahmin platformu. Tahminler bilgi amaclidir, yatirim tavsiyesi degildir.
          </p>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Kodzen
          </p>
        </div>
      </div>
    </footer>
  );
}
