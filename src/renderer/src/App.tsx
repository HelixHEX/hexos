import { useEffect, useState } from 'react';
import type { ClientTab } from '../../types';

const getTabs = async (): Promise<ClientTab[]> => {
  const res = await window.tabsApi.getTabs()
  return res
}

function App(): JSX.Element {
  const ipcHandle = window.electron.ipcRenderer
  const [tabs, setTabs] = useState<ClientTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [filePath, setFilePath] = useState('');
  useEffect(() => {
    const main = async () => {
      const res = await getTabs();
      setTabs(res)
      const activeTab = res.find(tab => tab.isActive)
      setActiveTab(activeTab.id)
    };
    main();
  }, [])
  // useEffect(() => {
  //   const main = async () => {
  //     //biome-ignore lint:
  //     const tabsFromElectron = await ipcHandle.send('get-tabs') as any;
  //     console.log(tabsFromElectron)
  //   }
  //   main()
  // }, [ipcHandle.send])

  const addTab = async () => {
    ipcHandle.send('create-tab', { url: 'https://bettrdash.com', windowId: tabs[0].windowId });
    const newTabs = await getTabs();
    setTabs(newTabs)
  };

  const switchTab = async (tabId: string) => {
    setActiveTab(tabId);
    ipcHandle.send('switch-tab', { tabId });
    const res = await getTabs();
    setTabs(res)

  };

  return (
    <>
      <div className="app-container">
        <div className="sidebar" style={{ color: 'white' }}>
          <ul>
            {tabs.map((tab) => (
              //biome-ignore lint:
              <li
                key={tab.id}
                className={'text-white'}
                style={{ color: tab.isActive ? 'red' : 'white' }}

                onClick={() => switchTab(tab.id)}
              >
                {tab.url}
              </li>
            ))}
          </ul>
          {/* biome-ignore lint: */}
          <button onClick={addTab} className="add-tab-btn">
            + Add Tab
          </button>
        </div>
      </div>
    </>
  )
}

export default App
