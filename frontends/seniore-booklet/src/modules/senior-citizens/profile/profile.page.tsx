import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/sr-tabs';
import { Card } from '@/components/ui/card';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';

export default function ProfilePage() {
  const { user } = useCurrentUser();

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Full Name
                </label>
                <p className="font-medium">
                  {user?.user_metadata?.firstName}{' '}
                  {user?.user_metadata?.middleName}{' '}
                  {user?.user_metadata?.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Age</label>
                <p className="font-medium">{user?.user_metadata?.age}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Contact Number
                </label>
                <p className="font-medium">
                  {user?.user_metadata?.contactNumber}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Health Status
                </label>
                <p className="font-medium">
                  {user?.user_metadata?.healthStatus}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Address</label>
                <p className="font-medium">{user?.user_metadata?.address}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          {/* Add Medical History Content */}
        </TabsContent>

        <TabsContent value="transactions">
          {/* Add Transactions Content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
