import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
	return (
		<div className="page-container slide-up fade-in p-8 flex flex-col items-center justify-center h-full">
			<h1 className="text-3xl font-bold mb-4 text-text-primary">Settings</h1>
			<p className="text-lg text-text-secondary mb-8">Customize your Poster experience.</p>

			<div className="empty-state"> {/* Apply empty-state styling */}
				<div className="empty-icon"> {/* Apply empty-icon styling */}
					<Settings size={28} strokeWidth={1} /> {/* Match icon size and stroke from empty-icon */}
				</div>
				<h3 className="empty-title">Coming Soon!</h3> {/* Use empty-title styling */}
				<p className="empty-sub max-w-sm"> {/* Use empty-sub styling and adjust width */}
					We're working hard to bring you more customization options. Stay tuned for updates!
				</p>
			</div>
		</div>
	)
}

export default SettingsPage