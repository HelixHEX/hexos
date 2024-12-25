import { useEffect, useState } from 'react';
import type { ClientTab } from '../../types';
import './assets/app.css';
import { useHotkeys } from 'react-hotkeys-hook'
import { Input } from './components/ui/input';
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

  return (
    <div className='main' style={{ width: '100%', display: 'flex', paddingTop: 40, height: '100vh', backgroundColor: '#FCEADE' }}>

      <div className="sidebar" style={{ color: 'white', backgroundColor: '#FCEADE', height: '100%', width: 200 }}>
        <form onSubmit={addTab}>
          <Input className='w-full' style={{ width: '90%', padding: 6, justifySelf: 'center' }} value={search} onChange={e => setSearch(e.target.value)} />

        </form>
        {/* <button type='button' onClick={addTab} className="add-tab-btn">
          search
        </button> */}
        <ul className='no-bullets'>
          {tabs.map((tab) => (
            //biome-ignore lint:
            <li
              key={tab.id}
              className={'tab'}
              style={{ backgroundColor: tab.isActive ? '#fcfcfc' : '#FCEADE' }}
              onClick={() => switchTab(tab.id)}
            >
              {tab.url}
            </li>
          ))}
        </ul>



      </div>

    </div>
  )
}

export default App
