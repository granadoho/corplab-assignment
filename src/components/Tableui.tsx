import React from 'react'
import Table from './Table'

const Tableui = () => {
    return (
        <main className="bg-black flex justify-center items-center pt-10 min-h-screen">
            <div className="flex flex-col self-center justify-center items-stretch w-full max-w-[1440px]">
                <Table />
            </div>
        </main>
    )
}

export default Tableui
