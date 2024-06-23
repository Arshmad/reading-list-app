import { Navbar } from "./Navbar"

export const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="realtive min-h-screen bg-background">
			<Navbar />
			<main className="p-4 sm:px-8 lg:px-44">
                <div className="max-w-3xl mx-auto space-y-20">
                    {children}
                    </div>
            </main>
		</div>
	)
}