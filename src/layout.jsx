import { Routes, Route, Outlet } from 'react-router-dom';

import ProfileCard from './components/ProfileCard';
import GeminiAssistant from './components/gemini/GeminiAssistant';

export default function Layout() {
    return (    
        <div className='p-4'>
            <div className='flex gap-10'>
                <aside className='w-[15%]'>
                    <ProfileCard />
                </aside>

                <main className='w-[85%]'>
                    <Outlet />
                </main>

                <GeminiAssistant />

            </div>
        </div>
    )
}