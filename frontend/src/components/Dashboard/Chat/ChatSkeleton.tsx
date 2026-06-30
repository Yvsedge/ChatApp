import { SendHorizonal } from "lucide-react";

export default function ChatSkeleton() {
        return (
        <main className="h-full flex-1 flex flex-col overflow-hidden min-h-0">

            {/*User Profile*/}
            <div
                className="flex flex-col p-4 bg-surface-secondary border-b border-border"
            >
                <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground text-xs font-semibold">
                        </span>
                    </div>
                    <p></p>
                </div>
            </div>
            
            {/* Messages — scrollable, fills space */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4 min-h-0">
                <div className="flex-grow" />
                {[...Array(6)].map((_, i) => {
                        return (
                            <div key={i} className={`flex ${i%2 ? "justify-end" : "justify-start"}`}>
                                <p className={`
                                    rounded-2xl px-4 py-2 max-w-[65%] text-foreground text-sm
                                    flex justify-center items-center gap-1 bg-bubble-received border border-border animate-pulse`
                                    }
                                    >
                                </p>
                            </div>
                        );
                    })
                }
            </div >

            {/* Input — pinned to bottom */}
            <div 
                className="flex gap-2 px-4 h-[57px] border-t border-border bg-card shrink-0 justify-center items-center animate-pulse"
            >
                <input
                    className="flex-1 bg-surface-secondary border border-border rounded-xl px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary animate-pulse"
                />
                <button
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity animate-pulse"
                >
                    <SendHorizonal/>
                </button>
            </div>
        </main>
    );
}
