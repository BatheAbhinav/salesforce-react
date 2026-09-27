import { useState } from "react";
import { AccountSection } from "../components/ui/account-section";
import { ContactSection } from "../components/ui/contact-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function HomePage() {
	const [activeTab, setActiveTab] = useState("accounts");

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<h1 className="text-2xl font-bold mb-6">Accounts and contacts</h1>
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="mt-6"
			>
				<TabsList aria-label="Salesforce object type">
					<TabsTrigger value="accounts">Accounts</TabsTrigger>
					<TabsTrigger value="contacts">Contacts</TabsTrigger>
				</TabsList>
				<TabsContent value="accounts" className="mt-4">
					<AccountSection />
				</TabsContent>
				<TabsContent value="contacts" className="mt-4">
					<ContactSection />
				</TabsContent>
			</Tabs>
		</div>
	);
}