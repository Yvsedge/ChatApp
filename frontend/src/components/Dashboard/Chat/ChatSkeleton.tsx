
export default function ChatSkeleton() {
        return (
        <main className="h-full flex-1 flex flex-col overflow-hidden min-h-0">           
            {/* Messages — scrollable, fills space */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4 min-h-0">
                <div className="flex-grow" />
                {[...Array(6)].map((_, i) => {
                        return (
                            <div key={i} className={`flex ${i%2 ? "justify-end" : "justify-start"}`}>
                                <p className={`
                                    rounded-2xl px-10 py-3 max-w-[65%] text-foreground text-sm
                                    flex justify-center items-center gap-1 bg-bubble-received border border-border animate-pulse`
                                    }
                                    >
                                </p>
                            </div>
                        );
                    })
                }
            </div >
        </main>
    );
}
