// components/logo/logo.js
import { useTranslation } from "react-i18next";

const Logo2 = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center mb-4 justify-center"> {/* Added justify-center */}
      <div className="w-10 h-8 border-2 border-blue-500 rounded-md transform skew-x-6 mr-2"></div> {/* Rectangle with
    radius and skew */}
      <h1 className="text-2xl font-bold text-gray-800">{t('discovery.title')}</h1>
    </div>
  );
};

export default Logo2;