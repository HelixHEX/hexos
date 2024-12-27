import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const Navigation = ({ tabId }: { tabId: string }) => {
  const ipcHandle = window.electron.ipcRenderer

  const goBack = (tabId: string) => {
    ipcHandle.send('go-back', { tabId });
  }

  const goForward = (tabId: string) => {
    ipcHandle.send('go-forward', { tabId });
  }
  return (
    <div className="w-[200px] p-2 justify-end items-center flex h-[38px]">
      <Button onClick={() => goBack(tabId)} className='h-[24px] w-8 bg-transparent shadow-none hover:bg-[#eae5e0]' size={'sm'}><ChevronLeft style={{ color: 'black' }} /></Button>
      <Button onClick={() => goForward(tabId)} className='h-[24px] w-8 bg-transparent shadow-none hover:bg-[#eae5e0]' size='sm'><ChevronRight style={{ color: 'black' }} /></Button>
    </ div>
  )
}

export default Navigation;