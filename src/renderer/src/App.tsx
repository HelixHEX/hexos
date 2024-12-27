import { useEffect, useState } from 'react';
import type { ClientTab } from '../../types';
import './assets/App.css';
import { useHotkeys } from 'react-hotkeys-hook'
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import WebViewBackground from './components/webView';
import Navigation from './components/navigation';
// import { Input } from './components/ui/input';

const getTabs = async (): Promise<ClientTab[]> => {
  const res = await window.tabsApi.getTabs()
  return res
}

function App(): JSX.Element {
  const ipcHandle = window.electron.ipcRenderer
  const [search, setSearch] = useState('');
  const [tabs, setTabs] = useState<ClientTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [filePath, setFilePath] = useState('');

  // useHotkeys('ctrl+t', () => setCount(count + 1), [count])

  useEffect(() => {
    const main = async () => {
      const res = await getTabs();
      setTabs(res)
      const activeTab = res.find(tab => tab.isActive)
      setActiveTab(activeTab.id)
      setSearch(res.find(tab => tab.isActive)?.url || "")
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

  const addTab = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    let url = search;

    const domainExtensionRegex = /\.[a-z]{2,}$/i;

    if (!domainExtensionRegex.test(url)) {
      // If there is no domain extension, construct a Google search URL
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    } else {
      // If there is a domain extension, check for http or https
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
    }

    ipcHandle.send('create-tab', { url, windowId: tabs[0].windowId });
    const newTabs = await getTabs();
    setTabs(newTabs)
    setSearch(url)
  };



  const switchTab = async (tabId: string) => {
    setActiveTab(tabId);
    ipcHandle.send('switch-tab', { tabId });
    const res = await getTabs();
    setTabs(res)
    setSearch(res.find(tab => tab.isActive)?.url || "")
  };

  useEffect(() => {
    console.log(tabs)
  }, [tabs])

  const handleKeyDown = (tabId: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      switchTab(tabId);
    }
  };

  return (
    <div className='w-full flex h-screen bg-[#f5f0ea]'>
      <div className='h-full'>
        <Navigation tabId={activeTab} />
        <div className=" w-[200px] p-2 ">
          <form onSubmit={addTab}>
            <Input className='bg-[#eae3de] border-none' value={search} onChange={e => setSearch(e.target.value)} />
          </form>
          <ul className='no-bullets'>
            {tabs.map((tab) => (
              <li key={tab.id}>
                <Button
                  type="button"
                  className={`shadow-none rounded-lg text-black mt-2 ${tab.isActive ? 'hover:bg-[#f6f6f5] shadow-sm' : 'hover:bg-[#eae5e0]'}  ${tab.isActive ? 'bg-[#f6f6f5]' : 'bg-[#f5efe8]'}`}
                  onClick={() => switchTab(tab.id)}
                  onKeyDown={handleKeyDown(tab.id)}
                  role="tab"
                  aria-selected={tab.isActive}
                >
                  {tab.url}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* <WebViewBackground /> */}
    </div>
  )
}

export default App
