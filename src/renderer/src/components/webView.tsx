import useDimensions from "@renderer/lib/dimensions";
import electron from "electron";
import { useEffect, useState } from "react";
const WebViewBackground = () => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // const { width, height } = useDimensions();
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  // const screenElectron = electron.screen;
  // const mainScreen = screenElectron.getPrimaryDisplay();
  // const { width, height } = mainScreen.bounds;
  return <div className={" pr-[10px] pt-[10px] pb-[280px] w-full h-full"}><div className="bg-blue-400 pt-[30px] w-full h-full">{dimensions.width}x{dimensions.height}</div></div>
}

export default WebViewBackground