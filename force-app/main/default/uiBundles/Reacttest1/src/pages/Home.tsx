import { useState } from 'react';
import { AccountSection } from '../components/ui/account-section';
import { ContactSection } from '../components/ui/contact-section';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  DateFormat,
  OpportunitySection,
  toggleDateFormat,
} from '@/components/ui/opportunities.section';
import { Button } from '@/components/ui';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [dateFormat, setDateFormat] = useState<DateFormat>('yyyy-mm-dd');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Home</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList aria-label="Salesforce object type">
          <TabsTrigger value="Home">Home</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>
        <TabsContent value="Home" className="mt-4">
          <>
            <AccountSection enableSearch={false} enablePagination={false} />
            <ContactSection enableSearch={false} enablePagination={false} />
            <OpportunitySection enablePagination={false} />
          </>
        </TabsContent>
        <TabsContent value="accounts" className="mt-4">
          <AccountSection />
        </TabsContent>
        <TabsContent value="opportunities" className="mt-4">
          <Button onClick={() => setDateFormat(toggleDateFormat)}>
            Change date format
          </Button>
          <OpportunitySection dateFormat={dateFormat} />
        </TabsContent>
        <TabsContent value="contacts" className="mt-4">
          <ContactSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
