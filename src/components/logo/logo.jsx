// components/logo/logo.js
import { useTranslation } from "react-i18next";

const Logo = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center"> {/* Removed justify-center for better alignment */}
      <div className="w-6 h-6 sm:w-8 sm:h-7 md:w-10 md:h-8 border-2 border-blue-100 rounded-md transform skew-x-6 mr-1 sm:mr-2"></div>
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">{t('discovery.title')}</h1>
    </div>
  );
};

export default Logo;